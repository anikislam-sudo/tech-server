const express = require("express");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const port = process.env.PORT || 5000;
require("dotenv").config();

//middle wares
app.use(cors());
app.use(express.json());
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@cluster0.4rkfhhl.mongodb.net/?retryWrites=true&w=majority`;
console.log(uri);
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const productCollection = client.db("pc-accessories").collection("product");
    const reviewCollection = client.db("pc-accessories").collection("comment");
    app.get("/products/:id", async (req, res) => {
      const { id } = req.params;
      const query = { _id: new ObjectId(id) };
      console.log(query);
      const result = await productCollection.findOne(query);
      console.log(result);
      res.send(result);
    });
    app.get("/products", async (req, res) => {
      let filter = {};
      if (req.query && req.query.featured === "true") {
        filter = { featured: true };
      } else {
        filter = req.query;
      }
      const result = await productCollection.find(filter).toArray();
      res.send(result);
    });

    app.post("/products", async (req, res) => {
      const service = req.body;
      const result = await productCollection.insertOne(service);
      res.send(result);
    });

    app.post("/review/:id", async (req, res) => {
      const { id } = req.params;
      const review = req.body.review;

      console.log(id);
      console.log(review);

      const result = await productCollection.updateOne(
        { _id: new ObjectId(id) },
        { $push: { reviews: review } }
      );

      console.log(result);

      if (result.modifiedCount !== 1) {
        console.error("product is not found or review not added");
        res.json({ error: "product is not found or review not added" });
        return;
      }

      console.log("review added successfully");
      res.json({ message: "review added successfully" });
    });

    app.get("/review/:id", async (req, res) => {
      const { id } = req.params;

      const result = await productCollection.findOne(
        { _id: new ObjectId(id) },
        { projection: { _id: 0, reviews: 1 } }
      );

      if (result) {
        res.json(result);
      } else {
        res.status(404).json({ error: "product is not found" });
      }
    });
  } finally {
  }
}
run().catch((err) => console.error(err));

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`TechWorld server running on ${port}`);
});
