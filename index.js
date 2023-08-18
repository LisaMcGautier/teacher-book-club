const express = require("express");
const app = express();
const { MongoClient, ServerApiVersion } = require("mongodb");
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

// async function run() {
//   try {
//     // Connect the client to the server	(optional starting in v4.7)
//     await client.connect();

//     const result = await client.db("edbookclubs").collection("clubs").findOne({ clubName: "English Teachers" });

//   } finally {
//     // Ensures that the client will close when you finish/error
//     await client.close();
//   }
// }
// run().catch(console.dir);

app.get("/api/clubs", (req, res) => {
  // client.connect(url, function(err, db) {
  //   if (err) throw err;
  //   var dbo = db.db("edbookclubs");
  //   dbo.collection("clubs").find({}).toArray(function(err, result) {
  //     if (err) throw err;
  //     console.log(result);
  //     db.close();
  //   });
  // });

  // MongoClient.connect(uri, function (err, db) {
  //   var dbo = db.db("edbookclubs");
  //   dbo
  //     .collection("clubs")
  //     .find({})
  //     .toArray(function (err, result) {
  //       if (err) {
  //         // throw err;
  //         console.log(err);
  //       }
  //       res.send("Hello World!");
  //       console.log(result);
  //       db.close();
  //     });
  // });

  //   MongoClient.connect(uri)
  //     .then(client => {
  //     console.log(`Connected to Database`);
  //     const db = client.db('edbookclubs');
  //     const tasksCollection = db.collection('clubs').find({}).then(function(results) {
  //       console.log(results);
  //     });

  //     })

  // //CRUD requests

  //     .catch(error => console.error(error))

  MongoClient.connect(uri)
    .then((client) =>
      client
        .db("edbookclubs")
        .collection("clubs")
        .findOne({ clubName: "English Teachers" })
    )
    .then((data) => {
      console.log(data);
      const jsonContent = JSON.stringify(data);
      res.end(jsonContent);
    })
    .catch((err) => console.log(err));
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
