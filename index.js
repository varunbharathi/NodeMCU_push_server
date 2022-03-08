const express=require("express"); 
const date = require('date-and-time');
const PORT=process.env.PORT || 3000;
const app= express();        //binds the express module to 'app'
var cors = require('cors');
var bodyParser = require('body-parser');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./cargo-monitoring-7426f-7493f9debf21.json');
const { time } = require("console");
initializeApp({
  credential: cert(serviceAccount)
});
const db = getFirestore();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/send",(req,res)=>{
    
   let nowId= new Date();
   let now=new Date();
    now=String( date.format(now, 'YYYY/MM/DD HH:mm:ss'));
    
const data= {
    timestamp: now,
    temperature: Number(req.body.temperature),
    humidity: Number(req.body.humidity),
    coordinates: req.body.coordinates
}

const owner={
    owner:`${req.body.email}`
}

db.collection('cargos').doc(`${req.body.cid}`).set(owner).then(()=>
{
 console.log("owner field added successfully")
}).catch((e)=>{
    console.log("Error Occured while setting owner",e);
});

db.collection('cargos').doc(`${req.body.cid}`).collection(`data`).doc(`${nowId}`).set(data).then(()=>
{
    console.log("Data entered Successfully");
    res.send("Success!");
}).catch((e)=>{
    console.log("error occured while writing data", e);
});



})

app.get("/",(req,res)=>{
    
    res.send(`<h3> Welcome to Cargo Track Backend Server. This URL does not provide any Services and used for internal services only</h3>
    <p><a href="#">click here</a> to access out services :)</p>`)
})


app.listen(PORT, function(){
        console.log("SERVER STARTED ON localhost:3000");     
})
