const { wrapDocument } = require("@govtechsg/open-attestation");
const document = require("./document/document.json");
const util = require("util");

function wrap() {
  const wrappedDocument = wrapDocument(document);

  console.log(util.inspect(wrappedDocument, { showHidden: false, depth: null }));
}

wrap();