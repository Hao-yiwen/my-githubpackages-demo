const express = require('express');
const config = require('./config.json');
const {MongoClient} = require('mongodb');
const app = express();
app.use(express.json());

const url = config.mongodb.url;
const dbName = config.mongodb.dbName;

const client = new MongoClient(url, { useUnifiedTopology: true });

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

app.post('/add', async (req, res) => {
    const {name, age} = req.body;
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const result = await collection.insertOne({name, age});
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

app.get('/users', async (req, res) => {
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const result = await collection.find({}).toArray();
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

app.get('/users/age', async (req, res) => {
    const {age} = req.query;
    try {
        await client.connect();
        const db = client.db(dbName);
        const collection = db.collection('users');
        const result = await collection.find({ age: { $gt: 25 } }).toArray();
        res.json(result);
    } catch (err) {
        console.log(err);
    }
});

const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
