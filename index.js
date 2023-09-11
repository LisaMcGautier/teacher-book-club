import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
import * as mongodb from "mongodb";
var ObjectId = mongodb.ObjectId;
import { Client } from "@notionhq/client";
const PORT = process.env.PORT || 3000;

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());

const uri =
  "mongodb+srv://nixxxxer:" +
  process.env.DB_PASSWORD +
  "@cluster0.o44p6og.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new mongodb.MongoClient(uri, {
  serverApi: {
    version: mongodb.ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

app.get("/api/clubs-mongo", (req, res) => {
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

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function queryDatabase(databaseId, columnName, uniqueID) {
  try {
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: columnName,
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
  console.log("CLUB " + req.query.id);
  queryDatabase(
    process.env.NOTION_DATABASE_CLUBS_ID,
    "club ID",
    req.query.id
  ).then((data) => {
    res.send(data);
  });
});

app.get("/api/book-notion", (req, res) => {
  console.log("BOOK " + req.query.id);
  queryDatabase(
    process.env.NOTION_DATABASE_BOOKS_ID,
    "book ID",
    req.query.id
  ).then((data) => {
    res.send(data);
  });
});

app.get("/api/book", (req, res) => {
  // grab the bookID from the page URL
  fetch(
    "https://www.googleapis.com/books/v1/volumes/" +
      req.query.id)
    .then((response) => response.json())
    .then((result) => {
      // returns a single book
      res.send(result);
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
      // returns an array of books
      res.send(result.items);
    });
});

app.post("/", async (req, res) => {
  const { messages } = req.body;

  console.log(messages);
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content:
          "You are DesignGPT, a helpful assistant graphics design chatbot.",
      },
      ...messages,
      // {role: "user", content: `${message}`},
    ],
  });

  res.json({
    completion: completion.choices[0].message,
  });
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
