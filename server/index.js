const express = require('express');
const app = express();
const cors = require('cors');
const port = 3042;

// localhost can have cross origin errors
// depending on the browser you use!
app.use(cors());
app.use(express.json());

//Initializes EC context
//npm i elliptic
//npm install --save sha256
//npm install -g nodemon

const SHA256 = require('crypto-js/SHA256');
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');

const balances = {}
const keys = {}

for(let i = 0; i < 5 ; i++){
  //Generate Keys for different addresses
  var key = ec.genKeyPair();

  var pubPoint = key.getPublic();

  //Private Key Creation
  const privateKey = key.getPrivate('hex');

  //Public Key Creation
  const publicKey = key.getPublic().encode('hex');
  //set balance
  balances[publicKey] = 100;
  keys[publicKey] = publicKey.toString(16)

  console.log({
    privateKey: privateKey,
    publicKey: publicKey,
    balances: balances[publicKey],
  });
}

app.get('/balance/:address', (req, res) => {
  const {address} = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post('/send', (req, res) => {
  //Requests this information from body function client side
  const {publicKey, signature, transaction} = req.body;
  //From the body request, publicKey is already 'hex'. Do we need to define the key in hex at the bottom below?

//Server verifies if the digital signature from the transaction is correct
  const key = ec.keyFromPublic(publicKey, 'hex');
  const isVerified = key.verify(SHA256(JSON.stringify(transaction)).toString(), signature);
  if(isVerified) {

    balances[publicKey] -= transaction.amount;
    balances[transaction.recipient] = (balances[transaction.recipient] || 0) + +transaction.amount ;
    res.send({ balance: balances[publicKey] });

  }
  else{
    res.send(200, {"result": false})
  }

});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});
