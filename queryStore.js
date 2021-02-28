const axios = require('axios');

async function queryStore(merkleRoot) {
  try {
    let url = "https://testnet-algorand.api.purestake.io/idx2/v2/accounts/" +
      "MCFREJVKARKN7TK6L3UMU3FFK4X7YRATDANVSYFGBYGMWINSHLE5SSCOWY" + 
      "/transactions"

    console.log("Finding a match for : ", merkleRoot);

    const response = await axios.get(
      url,
      { headers: { 'X-API-Key': "YsLnq7HYTJ3pt0CRx1chN1zfAdKIWMjc7sqnr4wl" }}
    );

    txnData = response.data.transactions;

    for(let txn of txnData) {
      if (!txn.note) continue;

      let decoded = Buffer.from(txn.note, 'base64').toString('utf-8').slice(2);

      if (decoded === merkleRoot) {
        console.log("Success ! There is a match.")
        return true;
      }

    }

    return false;

  } 
  catch (err) {
    console.log(err);
    return false;
  }
}

module.exports = queryStore;