const { create } = require("ipfs-http-client");//importing ipfs library ~ "create"
var now = new Date();//timestamp generating function
var express = require('express');
var Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');

var app = express();
var port = process.env.PORT || 3000;

var SmartContractAddress = "0xc123AD8B0Ffd445834bfBFbB6626c4cE031509a6";//deployed smart contract address 
var SmartContractABI =[
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_key",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_value",
				"type": "string"
			}
		],
		"name": "add",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "useremail",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "hash",
				"type": "string"
			}
		],
		"name": "pushArray",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_key",
				"type": "string"
			}
		],
		"name": "remove",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_key",
				"type": "string"
			}
		],
		"name": "contains",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "useremail",
				"type": "string"
			}
		],
		"name": "GetArray",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_key",
				"type": "string"
			}
		],
		"name": "getByKey",
		"outputs": [
			{
				"internalType": "string",
				"name": "",
				"type": "string"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

var address = "0x371D2D227eBbf5CC59EF9a00d5009f0B7c51A765" //Metamask Ropsten test net Account from which transactions are done 
var privatekey = "a573b5949b898f0ee917afdf6107b7d53e985f44fbefe145bb98ded56c3fd51f"; //Account private key 
var rpcurl = "HTTP://127.0.0.1:7545"; //ropsten URL 
var now = new Date();
var timestamp = now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds() + "  " + now.getDate() + "-" + (now.getMonth() + 1) + "-" + now.getFullYear();
var t = 100;
var h = 101;
var l = 102;
var lon = 103;

//CARGO DATA IN JSON FORMAT 
var userid="1000000@gmail.com"
var input2 = [
  {
    'temperature': t,
    'humidity': h,
    'Latitude': l,
    'Longitude': lon,
    'TimeStamp': timestamp
  }]
// var prevdata=[{"temperature":1,"humidity":2,"Latitude":3,"Longitude":4,"TimeStamp":"23:51:6  20-3-2022"},
// [{"temperature":100,"humidity":150,"Latitude":300,"Longitude":400,"TimeStamp":"23:51:6  20-3-2022"}]]

//creating Infura node for IPFS 

async function ipfsClient() 
{
  const ipfs = await create(
    {
      host: "ipfs.infura.io",
      port: 5001,
      protocol: "https"
    }
  );
  return ipfs;
}

//function for adding CARGO(JSON) data into IPFS .
async function AddDataIPFS() {
  let ipfs = await ipfsClient(); //for accessing instantiated infura node
//   console.log(ipfs); 
  let result = await ipfs.add({ path: "Cargo attributes.json", content: Buffer.from(JSON.stringify(input2)) });//adding into IPFS 
  var hash = result.cid;//generating hash after uploading data into IPFS
  console.log(result);
  return hash; //returning the hash

}
async function AddDataIPFS2(prevdata){
    console.log("in AddDataIPFS2 function, prevdata type:",typeof(prevdata));
    let ipfs = await ipfsClient();
    var json=JSON.parse(prevdata)
    json.push(input2);
    let result = await ipfs.add({ path: "Cargo attributes.json", content: Buffer.from(JSON.stringify(json)) });//adding into IPFS 
    var hash=result.cid;
    return hash;
}

const sendData = async () => {
	// console.log("In sendData function:");
	var provider = new Provider(privatekey, rpcurl);
	var web3 = new Web3(provider);
	var contract = new web3.eth.Contract(SmartContractABI, SmartContractAddress);
	var result = await contract.methods.GetArray(userid).call();
	// console.log("Result:",result)
	if (result == "null") {
		var hash = await AddDataIPFS(); //Functional call to upload data in to IPFS and retreive the hash
		hash = String(hash);
		console.log("Hash generated for new user :", hash);
		var transaction = await contract.methods.pushArray(userid, hash).send({ from: address });
		console.log("Hash Stored in Blockchain, Receipt:", transaction);

	}
	else {
		var prevdata = await getDataIPFS(result);
		console.log("Previous data of existing user:", prevdata);
		var hash = await AddDataIPFS2(prevdata);
		hash = String(hash);
		console.log("Merged New Hash for existing user:", hash);
		var transaction = await contract.methods.pushArray(userid, hash).send({ from: address });
		console.log("Merged hash overwritten in Blockchain,Receipt:", transaction);

	}
	return hash;

}

async function getHash(){
	var hash = await sendData();
	getDatafromIPFS(hash);
  }
  getHash();

async function getDataIPFS(hash) {
	let ipfs = await ipfsClient();
  
	let asyncitr = ipfs.cat(hash)
  
	for await (const itr of asyncitr) {
  
	  let data = Buffer.from(itr).toString()
	 

	  
	  return data;
	}
  }

  async function getDatafromIPFS(hash) {
	let ipfs = await ipfsClient();

	let asyncitr = ipfs.cat(hash)

	for await (const itr of asyncitr) {

		let data = Buffer.from(itr).toString()
		console.log("Sent data retreived from ethereum:", data)
		// return data;
	}
}
  

app.listen(port);
console.log('listening on', port);