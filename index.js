const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    if (!authHeader) {
        res.status(401).send({ message: "unAuthorization" })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbiddenAccess' })
        }
        req.decoded = decoded
        next()
    });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.0k0nk.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const toolsCollection = client.db("Products").collection("tools");


        //Get All Tools From Server
        app.get('/tools', async (req, res) => {
            const tools = await toolsCollection.find().toArray();
            res.send(tools)
        })

        app.get('/tools/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const findTool = await toolsCollection.findOne(query);
            res.send(findTool)
        })

        //Get Order From Server
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const orders = await PurchaseCollection.find(query).toArray();
            res.send(orders)
        })
        app.get('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const orders = await PurchaseCollection.find(query).toArray();
            res.send(orders)
        })

    }
    finally {

    }
}

run().catch(console.dir);










app.get('/', (req, res) => {
    res.send('Hello From Keeyan Manufacturing !')
})

app.listen(port, () => {
    console.log(`Keeyan Manufacturing listening on port ${port}`)
})