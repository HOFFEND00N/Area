const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');
const { encrypt, decrypt } = require('./crypto');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const MongoClient = require("mongodb").MongoClient;
const webSiteUrl = 'localhost:3000';
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

app.get("/[a-zA-Z]{6}$", async function (req, res) {
    try {
        let url = webSiteUrl + req.url;
        let collection = req.app.locals.collection;
        let result = await collection.find({ Url: url });
        if (result !== null)
            res.render("passwordReq.hbs", { Url: url, Message: "" });
        else
            return res.status(500).json('Something went wrong!');
    } catch (error) {
        res.status(500).json('Something went wrong!');
    }
})

app.post("/post", urlencodedParser, async function (req, res) {
    try {
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

        let hashedPassword = await bcrypt.hash(req.body.Password, 12);
        let secret = { SecretText: encrypt(req.body.SecretText), Password: hashedPassword, Url: url };

        await collection.insertOne(secret);

        res.render("link.hbs", { Url: url });
    } catch (error) {
        res.status(500).json('Something went wrong!');
    }
})

app.post("/get", urlencodedParser, async function (req, res) {
    try {
        let collection = req.app.locals.collection;
        let { Url, Password } = req.body;

        let result = await collection.findOne({ Url: Url });
        await bcrypt.compare(Password, result.Password, function (err, compareResult) {
            console.log(compareResult);
            if (compareResult == false)
                return res.status(500).json('Something went wrong!');
            else
                res.render("get.hbs", { SecretText: decrypt(result.SecretText), Url: Url });
        })

        if (result == null)
            return res.status(500).json('Something went wrong!');

    } catch (error) {
        res.status(500).json('Something went wrong!');
    }
})

app.post("/delete", urlencodedParser, async function (req, res) {
    try {
        let collection = req.app.locals.collection;

        console.log(req.body.Url);

        await collection.remove({ Url: req.body.Url }, function (err, result) {
            if (err) {
                return res.status(500).json('Something went wrong!');
            }
            else
                res.render("Message.hbs", { Message: "Your Secret have been deleted!" });
        });
    } catch (error) {
        res.status(500).json('Something went wrong!');
    }
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