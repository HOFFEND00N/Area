const express = require("express");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });

const app = express();
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.redirect("post");
});
app.get("/get", function (req, res) {
    res.sendFile(__dirname + "/get.html");
});
app.get("/post", function (req, res) {
    res.sendFile(__dirname + "/post.html");
});

app.post("/post", urlencodedParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);
    mongoClient.connect(function (err, client) {

        const db = client.db("SecretDB");
        const collection = db.collection("TextSecrets");
        let secret = { secretText: req.body.SecretText, Password: req.body.Password };
        
        collection.insertOne(secret, function (err, result) {

            if (err) {
                return console.log(err);
            }

            console.log(result.ops);
            client.close();
        });
    });

})

app.post("/get", urlencodedParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);
    mongoClient.connect(function (err, client) {

        const db = client.db("SecretDB");
        const collection = db.collection("TextSecrets");

        if (err)
            return console.log(err);

        collection.find().toArray(function (err, results) {

            console.log(results);
            client.close();
        });
    });
})

app.listen(3000);