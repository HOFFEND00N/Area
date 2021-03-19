//TODO: app.js do all the job / not SRP
const express = require("express");
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('./crypto');
const urlencodedParser = express.urlencoded({ extended: false });
const MongoClient = require("mongodb").MongoClient;
const mongoClient = new MongoClient("mongodb://localhost:27017/", { useUnifiedTopology: true });
const app = express();

app.use(express.static("public"));

mongoClient.connect(function (err, client) {
    if (err) {
        console.log(err);
        throw new Error("MongoDB connection error")
    }
    app.locals.collection = client.db("SecretDB").collection("TextSecrets");
    app.listen(3000);
});


app.get("/", function (req, res) {
    res.render("add.hbs");
});

app.get("/add", function (req, res) {
    res.render("add.hbs");
});

app.get("/[a-zA-Z]{6}$", async function (req, res, next) {
    let url = req.url;
    let collection = req.app.locals.collection;
    let result = await collection.findOne({ Url: url }).catch(next);
    if (result !== null)
        res.render("passwordReq.hbs", { Url: url, Message: "" });
    else
        next(new Error("There is no such url"));
});

app.post("/add", urlencodedParser, async function (req, res, next) {
    let collection = req.app.locals.collection;
    let url = GenerateUrl(6);

    let IsUnique = false;
    while (!IsUnique) {
        let result = await collection.findOne({ Url: url }).catch(next);
        if (result == null)
            IsUnique = true;
        else
            url = GenerateUrl(6);
    }
    let hashedPassword = await bcrypt.hash(req.body.Password, 12).catch(next);
    let secret = { SecretText: encrypt(req.body.SecretText), Password: hashedPassword, Url: url };

    await collection.insertOne(secret).catch(next);

    res.render("link.hbs", { Url: req.get('host') + url });
});

app.post("/password", urlencodedParser, async function (req, res, next) {
    let collection = req.app.locals.collection;
    let { Url, Password } = req.body;

    let result = await collection.findOne({ Url: Url }).catch(next);
    let match = await bcrypt.compare(Password, result.Password).catch(next);

    if (match)
        res.render("secret.hbs", { SecretText: decrypt(result.SecretText), Url: Url });
    else
        next(new Error("Wrong password"));
});

app.post("/delete", urlencodedParser, async function (req, res, next) {
    let collection = req.app.locals.collection;

    console.log(req.body.Url);

    let result = await collection.remove({ Url: req.body.Url }).catch(next);

    if (result)
        res.render("Message.hbs", { Message: "Your Secret have been deleted!" });
    else
        next(new Error("Secret delete failed. Please try again later"));
});

app.use((error, req, res, next) => {
    return res.status(500).json(error.toString());
});

app.get('*', function (req, res, next) {
    res.status(404).json('Not Found');
});

function GenerateUrl(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return '/' + result;
}