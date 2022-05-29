// const express = require('express')
import express from 'express';
import cors from "cors";
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import { ObjectId } from 'mongodb';

const app = express();
dotenv.config();
// const MONGO_URL = 'mongodb://localhost';
const MONGO_URL = process.env.MONGO_URL;

const PORT = process.env.PORT || 5000;

async function createConnection() {
    const client = new MongoClient(MONGO_URL)
    await client.connect();
    console.log("MongoDB is connected ✅")
    return client;
}
const client = await createConnection();

const [users, setUsers] = [
    {
        fname: "omkar",
        lname: "gavhane",
        email: "ogomkargavhane@gmail.com",
        password: "let@123",
        username: "omkar123",
        contact: 9191919191
    }
]

app.use(express.json()); // converts data to json

// third party package - middleware
//anybody can access this data from API
app.use(cors());

// USERS
app.get('/', function (req, res) {
    res.send('Hello User, Hope you like our CRM services')
})
app.get('/users', async function (req, res) {
    const data = await client.db('crm').collection('users').find({}).toArray();
    res.send(data);
})
app.get('/users/:username', async function (req, res) {
    const param = req.params;
    const querydata = await client.db('crm').collection('users').find({ username: param.username }).toArray();
    res.send(querydata);
})
app.post('/users', async function (req, res) {
    const newUser = req.body;
    const data = await client.db('crm').collection('users').insertOne(newUser);
    res.send(data);
})

// LEADS
app.get('/leads', async function (req, res) {
    const data = await client.db('crm').collection('leads').find({}).toArray();
    res.send(data);
})
app.get('/leads/edit/:id', async function (req, res) {
    const param = req.params;
    const querydata = await client.db('crm').collection('leads').find({ _id: ObjectId(param.id) }).toArray();
    res.send(querydata);
    // console.log(param.id);
})
app.post('/leads', async function (req, res) {
    const newLead = req.body;
    const data = await client.db('crm').collection('leads').insertOne(newLead);
    res.send(data);
})
app.delete('/leads/edit/:id', async function (req, res) {
    const param = req.params;
    const querydata = await client.db('crm').collection('leads').deleteOne({ _id: ObjectId(param.id) });
    res.send(querydata);
    // console.log(param.id);
})


// SERVICES
app.get('/services', async function (req, res) {
    const data = await client.db('crm').collection('services').find({}).toArray();
    res.send(data);
})
app.get('/services/edit/:id', async function (req, res) {
    const services = req.params;
    const querydata = await client.db('crm').collection('services').find({ _id: ObjectId(services.id) }).toArray();
    res.send(querydata);
    // console.log(param.id);
})
app.post('/services', async function (req, res) {
    const newLead = req.body;
    const data = await client.db('crm').collection('services').insertOne(newLead);
    res.send(data);
})
app.delete('/services/edit/:id', async function (req, res) {
    const services = req.params;
    const querydata = await client.db('crm').collection('services').deleteOne({ _id: ObjectId(services.id) });
    res.send(querydata);
    // console.log(param.id);
})

app.listen(PORT, () => console.log(`Started server at ${PORT} 😎`));