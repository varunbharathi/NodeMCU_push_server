const express=require("express"); 
const date = require('date-and-time');
const utcToIndiantime = require('utc-to-indiantime');
const sgMail = require('@sendgrid/mail');

//

const { create } = require("ipfs-http-client");//importing ipfs library ~ "create"
var Web3 = require('web3');
const Provider = require('@truffle/hdwallet-provider');

//

const API_KEY="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";

sgMail.setApiKey(API_KEY);


const PORT=process.env.PORT || 3000;

const app= express();        //binds the express module to 'app'
var cors = require('cors');
var bodyParser = require('body-parser');

//

var SmartContractAddress = "0x5a28abd7e0c381128aace1328b3a410eae9bc77c";//deployed smart contract address 
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

var address = "0xFC8Ec6C36c0C98A4f7377201B871a1B78E29dBF2" //Metamask Ropsten test net Account from which transactions are done 
var privatekey = "65cb75f72aa99328cdaa3ea8117208b21fa06cf0f59dc22b4213622eb5e5ea3c"; //Account private key 
var rpcurl = "https://ropsten.infura.io/v3/c9691255c2934d1ca1bf724598e67fb6"; //ropsten URL 



const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./cargo-monitoring-7426f-7493f9debf21.json');
const { time } = require("console");
const { syncBuiltinESMExports } = require("module");
const { text } = require("body-parser");
const { cachedDataVersionTag } = require("v8");
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.post("/send",(req,res)=>{
    

    id=new Date().getTime();
   
    var time=new Date().toLocaleString('en-US', {timeZone: 'Asia/Kolkata', hour12: false})
    time=time.replace(",","");


  let coordinates=req.body.coordinates;
  let latLong=coordinates.split(",");

 var docRef = db.collection("cargos").doc(`${req.body.cid}`);
 var ele=docRef.get().then((doc) => {
    if (doc.data().humiThreshold || doc.data().tempThreshold) {

        
        const owner={
            owner:`${req.body.email}`,
            humiThreshold:doc.data().humiThreshold,
            tempThreshold:doc.data().tempThreshold
        }
        
        db.collection('cargos').doc(`${req.body.cid}`).set(owner).then(()=>
        {
         console.log("owner field added successfully")
        }).catch((e)=>{
            console.log("Error Occured while setting owner",e);
        });
        

        return
       
    } else {
        // doc.data() will be undefined in this case
        const owner={
            owner:`${req.body.email}`,
            humiThreshold:"None",
            tempThreshold: "None"
        }
        
        db.collection('cargos').doc(`${req.body.cid}`).set(owner).then(()=>
        {
         console.log("owner field added successfully")
        }).catch((e)=>{
            console.log("Error Occured while setting owner",e);
        });
        return
    }
    }).catch((error) => {

        const owner={
            owner:`${req.body.email}`,
            humiThreshold:"None",
            tempThreshold: "None"
        }
        
        db.collection('cargos').doc(`${req.body.cid}`).set(owner).then(()=>
        {
         console.log("owner field added successfully")
        }).catch((e)=>{
            console.log("Error Occured while setting owner",e);
        });
        
        console.log("Error getting document:", error);
        return
    });

   

    const data= {
        timestamp: time,
        temperature: Number(req.body.temperature),
        humidity: Number(req.body.humidity),
        latitude: latLong[0],
        longitude:latLong[1]
    }



var status=sendEmail(req.body.email,req.body.cid, req.body.temperature, req.body.humidity, req.body.coordinates, latLong[0], latLong[1], time);

db.collection('cargos').doc(`${req.body.cid}`).collection(`data`).doc(`${id}`).set(data).then(()=>
{
    console.log("Data entered Successfully");
    res.send("Success!");
}).catch((e)=>{
    console.log("error occured while writing data", e);
});



})

app.get("/",(req,res)=>{
    
    res.send(`<h3> Welcome to Cargo Track Backend Server. This URL does not provide any Services and used for internal services only</h3>
    <p><a href="https://cargo-monitoring-7426f.web.app/">click here</a> to access out services :)</p>`)
})


app.listen(PORT, function(){
        console.log("SERVER STARTED ON localhost:3000");     
})


async function sendEmail(email, cargo, temperature, humidity, coordinates,latitude,longitude, time)
{

    

    var thTemperature, thHumidity;
    var docRef = db.collection("cargos").doc(`${cargo}`);
    var isThpresent=false;

   await docRef.get().then((doc) => {
        if (doc.data().humiThreshold || doc.data().tempThreshold) {

        
            thTemperature=doc.data().humiThreshold;
            thHumidity= doc.data().tempThreshold;
             isThpresent=true;
            
            }
           
         else {
            // doc.data() will be undefined in this case
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });

if(isThpresent)
{
      
    if(humidity> thHumidity || temperature > thTemperature)
    {
        console.log("In here!");

        var message= {
            to: email,
            from: 'cargomonitoringalertsystem@hotmail.com',
            subject: `Alert of ${cargo} status`,
            text: "Check your cargo Status threshold crossed!",
            html: `<h1>Check your cargo Status threshold crossed!</h1>
            <p>Click the link below for detailed information `
        };

        sgMail.send(message).then(res => console.log("email sent..."))
        .catch(err=> console.log(err.message));

        registerInBlockChain(email, cargo, temperature, humidity, latitude,longitude, time);

    }
   
}
}


async function registerInBlockChain(email, cargo, temperature, humidity, latitude,longitude , time)
{


    console.log("registerInBlockChain function Called");

    var data = [
        {
          'temperature': temperature,
          'humidity': humidity,
          'Latitude': latitude,
          'Longitude': longitude,
          'TimeStamp': time,
          'Cargo ID': cargo
        }];
		console.log(data);

    getHash(data,email);

}

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
async function AddDataIPFS(data) {
    let ipfs = await ipfsClient(); //for accessing instantiated infura node
  //   console.log(ipfs); 
    let result = await ipfs.add({ path: "Cargo attributes.json", content: Buffer.from(JSON.stringify(data)) });//adding into IPFS 
    var hash = result.cid;//generating hash after uploading data into IPFS
    console.log(result);
    return hash; //returning the hash
  
  }

  async function AddDataIPFS2(prevdata, data){
    console.log("in AddDataIPFS2 function, prevdata type:",typeof(prevdata));
    let ipfs = await ipfsClient();
    var json=JSON.parse(prevdata)
    json.push(data);
    let result = await ipfs.add({ path: "Cargo attributes.json", content: Buffer.from(JSON.stringify(json)) });//adding into IPFS 
    var hash=result.cid;
    return hash;
}


async function sendData(data, email) 
{
	// console.log("In sendData function:");
	var provider = new Provider(privatekey, rpcurl);
	var web3 = new Web3(provider);
	var contract = new web3.eth.Contract(SmartContractABI, SmartContractAddress);
	var result = await contract.methods.GetArray(email).call();
	// console.log("Result:",result)
	if (result == "null") {
		var hash = await AddDataIPFS(data); //Functional call to upload data in to IPFS and retreive the hash
		hash = String(hash);
		console.log("Hash generated for new user :", hash);
		var transaction = await contract.methods.pushArray(email, hash).send({ from: address });
		console.log("Hash Stored in Blockchain, Receipt:", transaction);

	}
	else {
		var prevdata = await getDataIPFS(result);
		console.log("Previous data of existing user:", prevdata);
		var hash = await AddDataIPFS2(prevdata,data);
		hash = String(hash);
		console.log("Merged New Hash for existing user:", hash);
		var transaction = await contract.methods.pushArray(email, hash).send({ from: address });
		console.log("Merged hash overwritten in Blockchain,Receipt:", transaction);

	}
	return hash;

}


async function getHash(data, email){
	var hash = await sendData(data, email);
	getDatafromIPFS(hash);
  }

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