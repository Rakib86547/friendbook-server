const express = require('express');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.tiiizrg.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });



async function run () {
   try {
    const usersCollection = client.db('friendbook').collection('users');
    const postCollection = client.db('friendbook').collection('post');
    const commentsCollection = client.db('friendbook').collection('comments');

      // save users and send token to the users
      app.put('/user/:email', async (req, res) => {
        const email = req.params.email;
        const users = req.body;
        const filter = { email: email };
        const option = { upsert: true };
        const updateDoc = {
            $set: users
        };
        const result = await usersCollection.updateOne(filter, updateDoc, option);
        const token = jwt.sign(users, process.env.JWT_SECRET_KEY, { expiresIn: '1d' })
        res.send({result, accessToken: token});
    });

    // save all post
    app.post('/post', async (req, res) => {
        const post = req.body;
        const result = await postCollection.insertOne(post);
        res.send(result)
    });

    app.get('/comment', async (req, res) => {
        const query = {};
        const comment = await commentsCollection.find(query).toArray();
        console.log(comment)
        res.send(comment)
    });

    // get details data 
    app.get('/details/:id', async (req, res) => {
        const id = req.params.id;        
        const filter = {_id: ObjectId(id)}
        const result = await postCollection.findOne(filter);
        res.send(result);        
    })

    app.post('/comment', async (req, res) => {
        const comment = req.body;
        const result = await commentsCollection.insertOne(comment);
        res.send(result)
    });
        

    // get post by email quary
    app.get('/my-post',  async (req, res) => {
        const email = req.query.email;
        
        const query = {email: email};
        const result = await postCollection.find(query).toArray();
        res.send(result);
    });
    
    
    // get all post
    app.get('/all-post', async (req, res) => {
        const query = {};
        const result = await postCollection.find(query).toArray();
        res.send(result)
    });

    // get user
    app.get('/users', async (req, res) => {
        const email = req.query.email;
        const query = {email: email};
        const user = await usersCollection.findOne(query);
        res.send(user)
        console.log(user)
    
    })
    
 }

   finally {

   }
}
run().catch(error => console.log(error))


app.get('/', (req, res) => {
    res.send('api i running')
});

app.listen(port, (req, res) => {
    console.log(`server is running on port ${port}`)
})