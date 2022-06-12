// const express = require('express')
import express from 'express';
import cors from "cors";
import { MongoClient } from 'mongodb';
import dotenv from "dotenv";
import { ObjectId } from 'mongodb';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import { auth } from './middleware/auth.js';
import bcrypt from "bcrypt";

const app = express();
dotenv.config();
// const MONGO_URL = 'mongodb://localhost';
const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.SECRET_KEY;
// 
async function createConnection() {
    const client = new MongoClient(MONGO_URL)
    await client.connect();
    console.log("MongoDB is connected ✅")
    return client;
}
const client = await createConnection();


app.use(express.json()); // converts data to json

// third party package - middleware
//anybody can access this data from API
app.use(cors());

async function genPassword(password) {
    const NO_OF_ROUNDS = 10;
    const salt = await bcrypt.genSalt(NO_OF_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return { hashedPassword };
}

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
app.put('/users/:username', async function (req, res) {
    const param = req.params;
    const updateData = req.body;
    const querydata = await client.db('crm').collection('users').updateOne({ username: param.username }, { $set: updateData });
    res.send(querydata);
    // console.log(param.id);
})

//  Update password
// app.put('/users/:username', async function (req, res) {
//     const param = req.params;
//     const { password } = req.body;
//     const hashedPassword = await genPassword(password);
//     const updateData = { password: hashedPassword.hashedPassword }
//     const querydata = await client.db('crm').collection('users').updateOne({ username: param.username }, { $set: updateData });
//     res.send(querydata);
//     // console.log(hashedPassword.hashedPassword);
// })

// Signup
app.post('/users', async function (req, res) {
    const newUser = req.body;
    const data = await client.db('crm').collection('users').insertOne(newUser);
    // console.log(maillist);
    res.send(data);

})
// Login
app.post('/login', async function (req, res) {
    const { username, password } = req.body;
    const checkUsername = await client.db('crm').collection('users').findOne({ username: username });
    if (!checkUsername) {
        res.send({ "error": "invalid credentials - user" })
    } else {
        // const storedPassword = checkUsername.password;
        // const isPasswordMatch = await bcrypt.compare(password, storedPassword);

        const isPasswordMatch = (password == checkUsername.password)

        if (isPasswordMatch) {
            const token = jwt.sign({ id: checkUsername._id, username: checkUsername.username, role: checkUsername.role }, 'some123');
            res.send({ message: "successfull", token: token })
        } else {
            res.send(false)
        }
    }
})

// get header data of login
app.get('/login', async function (req, res) {
    // const { username, password } = req.body;
    const token = req.headers["x-access-token"];

    try {
        const decode = jwt.verify(token, 'some123')
        const username = decode.username
        // const fname = decode.fname
        const checkUsername = await client.db('crm').collection('users').findOne({ username: username });
        res.send({ fname: checkUsername.fname, username: username })
    } catch (err) {
        res.send({ error: err.message })
    }

})

app.delete('/users/:username', async function (req, res) {
    const param = req.params;
    const querydata = await client.db('crm').collection('users').deleteOne({ username: param.username });
    res.send(querydata);
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
app.put('/leads/edit/:id', async function (req, res) {
    const param = req.params;
    const updateData = req.body;
    const querydata = await client.db('crm').collection('leads').updateOne({ _id: ObjectId(param.id) }, { $set: updateData });
    res.send(querydata);
    // console.log(param.id);
})
app.post('/leads', async function (req, res) {
    const newLead = req.body;
    const data = await client.db('crm').collection('leads').insertOne(newLead);
    const maillist = await client.db('crm').collection('users').find({ role: "admin" }).toArray();
    res.send(data);

    let mailTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ogomkargavhane@gmail.com",
            pass: "ejbdxuivywhrndbp"
        }
    })
    let details = {
        from: "ogomkargavhane@gmail.com",
        subject: "Registration",
        text: "New Lead is generated"
    }
    maillist.forEach(function (to, i, array) {
        details.to = to.mail;

        mailTransport.sendMail(details, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("mail sent to -- " + to.mail);
            }
            if (i === maillist.length - 1) { msg.transport.close(); }
        })
    });

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
app.put('/services/edit/:id', async function (req, res) {
    const param = req.params;
    const updateData = req.body;
    const querydata = await client.db('crm').collection('services').updateOne({ _id: ObjectId(param.id) }, { $set: updateData });
    res.send(querydata);
    // console.log(param.id);
})
app.post('/services', async function (req, res) {
    const newLead = req.body;
    const data = await client.db('crm').collection('services').insertOne(newLead);
    const maillist = await client.db('crm').collection('users').find({ role: "admin" });
    res.send(data);

    let mailTransport = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "ogomkargavhane@gmail.com",
            pass: "ejbdxuivywhrndbp"
        }
    })
    let details = {
        from: "ogomkargavhane@gmail.com",
        subject: "Registration",
        text: "New Service Request is generated"
    }
    maillist.forEach(function (to, i, array) {
        details.to = to.email;

        mailTransport.sendMail(details, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log("mail sent to -- " + to.email);
            }
            if (i === maillist.length - 1) { msg.transport.close(); }
        })
    });

    // maillist.forEach(function (to) {
    //     console.log(to.email);
    // })

})
app.delete('/services/edit/:id', async function (req, res) {
    const services = req.params;
    const querydata = await client.db('crm').collection('services').deleteOne({ _id: ObjectId(services.id) });
    res.send(querydata);
    // console.log(param.id);
})

//LOGIN

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const checkUsername = await client.db('crm').collection('users').findOne({ username: username });

    if (!checkUsername) {
        res.send({ "error": "invalid credentials" });
    } else {
        const storedPassword = checkUsername.password;
        const isPasswordMatch = password === storedPassword;
        if (isPasswordMatch) {
            const token = jwt.sign({ username: checkUsername.username }, process.env.SECRET_KEY);
            res.send({ "msg": "successfull login", token });
        } else {
            res.send({ "error": "invalid credentials" });
        }
    }
})

app.listen(PORT, () => console.log(`Started server at ${PORT} 😎`));