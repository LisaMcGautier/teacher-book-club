require("dotenv").config();
const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
var ObjectId = require("mongodb").ObjectId;
const { Client } = require("@notionhq/client");
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

const uri =
  "mongodb+srv://nixxxxer:" +
  process.env.DB_PASSWORD +
  "@cluster0.o44p6og.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const databaseId = process.env.NOTION_DATABASE_ID;

app.get("/api/clubs", (req, res) => {
  MongoClient.connect(uri)
    .then((client) =>
      client
        .db("edbookclubs")
        .collection("clubs")
        .findOne({ _id: new ObjectId("64ded933d12c22a31d474bd4") })
    )
    .then((data) => {
      console.log(data);
      res.send(data);
    })
    .catch((err) => console.log(err));
});

async function queryDatabase(databaseId, uniqueID) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: "uniqueID",
        formula: {
          string: { equals: uniqueID },
        },
      },
    });
    return response.results[0];
  } catch (error) {
    console.log(error.body);
  }
}

app.get("/api/clubs-notion", (req, res) => {
  queryDatabase(databaseId, "66cd1ad4c8b947bf88a652becd464e24").then((data) => {
    res.send(data);
  });
});

app.get("/api", (req, res) => {
  fetch(
    "https://www.googleapis.com/books/v1/volumes?q=" +
      req.query.searchterm +
      "&key=" +
      process.env.GOOGLE_BOOKS_API_KEY
  )
    .then((response) => response.json())
    .then((result) => {
      res.send(result.items);
    });
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
