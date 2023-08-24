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

    row.classList.add("row");
    col1.classList.add("col");
    col2.classList.add("col");

    // what if there are no thumbnails to display??
    // generic image (no image)
    thumbnail.src = books[i].volumeInfo.imageLinks.smallThumbnail;
    col2.innerText = books[i].volumeInfo.title;

    col1.appendChild(thumbnail);

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

// connecting to the database to get the data
async function loadClub() {
  // call nodeJS and get the right club document from collection
  // let searchterm = document.getElementById("searchterm");
  let id = "64ded933d12c22a31d474bd4";
  const response = await fetch("/api/clubs?id=" + id);
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
thumbnailImage.src = "http://books.google.com/books/content?id=86HoBAAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api";

clubThumbnail.innerText = "";
clubThumbnail.appendChild(thumbnailImage);

clubDetails.innerText = "";

for (i = 0; i < club.membersList.length; i++) {
  const member = document.createElement("div");
  member.innerText = club.membersList[i];
  clubDetails.appendChild(member);
}
}