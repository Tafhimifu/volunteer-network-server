const express = require('express')
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://volunteer:server678@cluster0.igc4i.mongodb.net/volunteerDB?retryWrites=true&w=majority";
const bodyParser = require('body-parser')
const cors =require('cors')
const port=5000;
const app= express()
app.use(bodyParser.json());
app.use(cors());
var admin = require('firebase-admin');
var serviceAccount = require("./volunteer-network-850f9-firebase-adminsdk-ti1lv-d2941e61d5.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://volunteer-network-850f9.firebaseio.com"
});
const client = new MongoClient(uri, { useNewUrlParser: true,useUnifiedTopology:true });
client.connect(err => {
  const fakeCollection = client.db("volunteerDB").collection("fakeData");
  const regDataCollection = client.db("volunteerDB").collection("registration");
  app.post('/load',(req,res) => {
    const dataLoad =req.body;
    console.log(dataLoad)
    fakeCollection.insertMany(dataLoad)
    .then(result => {
      console.log(result.insertedCount)
    
      res.send(result.insertedCount);
    })
    
  })
  app.get('/data',(req,res) => {
    
  
    fakeCollection.find({}).limit(20)
    .toArray((err,documents)=>{
      res.send(documents);
  
    })
  })
  
  app.post('/doRegister',(req,res) => {
    const newReg =req.body;
    regDataCollection.insertOne(newReg)
    .then(result => {
      res.send(result.insertOne > 0);
    })
  
  })
  app.get('/register',(req,res) => {
    const bearer =req.headers.authorization
    if(bearer && bearer.startsWith('Bearer ')){
      const idToken = bearer.split(' ')+[1];
      console.log({idToken})
      // idToken comes from the client app
  admin.auth().verifyIdToken(idToken)
  .then(function(decodedToken) {
    const tokenEmail = decodedToken.email;
    const queryEmail = req.query.email;
    
    console.log(tokenEmail,queryEmail);
    if (tokenEmail == queryEmail) {
      regDataCollection.find({ email: queryEmail})
          .toArray((err, documents) => {
              res.status(200).send(documents);
          })
          
  }
  else{
      res.status(401).send('un-authorized access')
  }
}).catch(function (error) {
  res.status(401).send('un-authorized access')
});
}
else{
res.status(401).send('un-authorized access')
}
})
    
  
  
});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
