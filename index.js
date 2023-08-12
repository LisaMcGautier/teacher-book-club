const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.get("/api", (req, res) => {
  //res.send('Hello World!');
  fetch(
    // `https://www.googleapis.com/books/v1/volumes?q=harry-potter&key=AIzaSyDzTrOwGaarH-w1d93pwHM28JOHqMB8kSU`
    "https://www.googleapis.com/books/v1/volumes?q=" +
      req.query.searchterm +
      "&key=AIzaSyDzTrOwGaarH-w1d93pwHM28JOHqMB8kSU"
  )
    .then((response) => response.json())
    .then((result) => {
      res.send(result.items);
    });
});

app.listen(PORT, () => console.log(`Server listening on port: ${PORT}`));
