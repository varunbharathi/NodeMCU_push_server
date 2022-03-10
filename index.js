const express=require("express"); 
const date = require('date-and-time');
const utcToIndiantime = require('utc-to-indiantime');
const sgMail = require('@sendgrid/mail');

const API_KEY="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";

sgMail.setApiKey(API_KEY);


const PORT=process.env.PORT || 3000;

const app= express();        //binds the express module to 'app'
var cors = require('cors');
var bodyParser = require('body-parser');

const { initializeApp, applicationDefault, cert } = require('firebase-admin/app');
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore');
const serviceAccount = require('./cargo-monitoring-7426f-7493f9debf21.json');
const { time } = require("console");
const { syncBuiltinESMExports } = require("module");
const { text } = require("body-parser");
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



var status=sendEmail(req.body.email,req.body.cid, req.body.temperature, req.body.humidity);

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
    <p><a href="#">click here</a> to access out services :)</p>`)
})


app.listen(PORT, function(){
        console.log("SERVER STARTED ON localhost:3000");     
})


async function sendEmail(email, cargo, temperature, humidity)
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

    }
   
}
}

