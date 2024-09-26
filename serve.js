process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const express = require("express");
const app = express();
const session = require("express-session");
const nodemailer = require("nodemailer")

app.use(
  session({
    secret: "abc",
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 24 * 60 * 60 * 1000 },
  })
);

const mongodb = require("mongodb");
const client = mongodb.MongoClient;

app.use(express.static(__dirname + "/public"));

const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

const { NseIndia } = require("stock-nse-india");
const nseIndia = new NseIndia();

//setLimit
app.get("/setLimit", (req, res) => {
  let stock = req.session.stock;
  let stockPrice = req.session.stockPrice;

  if (stock && stockPrice) {
    res.render("setLimit", { stock, stockPrice });
  } else {
    res.status(400).send("Stock details not found");
  }
});

app.post("/setLimit", (req, res) => {
  const stock = req.body;
  let stockPrice;
  nseIndia
    .getEquityDetails(stock["Security Id"])
    .then((details) => {
      stockPrice = details.priceInfo.lastPrice;

      req.session.stock = stock;
      req.session.stockPrice = stockPrice;

      //sending response
      res.status(200).json({ success: true });
    })
    .catch((err) => {
      console.error("Error fetching stock details:", err);
      res
        .status(500)
        .json({ success: false, message: "Error fetching stock details" });
    });
});


let dbInstance;
client
  .connect(
    "mongodb+srv://sri0777:2211981406@cluster777.abi0vyz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster777"
  )
  .then((database) => {
    dbInstance = database.db("stocks");
    if (dbInstance) console.log("connected");
  })
  .catch((err) => {
    console.log(err);
  });

app.post("/submitStock", (req, res) => {
  console.log(req.body);
  const { issuerId, issuerName, target, current, stoploss } = req.body;
  // Create the stock details object
  const stockDetails = {
    issuerId,
    issuerName,
    target,
    current,
    stoploss,
    date: new Date(), // Optional: Add a timestamp
  };

  dbInstance
    .collection("stockDetails")
    .updateOne(
      { username: req.session.user },
      { $push: { stockName: stockDetails } }
    )
    .then((result) => {
      res.status(200).send("Stock details added successfully");
    })
    .catch((err) => {
      console.error("Error updating stockName array:", err);
      res.status(500).send("Internal Server Error");
    });
});

app.get(["/", "/login"], (req, res) => {
  if (req.session.user) {
    res.redirect("/home");
  } else {
    res.sendFile(__dirname + "/public/login.html");
  }
});
app.get("/home", (req, res) => {
  if (!req.session.user) {
    res.redirect("/login");
  } else {
    res.sendFile(__dirname + "/public/StockList.html");
  }
});
app.post("/login", (req, res) => {
  console.log(req.body);
  dbInstance
    .collection("users")
    .find(req.body)
    .toArray()
    .then((data) => {
      if (data) {
        req.session.user = req.body.username;
        res.redirect("/home");
      } else {
        res.redirect("/login");
      }
    })
    .catch((err) => {
      console.log(err);
    });
});

app.post("/register", (req, res) => {
  console.log(req.body);
  let user = req.body;
  let obj = {
    username: user.username,
    email : user.email,
    stockName: [],
  };
  dbInstance
    .collection("users")
    .find(req.body)
    .toArray()
    .then((data) => {
      if (data.length > 0) {
        res.send("already exist");
      } else {
        dbInstance.collection("users").insertOne(req.body);
        dbInstance.collection("stockDetails").insertOne(obj);
        res.redirect('/login');
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Internal Server Error");
    });
});

app.listen(3000, () => {
  console.log("Server started at http://localhost:3000");
});
