import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
const app = express();
import { Client } from "@notionhq/client";
const PORT = process.env.PORT || 3000;

import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(express.static("public"));
app.use(bodyParser.json());
app.use(cors());

const notion = new Client({ auth: process.env.NOTION_API_KEY });

// https://www.twilio.com/blog/manipulate-notion-database-using-node-js
async function queryDatabase(myQuery) {
  try {
    const response = await notion.databases.query(myQuery);
    return response.results;
  } catch (error) {
    console.log(error.body);
  }
}

// https://www.dschapman.com/articles/using-notion-to-create-a-user-database-i
async function CreateUser(body) {
  let foundUser = await DoesUsernameExist(body.username);

  if (foundUser == false) {
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
  } else {
    const response = {
      duplicate: true,
    };

    console.log(`CONFLICT: Username already exists`);
    return response;
  }
}

// https://developers.notion.com/reference/post-database-query-filter
async function DoesUsernameExist(username) {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
    filter: {
      property: "username",
      formula: {
        string: {
          equals: username,
        },
      },
    },
  };

  const response = await queryDatabase(myQuery);

  if (response.length > 0) {
    return true;
  } else {
    return false;
  }
}

async function CheckLogin(username, password) {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
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
  };

  const response = await queryDatabase(myQuery);

  if (response.length > 0) {
    let userInfo = {
      id: response[0].id,
      firstName: response[0].properties["First Name"].rich_text[0].plain_text,
      lastName: response[0].properties["Last Name"].title[0].plain_text,
    };

    return userInfo;
  } else {
    return false;
  }
}

app.post("/api/login-user", (req, res) => {
  console.log(req.body);
  CheckLogin(req.body.username, req.body.password).then((data) => {
    res.send(data);
  });
});

app.post("/api/create-club", (req, res) => {
  console.log(req.body);
  CreateClub(req.body).then((data) => {
    res.send(data);
  });
});

async function CreateClub(body) {
  let foundClub = await DoesClubnameExist(body.clubname);
  console.log("found club equals " + foundClub);

  if (foundClub == false) {
    // https://www.youtube.com/watch?v=Pzz36k2rt10&t=220s
    const response = await notion.pages.create({
      parent: { database_id: process.env.NOTION_DATABASE_CLUBS_ID },
      properties: {
        "Club Name": {
          title: [
            {
              type: "text",
              text: {
                content: body.clubname,
              },
            },
          ],
        },
        "Club Description": {
          rich_text: [
            {
              text: {
                content: body.clubdescription,
              },
            },
          ],
        },
        "Club Leader": {
          relation: [
            {
              id: body.clubleader,
            },
          ],
        },
      },
    });

    console.log(`SUCCESS: Club successfully added with pageId ${response.id}`);
    return response;
  } else {
    const response = {
      duplicate: true,
    };

    console.log(`CONFLICT: Club name already exists`);
    return response;
  }
}

async function DoesClubnameExist(clubname) {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_CLUBS_ID,
    filter: {
      property: "Club Name",
      formula: {
        string: {
          equals: clubname,
        },
      },
    },
  };

  const response = await queryDatabase(myQuery);

  console.log(response);

  if (response.length > 0) {
    return true;
  } else {
    return false;
  }
}

app.post("/api/requests/add", (req, res) => {
  console.log(req.body);
  CreateRequest(req.body).then((data) => {
    res.send(data);
  });
});

async function CreateRequest(body) {
  let foundRequest = await DoesRequestExist(body);
  console.log("found request equals " + foundRequest);

  if (foundRequest == false) {
    // https://www.youtube.com/watch?v=Pzz36k2rt10&t=220s
    const response = await notion.pages.create({
      parent: {
        database_id: process.env.NOTION_DATABASE_JOIN_CLUB_REQUESTS_ID,
      },
      properties: {
        "🧑‍🏫 Employees": {
          relation: [
            {
              id: body.teacherId,
            },
          ],
        },
        "👥 Clubs": {
          relation: [
            {
              id: body.clubId,
            },
          ],
        },
      },
    });

    console.log(
      `SUCCESS: Request successfully added with pageId ${response.id}`
    );
    return response;
  } else {
    const response = {
      duplicate: true,
    };

    console.log(`CONFLICT: Request already exists`);
    return response;
  }
}

async function DoesRequestExist(body) {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_JOIN_CLUB_REQUESTS_ID,
    filter: {
      and: [
        {
          property: "🧑‍🏫 Employees",
          relation: {
            contains: body.teacherId,
          },
        },
        {
          property: "👥 Clubs",
          relation: {
            contains: body.clubId,
          },
        },
      ],
    },
  };

  const response = await queryDatabase(myQuery);

  console.log(response);

  if (response.length > 0) {
    return true;
  } else {
    return false;
  }
}

app.get("/api/requests/list", (req, res) => {
  console.log("REQUESTS for CLUB " + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_JOIN_CLUB_REQUESTS_ID,
    filter: {
      property: "👥 Clubs",
      relation: {
        contains: req.query.id,
      },
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

async function RemoveRequest(body) {
  const response = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_JOIN_CLUB_REQUESTS_ID },
    page_id: body.pageId,
    archived: true,
  });

  console.log(`SUCCESS: Request archived with pageId ${response.id}`);
  return response;
}

app.post("/api/requests/remove", (req, res) => {
  console.log(req.body);
  RemoveRequest(req.body).then((data) => {
    res.send(data);
  });
});

async function ApproveRequest(body) {
  const response = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_JOIN_CLUB_REQUESTS_ID },
    page_id: body.pageId,
    archived: true,
  });

  // obtain the current club members array
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_CLUBS_ID,
    filter: {
      property: "club ID",
      formula: {
        string: { equals: body.clubId },
      },
    },
  };

  queryDatabase(myQuery).then(async (data) => {
    // extract members array from the club
    let clubMembers = data[0].properties["🧑‍🏫 Employees"].relation;

    // then add requesting member to the array
    clubMembers.push({ id: body.memberId });

    // update the club with the new members list
    const response = await notion.pages
      .update({
        parent: { database_id: process.env.NOTION_DATABASE_CLUBS_ID },
        page_id: body.clubId,
        properties: {
          "🧑‍🏫 Employees": {
            type: "relation",
            relation: clubMembers,
          },
        },
      })
      .then((data) => {
        console.log(`SUCCESS: Request approved with pageId ${data.id}`);

        return data;
      });
  });
}

app.post("/api/requests/approve", (req, res) => {
  console.log(req.body);
  ApproveRequest(req.body).then((data) => {
    res.send(data);
  });
});

app.post("/api/create-user", (req, res) => {
  console.log(req.body);
  CreateUser(req.body).then((data) => {
    res.send(data);
  });
});

async function UpdateBio(body) {
  const response = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID },
    page_id: body.pageId,
    properties: {
      "Short bio": {
        rich_text: [
          {
            text: {
              content: body.bio,
            },
          },
        ],
      },
    },
  });

  console.log(`Bio updated for teacher ${response.id}`);
  return response;
}

app.post("/api/bio/update", (req, res) => {
  console.log(req.body);
  UpdateBio(req.body).then((data) => {
    res.send(data);
  });
});

async function UpdateKudos(body) {
  let kudosColumnName;

  // the column that gets updated depends on which button was clicked
  if (body.kudosType == "kudos-empathetic") {
    kudosColumnName = "Kudos Empathetic";
  } else if (body.kudosType == "kudos-helpful") {
    kudosColumnName = "Kudos Helpful";
  } else if (body.kudosType == "kudos-insightful") {
    kudosColumnName = "Kudos Insightful";
  } else if (body.kudosType == "kudos-motivating") {
    kudosColumnName = "Kudos Motivating";
  } else {
    kudosColumnName = "Kudos Supportive";
  }

  // https://www.samanthaming.com/tidbits/37-dynamic-property-name-with-es6/
  const response = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID },
    page_id: body.teacherId,
    properties: {
      [kudosColumnName]: {
        number: body.kudosCount,
      },
    },
  });

  console.log(`Kudos updated for teacher ${response.id}`);
  return response;
}

app.post("/api/kudos/update", (req, res) => {
  console.log(req.body);
  UpdateKudos(req.body).then((data) => {
    res.send(data);
  });
});

app.get("/api/clubs", (req, res) => {
  console.log("CLUB " + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_CLUBS_ID,
    filter: {
      property: "Club Name",
      title: {
        is_not_empty: true,
      },
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

async function AddBookToClub(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_BOOKS_ID },
    properties: {
      Title: {
        title: [
          {
            type: "text",
            text: {
              content: body.bookTitle,
            },
          },
        ],
      },
      ISBN: {
        rich_text: [
          {
            text: {
              content: body.isbn,
            },
          },
        ],
      },
      "👥 Clubs": {
        relation: [
          {
            id: body.clubID,
          },
        ],
      },
    },
  });

  // meetings will need response.id as a relation for this new book
  console.log(`SUCCESS: Book added to club with pageId ${response.id}`);
  return response;
}

app.post("/api/book/create", (req, res) => {
  console.log(req.body);
  AddBookToClub(req.body).then((data) => {
    res.send(data);
  });
});

app.get("/api/book/meetings", (req, res) => {
  console.log("MEETINGS " + req.query.bookId);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_MEETINGS_ID,
    filter: {
      property: "📚 Books",
      relation: {
        contains: req.query.bookId,
      },
    },
    sorts: [
      {
        property: "Date",
        direction: "ascending",
      },
    ],
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

async function CreateQuestions(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_DISCUSSION_GUIDES_ID },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: "",
            },
          },
        ],
      },
      "📚 Books": {
        relation: [
          {
            id: body.bookID,
          },
        ],
      },
      "👥 Clubs": {
        relation: [
          {
            id: body.clubID,
          },
        ],
      },
      ISBN: {
        rich_text: [
          {
            text: {
              content: body.bookISBN,
            },
          },
        ],
      },
      "Guiding Questions": {
        rich_text: [
          {
            text: {
              content: body.questions,
            },
          },
        ],
      },
    },
  });

  console.log(
    `SUCCESS: Questions successfully added with pageId ${response.id}`
  );
  return response;
}

app.post("/api/questions/create", (req, res) => {
  console.log(req.body);
  CreateQuestions(req.body).then((data) => {
    res.send(data);
  });
});

async function CreateMeeting(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_MEETINGS_ID },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: "",
            },
          },
        ],
      },
      "📚 Books": {
        relation: [
          {
            id: body.bookID,
          },
        ],
      },
      "👥 Clubs": {
        relation: [
          {
            id: body.clubID,
          },
        ],
      },
      Date: {
        date: {
          start: body.meetingDate,
        },
      },
    },
  });

  console.log(`SUCCESS: Meeting successfully added with pageId ${response.id}`);
  return response;
}

app.post("/api/meeting/create", (req, res) => {
  console.log(req.body);
  CreateMeeting(req.body).then((data) => {
    res.send(data);
  });
});

async function RemoveMeeting(body) {
  const response = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_MEETINGS_ID },
    page_id: body.pageId,
    archived: true,
  });

  console.log(`SUCCESS: Meeting archived with pageId ${response.id}`);
  return response;
}

app.post("/api/meetings/remove", (req, res) => {
  console.log(req.body);
  RemoveMeeting(req.body).then((data) => {
    res.send(data);
  });
});

app.get("/api/club", (req, res) => {
  console.log("CLUB " + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_CLUBS_ID,
    filter: {
      property: "club ID",
      formula: {
        string: { equals: req.query.id },
      },
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

app.get("/api/club/booklist", (req, res) => {
  console.log("CLUB " + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_BOOKS_ID,
    filter: {
      property: "👥 Clubs",
      relation: {
        contains: req.query.id,
      },
    },
  };

  queryDatabase(myQuery).then(async (data) => {
    for (let i = 0; i < data.length; i++) {
      // grab the bookID from the page URL
      await fetch(
        "https://www.googleapis.com/books/v1/volumes?q=isbn:" +
          data[i].properties.ISBN.rich_text[0].plain_text +
          "&key=" +
          process.env.GOOGLE_BOOKS_API_KEY
      )
        .then((response) => response.json())
        .then((result) => {
          // add the thumbnail property to the Notion results
          data[i].properties.title = result.items[0].volumeInfo.title;
          data[i].properties.authors = result.items[0].volumeInfo.authors;
          data[i].properties.thumbnail =
            result.items[0].volumeInfo.imageLinks.thumbnail;
        });
    }
    res.send(data);
  });
});

app.get("/api/club/members", (req, res) => {
  console.log("CLUB " + req.query.clubId);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
    filter: {
      property: "👥 Clubs",
      relation: {
        contains: req.query.clubId,
      },
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

async function RemoveBook(body) {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_MEETINGS_ID,
    filter: {
      property: "📚 Books",
      relation: {
        contains: body.pageId,
      },
    },
  };

  queryDatabase(myQuery).then(async (data) => {
    for (let i = 0; i < data.length; i++) {
      const responseMeetings = await notion.pages.update({
        parent: { database_id: process.env.NOTION_DATABASE_MEETINGS_ID },
        page_id: data[i].id,
        archived: true,
      });

      console.log(
        `SUCCESS: Meeting archived with pageId ${responseMeetings.id}`
      );
    }
  });

  const responseDiscussionGuide = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_DISCUSSION_GUIDES_ID },
    page_id: body.discussionGuideId,
    archived: true,
  });

  console.log(
    `SUCCESS: Discussion Guide archived with pageId ${responseDiscussionGuide.id}`
  );

  const responseBook = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_BOOKS_ID },
    page_id: body.pageId,
    archived: true,
  });

  console.log(`SUCCESS: Book archived with pageId ${responseBook.id}`);

  return responseBook;
}

app.post("/api/books/remove", (req, res) => {
  console.log(req.body);
  RemoveBook(req.body).then((data) => {
    res.send(data);
  });
});

app.get("/api/club/meetings", (req, res) => {
  console.log("MEETINGS " + req.query.id);

  const date = new Date();

  let month = date.getUTCMonth() + 1;
  let day = date.getUTCDate();

  // https://www.geeksforgeeks.org/how-to-format-the-current-date-in-mm-dd-yyyy-hhmmss-format-using-node-js/
  if (month < 10) {
    month = `0${month}`;
  }

  if (day < 10) {
    day = `0${day}`;
  }

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_MEETINGS_ID,
    filter: {
      and: [
        {
          property: "👥 Clubs",
          relation: {
            contains: req.query.id,
          },
        },
        {
          property: "Date",
          date: {
            on_or_after: date.getUTCFullYear() + "-" + month + "-" + day,
          },
        },
      ],
    },
    sorts: [
      {
        property: "Date",
        direction: "ascending",
      },
    ],
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

app.get("/api/book-notion", (req, res) => {
  console.log("BOOK " + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_BOOKS_ID,
    filter: {
      property: "book ID",
      formula: {
        string: { equals: req.query.id },
      },
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

async function SubmitReview(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_REVIEWS_ID },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: "",
            },
          },
        ],
      },
      "🧑‍🏫 Employees": {
        relation: [
          {
            id: body.sender,
          },
        ],
      },
      Review: {
        rich_text: [
          {
            text: {
              content: body.review,
            },
          },
        ],
      },
      ISBN: {
        rich_text: [
          {
            text: {
              content: body.isbn,
            },
          },
        ],
      },
    },
  });

  console.log(`SUCCESS: Review successfully added with pageId ${response.id}`);
  return response;
}

app.post("/api/reviews/add", (req, res) => {
  console.log(req.body);
  SubmitReview(req.body).then((data) => {
    res.send(data);
  });
});

async function RemoveReview(body) {
  const response = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_REVIEWS_ID },
    page_id: body.pageId,
    archived: true,
  });

  console.log(`SUCCESS: Review archived with pageId ${response.id}`);
  return response;
}

app.post("/api/reviews/remove", (req, res) => {
  console.log(req.body);
  RemoveReview(req.body).then((data) => {
    res.send(data);
  });
});

async function getEmployeeByID(teacherID) {
  console.log("EMPLOYEE " + teacherID);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
    filter: {
      property: "Teacher ID",
      formula: {
        string: { equals: teacherID },
      },
    },
  };

  const employee = await queryDatabase(myQuery);

  return employee;
}

app.get("/api/reviews", (req, res) => {
  console.log("REVIEW " + req.query.isbn);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_REVIEWS_ID,
    filter: {
      property: "ISBN",
      formula: {
        string: { equals: req.query.isbn },
      },
    },
  };

  queryDatabase(myQuery).then(async (data) => {
    for (let i = 0; i < data.length; i++) {
      // grab the TeacherID from the Employees relation
      let employee = await getEmployeeByID(
        data[i].properties["🧑‍🏫 Employees"].relation[0].id.replaceAll("-", "")
      );

      // add the avatar to the Notion results
      if (employee[0].properties["Avatar image"].files[0] == undefined) {
        data[i].properties.avatarURL = null;
      } else {
        data[i].properties.avatarURL =
          employee[0].properties["Avatar image"].files[0].external.url;

        console.log(employee);
      }
    }

    res.send(data);
  });
});

app.get("/api/discussion-guide", (req, res) => {
  console.log("DISCUSSION " + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_DISCUSSION_GUIDES_ID,
    filter: {
      and: [
        {
          property: "👥 Clubs",
          relation: {
            contains: req.query.id,
          },
        },
        {
          property: "ISBN",
          formula: {
            string: {
              equals: req.query.isbn,
            },
          },
        },
      ],
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

app.get("/api/discussion-posts", (req, res) => {
  console.log("COMMENT" + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_DISCUSSION_POSTS_ID,
    filter: {
      property: "🧭 Discussion Guides",
      relation: {
        contains: req.query.id,
      },
    },
  };

  queryDatabase(myQuery).then(async (data) => {
    for (let i = 0; i < data.length; i++) {
      // grab the TeacherID from the Employees relation
      let employee = await getEmployeeByID(
        data[i].properties["🧑‍🏫 Employees"].relation[0].id.replaceAll("-", "")
      );

      // add the avatar to the Notion results
      if (employee[0].properties["Avatar image"].files[0] == undefined) {
        data[i].properties.avatarURL = null;
      } else {
        data[i].properties.avatarURL =
          employee[0].properties["Avatar image"].files[0].external.url;

        console.log(employee);
      }
    }

    res.send(data);
  });
});

async function SubmitComment(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_DISCUSSION_POSTS_ID },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: "",
            },
          },
        ],
      },
      "🧭 Discussion Guides": {
        relation: [
          {
            id: body.discussionId,
          },
        ],
      },
      "🧑‍🏫 Employees": {
        relation: [
          {
            id: body.sender,
          },
        ],
      },
      Comment: {
        rich_text: [
          {
            text: {
              content: body.comment,
            },
          },
        ],
      },
    },
  });

  console.log(`SUCCESS: Comment successfully added with pageId ${response.id}`);
  return response;
}

app.post("/api/comments/add", (req, res) => {
  console.log(req.body);
  SubmitComment(req.body).then((data) => {
    res.send(data);
  });
});

async function RemoveComment(body) {
  const response = await notion.pages.update({
    parent: { database_id: process.env.NOTION_DATABASE_DISCUSSION_POSTS_ID },
    page_id: body.pageId,
    archived: true,
  });

  console.log(`SUCCESS: Comment archived with pageId ${response.id}`);
  return response;
}

app.post("/api/comments/remove", (req, res) => {
  console.log(req.body);
  RemoveComment(req.body).then((data) => {
    res.send(data);
  });
});

app.get("/api/teacher", (req, res) => {
  console.log("TEACHER " + req.query.id);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
    filter: {
      property: "Teacher ID",
      formula: {
        string: { equals: req.query.id },
      },
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

async function SendMessage(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_MESSAGES_ID },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: "",
            },
          },
        ],
      },
      Message: {
        rich_text: [
          {
            text: {
              content: body.message,
            },
          },
        ],
      },
      "🧑‍🏫 Sender from Employees": {
        relation: [
          {
            id: body.sender,
          },
        ],
      },
      "🧑‍🏫 Recipient to Employees": {
        relation: [
          {
            id: body.recipient,
          },
        ],
      },
    },
  });

  console.log(`SUCCESS: Message successfully added with pageId ${response.id}`);
  return response;
}

app.post("/api/send-message", (req, res) => {
  console.log(req.body);
  SendMessage(req.body).then((data) => {
    res.send(data);
  });
});

app.get("/api/messages", (req, res) => {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_MESSAGES_ID,
    filter: {
      property: "🧑‍🏫 Recipient to Employees",
      relation: {
        contains: req.query.id,
      },
    },
    sorts: [
      {
        property: "Created time",
        direction: "descending",
      },
    ],
  };

  queryDatabase(myQuery).then(async (data) => {
    res.send(data);
  });
});

app.get("/api/wishlist", (req, res) => {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_WISHLIST_ID,
    filter: {
      property: "🧑‍🏫 Employees",
      relation: {
        contains: req.query.id,
      },
    },
  };

  queryDatabase(myQuery).then(async (data) => {
    for (let i = 0; i < data.length; i++) {
      // grab the bookID from the page URL
      await fetch(
        "https://www.googleapis.com/books/v1/volumes?q=isbn:" +
          data[i].properties.ISBN.rich_text[0].plain_text +
          "&key=" +
          process.env.GOOGLE_BOOKS_API_KEY
      )
        .then((response) => response.json())
        .then((result) => {
          // add the thumbnail property to the Notion results
          data[i].properties.title = result.items[0].volumeInfo.title;
          data[i].properties.authors = result.items[0].volumeInfo.authors;
          data[i].properties.thumbnail =
            result.items[0].volumeInfo.imageLinks.thumbnail;
        });
    }

    res.send(data);
  });
});

app.get("/api/history", (req, res) => {
  let myQuery = {
    database_id: process.env.NOTION_DATABASE_HISTORY_ID,
    filter: {
      property: "🧑‍🏫 Employees",
      relation: {
        contains: req.query.id,
      },
    },
  };

  queryDatabase(myQuery).then(async (data) => {
    for (let i = 0; i < data.length; i++) {
      // grab the bookID from the page URL
      await fetch(
        "https://www.googleapis.com/books/v1/volumes?q=isbn:" +
          data[i].properties.ISBN.rich_text[0].plain_text +
          "&key=" +
          process.env.GOOGLE_BOOKS_API_KEY
      )
        .then((response) => response.json())
        .then((result) => {
          // add the thumbnail property to the Notion results
          data[i].properties.title = result.items[0].volumeInfo.title;
          data[i].properties.authors = result.items[0].volumeInfo.authors;
          data[i].properties.thumbnail =
            result.items[0].volumeInfo.imageLinks.thumbnail;
        });
    }

    res.send(data);
  });
});

app.get("/api/book", (req, res) => {
  // grab the bookID from the page URL
  fetch(
    "https://www.googleapis.com/books/v1/volumes?q=isbn:" +
      req.query.id +
      "&key=" +
      process.env.GOOGLE_BOOKS_API_KEY
  )
    .then((response) => response.json())
    .then((result) => {
      // returns a single book
      res.send(result);
    });
});

// https://developers.google.com/books/docs/v1/using#PerformingSearch
app.get("/api/books/search", (req, res) => {
  // maxResults - default is 10, and the maximum allowable value is 40.
  fetch(
    "https://www.googleapis.com/books/v1/volumes?q=" +
      req.query.q +
      "&maxResults=20" +
      "&key=" +
      process.env.GOOGLE_BOOKS_API_KEY
  )
    .then((response) => response.json())
    .then((result) => {
      // returns either an array of books or an object with totalItems: 0
      res.send(result);
    });
});

app.get("/api/clubs/search", (req, res) => {
  console.log("CLUB " + req.query.q);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_CLUBS_ID,
    filter: {
      or: [
        {
          property: "Club Name",
          title: {
            contains: req.query.q,
          },
        },
        {
          property: "Club Description",
          rich_text: {
            contains: req.query.q,
          },
        },
      ],
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

app.get("/api/members/search", (req, res) => {
  console.log("MEMBER " + req.query.q);

  let myQuery = {
    database_id: process.env.NOTION_DATABASE_EMPLOYEES_ID,
    filter: {
      or: [
        {
          property: "Full Name",
          formula: {
            string: {
              contains: req.query.q,
            },
          },
        },
        {
          property: "Short bio",
          rich_text: {
            contains: req.query.q,
          },
        },
      ],
    },
  };

  queryDatabase(myQuery).then((data) => {
    res.send(data);
  });
});

async function AddToWishlist(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_WISHLIST_ID },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: body.bookTitle,
            },
          },
        ],
      },
      ISBN: {
        rich_text: [
          {
            text: {
              content: body.isbn,
            },
          },
        ],
      },
      "🧑‍🏫 Employees": {
        relation: [
          {
            id: body.userID,
          },
        ],
      },
    },
  });

  console.log(`SUCCESS: Book added to wishlist with pageId ${response.id}`);
  return response;
}

app.post("/api/wishlist/create", (req, res) => {
  console.log(req.body);
  AddToWishlist(req.body).then((data) => {
    res.send(data);
  });
});

async function AddToHistory(body) {
  const response = await notion.pages.create({
    parent: { database_id: process.env.NOTION_DATABASE_HISTORY_ID },
    properties: {
      Name: {
        title: [
          {
            type: "text",
            text: {
              content: body.bookTitle,
            },
          },
        ],
      },
      ISBN: {
        rich_text: [
          {
            text: {
              content: body.isbn,
            },
          },
        ],
      },
      "🧑‍🏫 Employees": {
        relation: [
          {
            id: body.userID,
          },
        ],
      },
    },
  });

  console.log(`SUCCESS: Book added to history with pageId ${response.id}`);
  return response;
}

app.post("/api/history/create", (req, res) => {
  console.log(req.body);
  AddToHistory(req.body).then((data) => {
    res.send(data);
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
