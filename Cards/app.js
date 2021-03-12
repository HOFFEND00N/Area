const express = require('express');
const config = require('config');
const mongoose = require('mongoose');
const Card = require('./Models/Card')

const app = express();

const PORT = config.get("port") || 5000;

async function start() {
    try {
        await mongoose.connect(config.get("mongoUrl"), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useCreateIndex: true
        });
        app.listen(PORT, () => console.log(`App has benn started on port ${PORT}...`));

    } catch (e) {
        console.log("Server error", e.message);
        process.exit(1);
    }
}

start();


app.get("/page/:page?", function (req, res) {
    try {
        let page = req.params.page;

        if (!page)
            page = 1;

        let cards = Card.find();
        console.log(cards);

        res.json({ cards });
    } catch (e) {
        res.status(500).json({ message: "Something went wrong, try again" });
    }
});

app.get("/get/:id", function (req, res) {
    try {
        let id = req.params.id;

        let card = Card.findById(id);

        if (!card)
            res.status(404).json({ message: "Invalid card id" });

        res.json(card);
    } catch (e) {
        res.status(500).json({ message: "Something went wrong, try again" });
    }
});

