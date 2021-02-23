const express = require("express");
const bodyParser = require("body-parser");
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const MongoClient = require("mongodb").MongoClient;
const webSiteUrl = 'http://localhost:3000';
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
const app = express();

app.use(express.static("public"));

let dbClient;

mongoClient.connect(function (err, client) {
    if (err)
        console.log(err);
    dbClient = client;
    app.locals.collection = client.db("SecretDB").collection("TextSecrets");
    app.listen(3000);
});


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
    let url = webSiteUrl + req.url;
    let collection = req.app.locals.collection;
    collection.find({ Url: url }, function (err, result) {
        if (err) {
            console.log(err);
            res.render("Error.hbs", { Error: "Something went wrong!" });
        }
        else if (result == null)
            res.render("Error.hbs", { Error: "Wrong Link" });
        else
            res.render("passwordReq.hbs", { Url: url, Message: "" });
    });
})

app.post("/post", urlencodedParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);
    let collection = req.app.locals.collection;
    let url = GenerateUrl(6);

    let IsUnique = false;
    while (!IsUnique) {
        collection.find({ Url: url }, function (err, result) {
            if (result.Url == null)
                IsUnique = true;
            else
                url = GenerateUrl(6);
        });
    }

    let secret = { SecretText: req.body.SecretText, Password: req.body.Password, Url: url };

    collection.insertOne(secret, function (err, result) {

        if (err) {
            console.log(err);
            res.render("Error.hbs", { Error: "Something went wrong!" });
        }
        else
            res.render("link.hbs", { Url: url });
    });
})

app.post("/get", urlencodedParser, function (req, res) {
    if (!req.body)
        return res.sendStatus(400);

    let collection = req.app.locals.collection;

    collection.findOne({ Url: req.body.Url, Password: req.body.Password }, function (err, result) {
        if (err) {
            console.log(err);
            res.render("Error.hbs", { Error: "Something went wrong!" });
        }
        else if (result == null)
            res.render("passwordReq.hbs", { Url: req.body.Url, Message: "Wrong Password" });
        else
            res.render("get.hbs", { SecretText: result.SecretText });
    });
})

function GenerateUrl(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return webSiteUrl + '/' + result;
}

process.on("SIGINT", () => {
    dbClient.close();
    process.exit();
});