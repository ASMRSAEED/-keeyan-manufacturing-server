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

        //Review Info
        app.get('/reviews', async (req, res) => {
            const reviews = await reviewCollection.find().toArray();
            res.send(reviews)
        })

        //Profile Info
        app.get('/profile', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const profile = await profileCollection.find(query).toArray();
            res.send(profile)
        })

        //Admin Info
        app.get('/findAdmin/:email', async (req, res) => {
            const email = req.params.email;
            const user = await userCollection.findOne({ email: email });
            const isAdmin = user?.role === 'admin';
            res.send({ admin: isAdmin })

        })

        //User Info
        app.get('/showAllUser', async (req, res) => {
            const allUser = await userCollection.find({}).toArray();
            res.send(allUser)
        })

        //Order Info
        app.get('/allOrders', async (req, res) => {
            const allOrders = await PurchaseCollection.find().toArray();
            res.send(allOrders)
        })

        //Add Product
        app.post('/addProduct', verifyToken, async (req, res) => {
            const productDetail = req.body;
            const addProduct = await toolsCollection.insertOne(productDetail);
            res.send(addProduct)
        })

        //Add Purchase
        app.post('/purchase', async (req, res) => {
            const purchaseTool = req.body;
            const result = await PurchaseCollection.insertOne(purchaseTool);
            res.send(result)
        })

        //Create Payment
        app.post('/create-payment', async (req, res) => {
            const { newPrice } = req.body;
            const amount = newPrice * 100;
            const payment = await stripe.paymentIntents.create({
                amount: amount,
                currency: 'usd',
                payment_method_types: ['card']
            })
            res.send({ clientSecret: payment.client_secret })
        })

        //Add Review
        app.post('/addReview', async (req, res) => {
            const review = req.body;
            const addReview = await reviewCollection.insertOne(review);
            res.send(addReview)
        })

        //Add Profile
        app.post('/addProfile', verifyToken, async (req, res) => {
            const profile = req.body;
            const addProfile = await profileCollection.insertOne(profile);
            res.send(addProfile)
        })

        //Update Purchase 
        app.patch('/purchase/:id', async (req, res) => {
            const id = req.params.id;
            const payment = req.body;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updatePayment = await PurchaseCollection.updateOne(filter, updatedDoc);
            res.send(updatePayment)
        })

        //Update Profile
        app.put('/profileUpdate/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            console.log(req.headers.authorization)
            const profile = req.body;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    education: profile.education,
                    location: profile.location,
                    number: profile.number,
                    linkDin: profile.linkDin,
                },
            };
            const result = await profileCollection.updateOne(filter, updateDoc);
            res.send(result)
        })

        //Update User
        app.put('/allUser/:email', async (req, res) => {
            const email = req.params.email;
            const user = req.body;
            const filter = { email: email };
            const options = { upsert: true };
            const updateDoc = {
                $set: user,
            }
            const result = await userCollection.updateOne(filter, updateDoc, options);
            const token = jwt.sign({ email: email }, process.env.ACCESS_TOKEN_SECRET)
            res.send({ result, token });
        })

        //Make Admin
        app.put('/makeAdmin/:id', verifyToken, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatedDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await userCollection.updateOne(filter, updatedDoc);
            res.send(result)
        })

        //Update Payment
        app.put('/updatePaid/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const updatePaid = {
                $set: {
                    shipped: 'shipped'
                }
            }
            const result = await PurchaseCollection.updateOne(filter, updatePaid);
            res.send(result)
        })

        //Delete Products
        app.delete('/deleteProduct/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const deleteProduct = await toolsCollection.deleteOne(query);
            res.send(deleteProduct)
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