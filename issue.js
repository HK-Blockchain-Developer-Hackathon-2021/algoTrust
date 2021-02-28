const algosdk = require('algosdk');

var client = null;
async function setupClient() {
    if (client == null) {
        const algosdk = require('algosdk');
        const baseServer = 'https://testnet-algorand.api.purestake.io/ps2'
        const port = '';
        const token = {
            'X-API-Key': 'oDREhlbnSE57kEK5cprrW2CoXwQRiVb11ML0H1H5'
        }
        let algodClient = new algosdk.Algodv2(token, baseServer, port);
        client = algodClient;
    } else {
        return client;
    }
    return client;
}
// recover first account
function recoverAccount1() {
    const passphrase = "auction bitter wreck party coil either soon hotel truth supreme match monster decide senior ship unfold pluck praise spice denial swing sheriff state ability security";
    let myAccount = algosdk.mnemonicToSecretKey(passphrase);
    return myAccount;
}
// function used to wait for a tx confirmation
const waitForConfirmation = async function (algodClient, txId) {
    let status = (await algodClient.status().do());
    let lastRound = status["last-round"];
    while (true) {
        const pendingInfo = await algodClient.pendingTransactionInformation(txId).do();
        if (pendingInfo["confirmed-round"] !== null && pendingInfo["confirmed-round"] > 0) {
            //Got the completed Transaction
            console.log("Transaction " + txId + " confirmed in round " + pendingInfo["confirmed-round"]);
            break;
        }
        lastRound++;
        await algodClient.statusAfterBlock(lastRound).do();
    }
};
async function submitGroupTransactions() {

    const merkleRoot = "68eb43125222b70b574490adc8de8d6722b0dd744fba40ac57cd42afdf0da911"

    try {

        // create logic sig
        var fs = require('fs'),

            filePath = 'smart_contract.teal';
        // filePath = path.join(__dirname, '<PLACEHOLDER>');       
        let data = fs.readFileSync(filePath);
        let algodClient = await setupClient();
        let results = await algodClient.compile(data).do();
        console.log("Hash = " + results.hash);
        console.log("Result = " + results.result);
        // let program = new Uint8Array(Buffer.from("base64-encoded-program" < PLACEHOLDER >, "base64"));
        let program = new Uint8Array(Buffer.from(results.result, "base64"));


        // sample show account A to C
        // B to A 
        // grouped


        // recover account
        // Account A
        let sender = await recoverAccount1();
        console.log("Sender address: %s", sender.addr)

        // get suggested params from the network
        let params = await algodClient.getTransactionParams().do();
        let lsig = algosdk.makeLogicSig(program);
        let smartContractAddr = lsig.address();
        // stores merkel root of file
        let note = algosdk.encodeObj(merkleRoot);
        // Transaction A to B
        let transaction1 = algosdk.makePaymentTxnWithSuggestedParams(sender.addr, smartContractAddr, 0, undefined, note, params);
        // Create transaction B to A
        let transaction2 = algosdk.makePaymentTxnWithSuggestedParams(smartContractAddr, smartContractAddr, 0, undefined, undefined, params);

        // Store both transactions
        let txns = [transaction1, transaction2];

        // Group both transactions
        let txgroup = algosdk.assignGroupID(txns);

        // Sign each transaction in the group 
        // what is programs

        let signedTx1 = transaction1.signTxn(sender.sk)
        let rawSignedTxn = algosdk.signLogicSigTransactionObject(transaction2, lsig);

        // Combine the signed transactions
        let signed = []

        signed.push(signedTx1)
        signed.push(rawSignedTxn.blob);

        let tx = (await algodClient.sendRawTransaction(signed).do());
        console.log("Transaction : " + tx.txId);

        // Wait for transaction to be confirmed
        await waitForConfirmation(algodClient, tx.txId)
    } catch (err) {
        console.log("err", err);
    }
}

submitGroupTransactions();