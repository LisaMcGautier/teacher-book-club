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