const express = require("express");
const app = express();
const cors = require("cors");
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
require("dotenv").config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.5onzxss.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    //await client.connect();

    const toyCollection = client.db("animalsToysDB").collection("toys");

    const indexKey = { toyName: 1 };
    const indexOptions = { name: "toyName" };
    const result = await toyCollection.createIndex(indexKey, indexOptions);

    ///search by toys name
    app.get("/getToys/:name", async (req, res) => {
      const text = req.params.name;

      const result = await toyCollection
        .find({
          toyName: { $regex: text, $options: "i" },
        })
        .toArray();

      if (result) {
        return res.send(result);
      } else {
        const result = await toyCollection.find().toArray();
        return res.send(result);
      }

      // } else {
      //   const result = await toyCollection.find().toArray();
      //   return res.send(result);
      // }
    });

    //get all toys
    app.get("/allToys", async (req, res) => {
      const result = await toyCollection.find().limit(20).toArray();
      res.send(result);
    });
    app.get("/details/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    //get by category name
    app.get("/toys/:category", async (req, res) => {
      const subCategory = req.params.category;

      if (subCategory == "all") {
        const result = await toyCollection.find().toArray();
        return res.send(result);
      } else {
        const query = { category: subCategory };
        const result = await toyCollection.find(query).limit(6).toArray();
        return res.send(result);
      }
    });

    //get my toy by ascending and decending
    app.get("/myToys", async (req, res) => {
      // const email = req.query.email;
      // console.log(typeof req.query.price);

      let query = {};
      if (req.query?.email) {
        query = { email: req.query.email };
        if (req.query.price === "ascending") {
          const result = await toyCollection
            .find(query)
            .sort({ price: 1 })
            .toArray();
          return res.send(result);
        } else if (req.query.price === "descending") {
          const result = await toyCollection
            .find(query)
            .sort({ price: -1 })
            .toArray();
          return res.send(result);
        } else {
          const result = await toyCollection.find(query).toArray();
          return res.send(result);
        }
      }
    });

    app.get("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.findOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    //update toy in id
    app.patch("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const toys = req.body;

      const query = { _id: new ObjectId(id) };
      const toyDoc = {
        $set: {
          toyName: toys.toyName,
          photo: toys.photo,
          category: toys.category,
          quantity: toys.quantity,
          price: toys.price,
          details: toys.details,
        },
      };
      const result = await toyCollection.updateOne(query, toyDoc);
      res.send(result);
    });

    //delete one toy
    app.delete("/toy/:id", async (req, res) => {
      const id = req.params.id;
      const result = await toyCollection.deleteOne({ _id: new ObjectId(id) });
      res.send(result);
    });
    //inset the one toy
    app.post("/insert/toys", async (req, res) => {
      const toys = req.body;
      //console.log(toys);
      const result = await toyCollection.insertOne(toys);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    //await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    //await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Animals toys is running");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
