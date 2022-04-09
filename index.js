const express = require("express");
const {Translate} = require('@google-cloud/translate').v2;
const bodyParser=require("body-parser");
var mysql = require('mysql');
const app=express();

app.set('view engine', 'ejs');

app.use(express.static("public")); 
app.use(bodyParser.urlencoded({extended :true}))

const createTcpPool = async config => {
    // Extract host and port from socket address
    //const dbSocketAddr = "35.224.166.107:3306".split(':');
  
    // Establish a connection to the database
    return mysql.createPool({
      user: "root", // e.g. 'my-db-user'
      password: "text-to-translate", // e.g. 'my-db-password'
      database: "translationtexts", // e.g. 'my-database'
      host: "35.224.166.107", 
      port: "3306",
      //port: dbSocketAddr[1],  e.g. '3306'
      // ... Specify additional properties here.
      ...config,
    });
};




app.get("/", function(req,res){
    res.render("index.ejs");
})

async function createtable(){
    var data = await createTcpPool();
    var query = "CREATE TABLE IF NOT EXISTS texts (original VARCHAR(100), translated VARCHAR(100))"
    data.query(query, (err,data1) => {
        if (err){console.log(err);}
    })
}

createtable();

app.post("/", function(req,res){
    var totransform = req.body.totransform;


const translate = new Translate({key :"AIzaSyC2TKoZVdU0KLQLnVLARYI8LMestMkVz_c"});
//const text = 'The text to translate, e.g. Hello, world!';
const text = totransform;
const target = 'ru';


async function translateText() {
  
  let [translations] = await translate.translate(text, target);
  translations = Array.isArray(translations) ? translations : [translations];
  console.log('Translations:');
  var data = await createTcpPool();
  translations.forEach((translation, i) => {
    console.log(`${text[i]} => (${target}) ${translation}`);
    
    var query = "INSERT INTO texts (original, translated) VALUES (?,?)";
    var val = [text, translation];
    data.query(query,val, (err,data1) => {})
    res.send("Translated text : "+ translation);

  });
}
translateText();


})






app.listen(8080);