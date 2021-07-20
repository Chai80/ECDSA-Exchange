import "./index.scss";
var EC = require('elliptic').ec;
var ec = new EC('secp256k1');
const SHA256 = require('crypto-js/SHA256');

const server = "http://localhost:3042";

document.getElementById("exchange-address").addEventListener('input', ({ target: {value} }) => {
  if(value === "") {
    document.getElementById("balance").innerHTML = 0;
    return;
  }

  fetch(`${server}/balance/${value}`).then((response) => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});


document.getElementById("transfer-amount").addEventListener('click', () => {

  //Gets information of the user from the front End
  const sender = document.getElementById("exchange-address").value;
  const amount = document.getElementById("send-amount").value;
  const recipient = document.getElementById("recipient").value;

  //Obtain privateKey from frontEnd of application
  const privateKey = document.getElementById("private-key").value;

  const transaction = {
    amount, recipient
  }

  //Import privateKey
  const key = ec.keyFromPrivate(privateKey, 'hex')

  //Signs the transaction with the privateKey imported
  const signature = key.sign(SHA256(JSON.stringify(transaction)).toString());

  //Incorporates both transaction parameters and a signature in the body request
  //A request body is data sent by the client to your API
  const body = JSON.stringify({
    transaction, signature: signature.toDER('hex'), publicKey: key.getPublic().encode('hex')
  });


  const request = new Request(`${server}/send`, { method: 'POST', body });

  fetch(request, { headers: { 'Content-Type': 'application/json' }}).then(response => {
    return response.json();
  }).then(({ balance }) => {
    document.getElementById("balance").innerHTML = balance;
  });
});
