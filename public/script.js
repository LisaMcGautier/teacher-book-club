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
    password: password.value,
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

async function listClubs() {
  const response = await fetch("/api/clubs");
  const clubs = await response.json();
  console.log(clubs);

  let clubsList = document.getElementById("clubs-list");

  for (i = 0; i < clubs.length; i++) {
    const row = document.createElement("div");
    const col1 = document.createElement("div");
    const col2 = document.createElement("div");

    const anchorTitle = document.createElement("a");

    row.classList.add("row");
    col1.classList.add("col");
    // col2.classList.add("col");

    anchorTitle.innerText =
      clubs[i].properties["Club Name"].title[0].plain_text;
    anchorTitle.href = "club.html?id=" + clubs[i].id.replaceAll("-", "");

    col1.appendChild(anchorTitle);

    row.appendChild(col1);
    // row.appendChild(col2);

    clubsList.appendChild(row);
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

// https://www.pluralsight.com/guides/handling-nested-promises-using-asyncawait-in-react
loadClub = async () => {
  // https://www.w3docs.com/snippets/javascript/how-to-get-url-parameters.html#:~:text=When%20you%20want%20to%20access,get(%24PARAM_NAME)%20
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const clubId = urlParams.get("id");

  const club = await fetch("/api/clubs-notion?id=" + clubId).then((response) =>
    response.json()
  );

  console.log(club);

  // update the DOM with club information
  let clubHeading = document.getElementById("club-heading");
  clubHeading.innerText = club[0].properties["Club Name"].title[0].plain_text;

  // use the club id to query notion for that club's meetings
  const meetings = await fetch("/api/meetings?id=" + clubId).then((response) =>
    response.json()
  );

  console.log(meetings);

  let events = [];

  for (i = 0; i < meetings.length; i++) {
    console.log(meetings[i].properties.Date.date.start);

    const meetingDate = new Date(meetings[i].properties.Date.date.start);

    // https://www.w3schools.com/js/js_date_methods.asp
    events.push({
      Date: new Date(
        meetingDate.getUTCFullYear(),
        meetingDate.getUTCMonth(),
        meetingDate.getUTCDate()
      ),
      Title: meetings[i].properties["Book Title"].rich_text[0].plain_text,
      Link:
        "book.html?id=" + meetings[i].properties.ISBN.rich_text[0].plain_text,
    });
  }

  console.log(events);

  // https://github.com/jackducasse/caleandar
  var element = caleandar(document.getElementById("club-calendar"), events);

  if (meetings.length > 0) {
    let bookId = meetings[0].properties.ISBN.rich_text[0].plain_text;

    const book = await fetch("/api/book?id=" + bookId).then((response) =>
      response.json()
    );

    // update the DOM with book information
    console.log(book);

    let clubThumbnail = document.createElement("img");
    clubThumbnail.src = book.items[0].volumeInfo.imageLinks.smallThumbnail;

    let clubDetails = document.getElementById("club-details");
    let title = document.createElement("h5");
    title.innerText = book.items[0].volumeInfo.title;
    let author = document.createElement("p");
    author.innerText = "by " + book.items[0].volumeInfo.authors[0];
    let isbnTen = document.createElement("p");
    isbnTen.innerText =
      "ISBN 10: " + book.items[0].volumeInfo.industryIdentifiers[1].identifier;
    let isbnThirteen = document.createElement("p");
    isbnThirteen.innerText =
      "ISBN 13: " + book.items[0].volumeInfo.industryIdentifiers[0].identifier;
    let btnDiscussion = document.createElement("a");
    btnDiscussion.href = "discussion.html?id=f7b52260126b49d192ab35e9eae4585b";
    btnDiscussion.classList.add("btn", "btn-success");
    btnDiscussion.innerText = "Click to join discussion";

    clubDetails.appendChild(clubThumbnail);
    clubDetails.appendChild(title);
    clubDetails.appendChild(author);
    clubDetails.appendChild(isbnTen);
    clubDetails.appendChild(isbnThirteen);
    clubDetails.appendChild(btnDiscussion);
  } else {
    let clubDetails = document.getElementById("club-details");
    let title = document.createElement("h5");
    title.innerText = "There are no books currently assigned to this club.";

    clubDetails.appendChild(title);
  }

  // ......
  listClubBooks();
};

async function listClubBooks() {
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const clubId = urlParams.get("id");

  const response = await fetch("/api/club/booklist?id=" + clubId);
  const booklist = await response.json();
  console.log(booklist);

  let clubBooklist = document.getElementById("club-booklist");

  for (i = 0; i < booklist.length; i++) {
    const row = document.createElement("div");
    const col1 = document.createElement("div");
    const col2 = document.createElement("div");

    const anchorTitle = document.createElement("a");

    row.classList.add("row");
    col1.classList.add("col");
    // col2.classList.add("col");

    anchorTitle.innerText =
    // booklist[i].properties["Club Name"].title[0].plain_text;
    booklist[i].properties.Title.title[0].plain_text;
    anchorTitle.href = "club.html?id=" + booklist[i].id.replaceAll("-", "");

    // <table class="table table-striped table-hover"> ... </table>

    col1.appendChild(anchorTitle);

    row.appendChild(col1);
    // row.appendChild(col2);

    clubBooklist.appendChild(row);
  }
}

async function createClub() {
  let clubname = document.getElementById("clubname");

  let body = {
    clubname: clubname.value,
  };

  // call nodeJS create-club endpoint -- POST
  // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
  const response = await fetch("/api/create-club", {
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
  //return response.json(); // parses JSON response into native JavaScript objects
  // console.log(response.json());

  const clubInfo = await response.json();

  console.log(clubInfo);

  if (clubInfo != null && clubInfo.id != undefined) {
    // alert("HOORAY!");
    location.replace(
      "/club.html?id=" + clubInfo.id.replaceAll("-", "") + "&created=true"
    );
  } else {
    alert("Oops! There is already a club named " + body.clubname);
  }
}

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
  bookHeading.innerText = book.items[0].volumeInfo.title;

  let bookThumbnail = document.getElementById("book-thumbnail");
  bookThumbnail.src = book.items[0].volumeInfo.imageLinks.smallThumbnail;

  let bookDetails = document.getElementById("book-details");
  bookDetails.innerText = "";
  let title = document.createElement("h5");
  title.innerText = book.items[0].volumeInfo.title;
  let author = document.createElement("p");
  author.innerText = "by " + book.items[0].volumeInfo.authors[0];
  let isbnTen = document.createElement("p");
  isbnTen.innerText =
    "ISBN 10: " + book.items[0].volumeInfo.industryIdentifiers[1].identifier;
  let isbnThirteen = document.createElement("p");
  isbnThirteen.innerText =
    "ISBN 13: " + book.items[0].volumeInfo.industryIdentifiers[0].identifier;

  bookDetails.appendChild(title);
  bookDetails.appendChild(author);
  bookDetails.appendChild(isbnTen);
  bookDetails.appendChild(isbnThirteen);

  // .......

  const reviews = await fetch("/api/reviews-notion?isbn=" + bookId).then(
    (response) => response.json()
  );

  console.log(reviews[0]);

  let reviewSection = document.getElementById("review-section");
  // reviewContent.innerText = reviews[1].properties.Review.rich_text[0].plain_text;

  for (i = 0; i < reviews.length; i++) {
    const row = document.createElement("div");
    const col1 = document.createElement("div");
    const col2 = document.createElement("div");
    const avatar = document.createElement("img");
    const anchorAvatar = document.createElement("a");
    const reviewContent = document.createElement("div");

    row.classList.add("row");
    col1.classList.add("col-sm-2");
    col2.classList.add("col-sm-10");

    // what if there are no thumbnails to display??
    // generic image (no image)

    // thumbnail.src = books[i].volumeInfo.imageLinks.smallThumbnail;
    // anchorTitle.innerText = books[i].volumeInfo.title;

    let teacherId = reviews[i].properties["🧑‍🏫 Employees"].relation[0].id;
    teacherId = teacherId.replaceAll("-", "");

    anchorAvatar.href = "teacher.html?id=" + teacherId;
    // anchorTitle.href = "book.html?id=" + books[i].id;

    anchorAvatar.classList.add("avatar-thumbnail");
    anchorAvatar.appendChild(avatar);

    reviewContent.innerText =
      reviews[i].properties.Review.rich_text[0].plain_text;
    reviewContent.classList.add("review-details");

    col1.appendChild(anchorAvatar);
    col2.appendChild(reviewContent);

    row.appendChild(col1);
    row.appendChild(col2);

    reviewSection.appendChild(row);

    // TODO: what if there are more than 10 results?
    // How to add pages of results...
  }
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
  discussionHeading.innerText =
    discussion[0].properties.Name.title[0].plain_text;

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
    discussion[0].properties["Question 1"].rich_text[0].plain_text;

  let questionTwo = document.getElementById("question-two");
  questionTwo.innerText =
    discussion[0].properties["Question 2"].rich_text[0].plain_text;

  let questionThree = document.getElementById("question-three");
  questionThree.innerText =
    discussion[0].properties["Question 3"].rich_text[0].plain_text;

  let questionFour = document.getElementById("question-four");
  questionFour.innerText =
    discussion[0].properties["Question 4"].rich_text[0].plain_text;

  let questionFive = document.getElementById("question-five");
  questionFive.innerText =
    discussion[0].properties["Question 5"].rich_text[0].plain_text;

  // .......
};

loadTeacher = async () => {
  // https://www.w3docs.com/snippets/javascript/how-to-get-url-parameters.html#:~:text=When%20you%20want%20to%20access,get(%24PARAM_NAME)%20
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const teacherId = urlParams.get("id");

  const teacher = await fetch("/api/teacher?id=" + teacherId).then((response) =>
    response.json()
  );

  console.log(teacher);

  let firstName = document.querySelectorAll(".first-name");
  for (let i = 0; i < firstName.length; i++) {
    firstName[i].innerText =
      teacher[0].properties["First Name"].rich_text[0].plain_text;
  }

  let lastName = document.querySelectorAll(".last-name");
  for (let i = 0; i < lastName.length; i++) {
    lastName[i].innerText =
      teacher[0].properties["Last Name"].title[0].plain_text;
  }

  let avatar = document.getElementById("avatar");
  avatar.innerText = "";
  let thumbnail = document.createElement("img");
  thumbnail.classList.add("avatar-large");
  thumbnail.src = teacher[0].properties["Avatar image"].files[0].external.url;
  avatar.appendChild(thumbnail);

  let shortBio = document.getElementById("short-bio");
  shortBio.innerText = "";
  shortBio.innerText =
    teacher[0].properties["Short bio"].rich_text[0].plain_text;

  // IF there are books in the wishlist

  // make another call to Notion to get the Wishlist
  const wishlist = await fetch("/api/wishlist?id=" + teacherId).then(
    (response) => response.json()
  );

  console.log("WISHLIST: ", wishlist);

  // loop over the results to make one call to GB API per ISBN to render thumbnails on the page

  // make another call to Notion to get the History
  const history = await fetch("/api/history?id=" + teacherId).then((response) =>
    response.json()
  );

  console.log("HISTORY: ", history);
};
