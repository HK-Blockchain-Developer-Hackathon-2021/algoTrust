const wrapped_document = require("./document/wrapped.json");
const queryStore = require('./queryStore.js')
const { getData,verifySignature } = require("@govtechsg/open-attestation");

const customVerifier = {
  skip: async () => {
    return {
      status: "SKIPPED",
      type: "DOCUMENT_INTEGRITY",
      name: "CustomVerifier",
      reason: {
        code: 0,
        codeString: "SKIPPED",
        message: `Document doesn't have version equal to 'https://schema.openattestation.com/2.0/schema.json'`
      }
    };
  },
  test: () => wrapped_document.version === "https://schema.openattestation.com/2.0/schema.json",
  verify: async (wrapped_document) => {
    var isTampered = verifySignature(wrapped_document) !== true;
    const documentData = getData(wrapped_document);

    if (isTampered) {
      console.log("Error : Document is tampered")
      return false;
    }

    const merkleRoot = wrapped_document.signature.merkleRoot;
    const isFound = queryStore(merkleRoot);

    if (!isFound) {
      console.log("Error : Cannot find the document in Document Store.");
      return false;
    }

    console.log("Success ! The document is verified.");
    console.log("document data : ", documentData);

    return true;
  }
};

const customVerificationBuilder  = () =>{
  if (customVerifier.test(wrapped_document)) {
    if (!customVerifier.verify(wrapped_document))
      return false; 
  }
  customVerifier.skip(wrapped_document);

  return true;
}

customVerificationBuilder();

