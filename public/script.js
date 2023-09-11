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
  // ......
};

loadBook = async () => {
  // https://www.w3docs.com/snippets/javascript/how-to-get-url-parameters.html#:~:text=When%20you%20want%20to%20access,get(%24PARAM_NAME)%20
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const bookId = urlParams.get("id");

  const book = await fetch("/api/book?id=" + bookId).then((response) =>
    response.json()
  );

  // update the DOM with book information
  // .......
};

// // connecting to the Notion API to get the data for the CLUB
// async function loadClub() {
//   // call nodeJS and get the right club document from collection
//   // let searchterm = document.getElementById("searchterm");
//   let id = "e2aba750fd744955b539b01cc21af326";
//   const response = await fetch("/api/clubs-notion?id=" + id);
//   const club = await response.json();
//   console.log(club);

//   console.log(club.properties["Current Book"].relation[0].id);

//   await loadBook(club.properties["Current Book"].relation[0].id);

//   // update the DOM with data from the clubs collection
//   let clubHeading = document.getElementById("club-heading");
//   let clubCalendar = document.getElementById("club-calendar");
//   let clubThumbnail = document.getElementById("club-thumbnail");
//   let clubDetails = document.getElementById("club-details");

//   let thumbnailImage = document.createElement("img");

//   clubHeading.innerText = club.properties.Name.title[0].plain_text;
//   clubCalendar.innerText = club.properties["Next Meeting"].date.start;

//   // clubThumbnail.innerText = "";
//   // clubThumbnail.innerText = club.properties.Books.rich_text[0].plain_text;

//   clubDetails.innerText = "";

// }

// // connecting to the Notion API to get the data for the BOOK
// async function loadBook(id) {

//   const response = await fetch("/api/book-notion?id=" + id);
//   const book = await response.json();
//   console.log(book);

//   // update the DOM with data from the clubs collection
//   let clubHeading = document.getElementById("club-heading");
//   let clubCalendar = document.getElementById("club-calendar");
//   let clubThumbnail = document.getElementById("club-thumbnail");
//   let clubDetails = document.getElementById("club-details");

//   let thumbnailImage = document.createElement("img");

//   clubHeading.innerText = club.properties.Name.title[0].plain_text;
//   clubCalendar.innerText = club.properties["Next Meeting"].date.start;

//   // clubThumbnail.innerText = "";
//   // clubThumbnail.innerText = club.properties.Books.rich_text[0].plain_text;

//   clubDetails.innerText = "";

//   const member = document.createElement("div");
//   member.innerText = club.properties["Current Book"].rich_text[0].plain_text;
//   clubDetails.appendChild(member);
// }
