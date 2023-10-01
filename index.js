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

// https://www.mongodb.com/docs/drivers/node/current/fundamentals/connection/connect/
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

// https://www.twilio.com/blog/manipulate-notion-database-using-node-js
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

// Create User Database
// ============================
// https://www.dschapman.com/articles/using-notion-to-create-a-user-database-i
// let username = "testuser";
// let email = "me@myaddress";
// let password = "SuperS3cr3t!";

async function CreateUser(body) {
  let foundUser = await CheckUsername(body.username);

  // https://www.youtube.com/watch?v=Pzz36k2rt10&t=220s
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID },
    properties: {
      "Last Name": {
        title: [
          {
            type: "text",
            text: {
              content: body.lastname,
            },
          },
        ],
      },
      "First Name": {
        rich_text: [
          {
            text: {
              content: body.firstname,
            },
          },
        ],
      },
      username: {
        rich_text: [
          {
            text: {
              content: body.username,
            },
          },
        ],
      },
      Email: {
        email: body.email,
      },
      password: {
        rich_text: [
          {
            text: {
              content: body.password,
            },
          },
        ],
      },
    },
  });

  console.log(`SUCCESS: User successfully added with pageId ${response.id}`);
  return response;

  // async () => {
  //   CreateUser(username, email, password);
  // };
}

async function CheckUsername(username) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
    // https://developers.notion.com/reference/post-database-query-filter
    filter: {
      property: "username",
      formula: {
        string: {
          equals: username,
        },
      },
    },
  });

  if (response?.results[0]?.id) {
    return response.results[0].id;
  } else {
    return false;
  }
}

async function CheckLogin(username, password) {
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
    // https://developers.notion.com/reference/post-database-query-filter

    filter: {
      and: [
        {
          property: "username",
          formula: {
            string: {
              equals: username,
            },
          },
        },
        {
          property: "password",
          formula: {
            string: {
              equals: password,
            },
          },
        },
      ],
    },
  });

  if (response?.results[0]?.id) {
    let userInfo = {
      id: response.results[0].id,
      firstName: response.results[0].properties["First Name"].rich_text[0].plain_text,
      lastName: response.results[0].properties["Last Name"].title[0].plain_text,
    }
    
    return userInfo;
  } else {
    return false;
  }
}

app.post("/api/create-user", (req, res) => {
  console.log(req.body);
  CreateUser(req.body).then((data) => {
    res.send(data);
  });
});

app.post("/api/login-user", (req, res) => {
  console.log(req.body);
  CheckLogin(req.body.username, req.body.password).then((data) => {
    res.send(data);
  });
});

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

app.get("/api/discussion-notion", (req, res) => {
  console.log("DISCUSSION " + req.query.id);
  queryDatabase(
    process.env.NOTION_DATABASE_DISCUSSIONS_ID,
    "discussion ID",
    req.query.id
  ).then((data) => {
    res.send(data);
  });
});

app.get("/api/book", (req, res) => {
  // grab the bookID from the page URL
  fetch(
    "https://www.googleapis.com/books/v1/volumes/" +
      req.query.id +
      "?key=" +
      process.env.GOOGLE_BOOKS_API_KEY
  )
    .then((response) => response.json())
    .then((result) => {
      // returns a single book
      res.send(result);
    });
});

// https://developers.google.com/books/docs/v1/using#PerformingSearch
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

// https://www.youtube.com/watch?v=LX_DXLlaymg
app.post("/", async (req, res) => {
  const { messages } = req.body;

  console.log(messages);
  const completion = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    messages: [
      {
        role: "system",
        content: "You are Charlie, a helpful assistant chatbot for teachers.",
        // "You are DesignGPT, a helpful assistant graphics design chatbot.",
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
