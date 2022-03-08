const express=require("express"); 
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
    
    var now=new Date();
    var timeNow= now.getTime();

const data= {
    timestamp: timeNow,
    temperature: Number(req.body.temperature),
    humidity: Number(req.body.humidity),
    coordinates: req.body.coordinates
}

const user={
    user:`${req.body.email}`
}
console.log(req.body.temperature);

db.collection('cargos').doc(`${req.body.cid}`).set(user).then(()=>
{
console.log("Owner set for cargo");

}).catch((e)=>{
    console.log("Error Occured while setting owner",e);
});

db.collection('cargos').doc(`${req.body.cid}`).collection(`data`).doc(`${timeNow}`).set(data).set(data).then(()=>
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
