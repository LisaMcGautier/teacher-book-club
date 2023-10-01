// Register a new user
async function registerUser() {

  // grab the values from the register.html form
  let firstname = document.getElementById("firstname");
  let lastname = document.getElementById("lastname");
  let username = document.getElementById("username");
  let email = document.getElementById("email");
  let password = document.getElementById("password");
  let confirm = document.getElementById("confirm");

  // construct a body JSON object using those values
  let body = {
    firstname: firstname.value,
    lastname: lastname.value,
    username: username.value,
    email: email.value,
    password: password.value,
    confirm: confirm.value,
  };

  // call nodeJS create-user endpoint -- POST
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const response = await fetch("/api/create-user", {
    method: "POST", // *GET, POST, PUT, DELETE, etc.
    mode: "cors", // no-cors, *cors, same-origin
    cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
    credentials: "same-origin", // include, *same-origin, omit
    headers: {
      "Content-Type": "application/json",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: "follow", // manual, *follow, error
    referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(body), // body data type must match "Content-Type" header
  });

  // TODO: update the UI based on the result (success) or (error)
  //return response.json(); // parses JSON response into native JavaScript objects
  console.log(response.json()); 
}

// Allow user to log in
async function login() {

  // grab the values from the login.html form
  let username = document.getElementById("username");
  let password = document.getElementById("password");

  // construct a body JSON object using those values
  let body = {
    username: username.value,
    password: password.value
  };

  // call nodeJS login-user endpoint -- POST
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const response = await fetch("/api/login-user", {
    method: "POST",
    mode: "cors",
    cache: "no-cache",
    credentials: "same-origin",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    body: JSON.stringify(body),
  });

  // TODO: update the UI based on the result (success) or (error)
  const userInfo = await response.json();
  console.log(userInfo);
  
  // Check if user login was successful
  if (userInfo != null && userInfo != false) {
    // store userInfo to Local Storage
    localStorage.setItem("userId", userInfo.id);
    localStorage.setItem("userFirst", userInfo.firstName);
    localStorage.setItem("userLast", userInfo.lastName);

    // redirect to the user's profile page
    location.replace("/my-profile.html");
  } else {
    alert("Oops! Login failed!");
  }
}

async function searchBooks() {
  let searchterm = document.getElementById("searchterm");
  const response = await fetch("/api?searchterm=" + searchterm.value);
  const books = await response.json();
  console.log(books);

  let searchResults = document.getElementById("search-results");

  // clear previous search results
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }

  for (i = 0; i < books.length; i++) {
    const row = document.createElement("div");
    const col1 = document.createElement("div");
    const col2 = document.createElement("div");
    const thumbnail = document.createElement("img");
    const anchorThumbnail = document.createElement("a");
    const anchorTitle = document.createElement("a");

    row.classList.add("row");
    col1.classList.add("col");
    col2.classList.add("col");

    // what if there are no thumbnails to display??
    // generic image (no image)
    thumbnail.src = books[i].volumeInfo.imageLinks.smallThumbnail;
    anchorTitle.innerText = books[i].volumeInfo.title;

    anchorThumbnail.href = "book.html?id=" + books[i].id;
    anchorTitle.href = "book.html?id=" + books[i].id;
    anchorThumbnail.appendChild(thumbnail);

    col1.appendChild(anchorThumbnail);
    col2.appendChild(anchorTitle);

    row.appendChild(col1);
    row.appendChild(col2);

    searchResults.appendChild(row);

    // TODO: what if there are more than 10 results?
    // How to add pages of results...
  }
}

// Hamburger menu function
function hamburger() {
  let menu = document.getElementById("menu-links");

  if (menu.style.display === "block") {
    menu.style.display = "none";
  } else {
    menu.style.display = "block";
  }
}

// connecting to the MongoDb database to get the data
async function loadClubMongo() {
  // call nodeJS and get the right club document from collection
  // let searchterm = document.getElementById("searchterm");
  let id = "64ded933d12c22a31d474bd4";
  const response = await fetch("/api/clubs-mongo?id=" + id);
  const club = await response.json();
  console.log(club);

  // update the DOM with data from the clubs collection
  let clubHeading = document.getElementById("club-heading");
  let clubCalendar = document.getElementById("club-calendar");
  let clubThumbnail = document.getElementById("club-thumbnail");
  let clubDetails = document.getElementById("club-details");

  let thumbnailImage = document.createElement("img");

  clubHeading.innerText = club.clubName;
  clubCalendar.innerText = club.nextMeeting;
  thumbnailImage.src =
    "http://books.google.com/books/content?id=86HoBAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api";

  clubThumbnail.innerText = "";
  clubThumbnail.appendChild(thumbnailImage);

  clubDetails.innerText = "";

  for (i = 0; i < club.membersList.length; i++) {
    const member = document.createElement("div");
    member.innerText = club.membersList[i];
    clubDetails.appendChild(member);
  }
}

// https://www.pluralsight.com/guides/handling-nested-promises-using-asyncawait-in-react
loadClub = async () => {
  // https://www.w3docs.com/snippets/javascript/how-to-get-url-parameters.html#:~:text=When%20you%20want%20to%20access,get(%24PARAM_NAME)%20
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const clubId = urlParams.get("id");

  const club = await fetch("/api/clubs-notion?id=" + clubId).then((response) =>
    response.json()
  );

  let bookId = club.properties["Current Book"].relation[0].id;
  bookId = bookId.replaceAll("-", "");

  const book = await fetch("/api/book-notion?id=" + bookId).then((response) =>
    response.json()
  );

  // update the DOM with club and book information
  let clubHeading = document.getElementById("club-heading");
  clubHeading.innerText = club.properties.Name.title[0].plain_text;

  let clubCalendar = document.getElementById("club-calendar");
  clubCalendar.innerText = club.properties["Next Meeting"].date.start;

  console.log(book);

  let clubThumbnail = document.getElementById("club-thumbnail");
  //clubThumbnail.src = "http://books.google.com/books/content?id=nDjRDwAAQBAJ&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api";
  clubThumbnail.src = book.properties["Small Thumbnail"].url;

  let clubDetails = document.getElementById("club-details");
  clubDetails.innerText = "";
  let title = document.createElement("h5");
  title.innerText = book.properties.Title.title[0].plain_text;
  let author = document.createElement("p");
  author.innerText =
    "by " + book.properties["Author(s)"].rich_text[0].plain_text;
  let isbnTen = document.createElement("p");
  isbnTen.innerText =
    "ISBN 10: " + book.properties["ISBN 10"].rich_text[0].plain_text;
  let isbnThirteen = document.createElement("p");
  isbnThirteen.innerText =
    "ISBN 13: " + book.properties["ISBN 10"].rich_text[0].plain_text;

  clubDetails.appendChild(title);
  clubDetails.appendChild(author);
  clubDetails.appendChild(isbnTen);
  clubDetails.appendChild(isbnThirteen);

  // ......
};

loadBook = async () => {
  // https://www.w3docs.com/snippets/javascript/how-to-get-url-parameters.html#:~:text=When%20you%20want%20to%20access,get(%24PARAM_NAME)%20
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const bookId = urlParams.get("id");

  const book = await fetch("/api/book?id=" + bookId).then((response) =>
    response.json()
  );

  console.log(book);

  // update the DOM with book information
  let bookHeading = document.getElementById("book-heading");
  bookHeading.innerText = book.volumeInfo.title;

  let bookThumbnail = document.getElementById("book-thumbnail");
  bookThumbnail.src = book.volumeInfo.imageLinks.smallThumbnail;

  let bookDetails = document.getElementById("book-details");
  bookDetails.innerText = "";
  let title = document.createElement("h5");
  title.innerText = book.volumeInfo.title;
  let author = document.createElement("p");
  author.innerText = "by " + book.volumeInfo.authors[0];
  let isbnTen = document.createElement("p");
  isbnTen.innerText =
    "ISBN 10: " + book.volumeInfo.industryIdentifiers[0].identifier;
  let isbnThirteen = document.createElement("p");
  isbnThirteen.innerText =
    "ISBN 13: " + book.volumeInfo.industryIdentifiers[1].identifier;

  bookDetails.appendChild(title);
  bookDetails.appendChild(author);
  bookDetails.appendChild(isbnTen);
  bookDetails.appendChild(isbnThirteen);

  // .......
};

loadDiscussion = async () => {
  // https://www.w3docs.com/snippets/javascript/how-to-get-url-parameters.html#:~:text=When%20you%20want%20to%20access,get(%24PARAM_NAME)%20
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const discussionId = urlParams.get("id");

  const discussion = await fetch(
    "/api/discussion-notion?id=" + discussionId
  ).then((response) => response.json());

  console.log(discussion);

  // update the DOM with discussion information
  let discussionHeading = document.getElementById("discussion-heading");
  discussionHeading.innerText = discussion.properties.Name.title[0].plain_text;

  // ??????????????????????????????????????????????????????
  // Is it possible to call GBooks API for book details
  // and also call Notion API for discussion details?

  // let bookThumbnail = document.getElementById("book-thumbnail");
  // bookThumbnail.src = book.volumeInfo.imageLinks.smallThumbnail;

  // let bookDetails = document.getElementById("book-details");
  // bookDetails.innerText = "";
  // let title = document.createElement("h5");
  // title.innerText = book.volumeInfo.title;
  // let author = document.createElement("p");
  // author.innerText = "by " + book.volumeInfo.authors[0];
  // let isbnTen = document.createElement("p");
  // isbnTen.innerText = "ISBN 10: " + book.volumeInfo.industryIdentifiers[0].identifier;
  // let isbnThirteen = document.createElement("p");
  // isbnThirteen.innerText = "ISBN 13: " + book.volumeInfo.industryIdentifiers[1].identifier;

  // bookDetails.appendChild(title);
  // bookDetails.appendChild(author);
  // bookDetails.appendChild(isbnTen);
  // bookDetails.appendChild(isbnThirteen);

  let questionOne = document.getElementById("question-one");
  questionOne.innerText =
    discussion.properties["Question 1"].rich_text[0].plain_text;

  let questionTwo = document.getElementById("question-two");
  questionTwo.innerText =
    discussion.properties["Question 2"].rich_text[0].plain_text;

  let questionThree = document.getElementById("question-three");
  questionThree.innerText =
    discussion.properties["Question 3"].rich_text[0].plain_text;

  let questionFour = document.getElementById("question-four");
  questionFour.innerText =
    discussion.properties["Question 4"].rich_text[0].plain_text;

  let questionFive = document.getElementById("question-five");
  questionFive.innerText =
    discussion.properties["Question 5"].rich_text[0].plain_text;

  // .......
};
