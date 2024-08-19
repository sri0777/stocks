const express = require("express");
const app = express();

app.use(express.urlencoded({ extended: false }));

const mongodb = require("mongodb");
const client = mongodb.MongoClient;

let dbInstance;
client.connect("mongodb+srv://sri0777:2211981406@cluster777.abi0vyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster777").then(database => {
    dbInstance = database.db("stocks");
    if(dbInstance) console.log("connected");
}).catch(err => {
    console.log(err);
})

app.post("/login", (req, res) => {
    let user = req.body;
    dbInstance.collection("users").find(req.body).toArray().then(data => {
        if(data) {
            res.redirect("/home");
        }
        else {
            res.redirect("/login");
        }
    }).catch(err => {   
        console.log(err);
    })
})
app.post("/register", (req, res) => {
    let user = req.body;
    let obj = {
        username: user.username,
        stockName: []
    }
    dbInstance.collection("users").find(req.body).toArray().then(data => {
        if (data) {
            dbInstance.collection("users").insertOne(req.body);
        }
    })
    dbInstance.collection("stockDetails").insertOne(obj);
}) 

app.listen(3000, () => {
    console.log("Server started at http://localhost:3000");
})