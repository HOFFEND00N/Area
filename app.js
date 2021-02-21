const express = require("express");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const MongoClient = require("mongodb").MongoClient;

const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });

const app = express();
app.use(express.static("public"));

app.get("/", function (req, res) {
    res.render("post.hbs");
});
app.get("/get", function (req, res) {
    res.render("get.hbs");
});
app.get("/post", function (req, res) {
    res.render("post.hbs");
});
app.get("/[a-zA-Z]{6}$", function (req, res) {
    mongoClient.connect(function (err, client) {

        const db = client.db("SecretDB");
        const collection = db.collection("TextSecrets");

        if (err) {
            console.log(err);
        }

        collection.find({ url: req.url }).toArray(function (err, result) {
            if (err)
                console.log(err);

            if (result.length == 0)
                console.log("there is no such link");
            console.log(result);
            client.close();
        });
    });

    res.render("passwordReq.hbs", { url: req.originalUrl });
    console.log(req.originalUrl);
})

app.post("/post", urlencodedParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);
    mongoClient.connect(function (err, client) {

        const db = client.db("SecretDB");
        const collection = db.collection("TextSecrets");
        let url = GenerateKey(6);

        let secret = { secretText: req.body.SecretText, password: req.body.Password, url: url };

        collection.insertOne(secret, function (err, result) {

            if (err) {
                console.log(err);
            }
            console.log(result.ops);

            res.render("link.hbs", { url: url });
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
            console.log(err);

        console.log(`req.password = ${req.Passwrod}`);
        collection.find({ url: req.url, Password: req.Password }).toArray(function (err, result) {
            if (err)
                console.log(err);

            console.log(result.SecretText);

            res.render("get.hbs", { SecretText: result.SecretText });
            client.close();
        });
    });
})

app.listen(3000);

function GenerateKey(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return 'http://localhost:3000/' + result;
}