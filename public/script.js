async function index() {
  configureMenu();
  listClubs();
}

async function addBook() {
  configureMenu();
  loadAddBook();
}

async function book() {
  configureMenu();
  loadBook();
}

async function club() {
  configureMenu();
  loadClub();
}

async function discussion() {
  configureMenu();
  loadDiscussion();
}

async function myProfile() {
  configureMenu();
  loadProfile();
}

async function searchBooks() {
  configureMenu();
  loadSearchBooks();
}

async function searchClubs() {
  configureMenu();
  loadSearchClubs();
}

async function searchMembers() {
  configureMenu();
  loadSearchMembers();
}

async function teacher() {
  configureMenu();
  loadTeacher();
}

async function configureMenu() {
  let mProfile = document.getElementById("mob-my-profile");
  let tdProfile = document.getElementById("td-my-profile");
  let mCreateClub = document.getElementById("mob-create-club");
  let tdCreateClub = document.getElementById("td-create-club");
  let mLogin = document.getElementById("mob-login");
  let tdLogin = document.getElementById("td-login");
  let mRegister = document.getElementById("mob-register");
  let tdRegister = document.getElementById("td-register");
  let mLogout = document.getElementById("mob-logout");
  let tdLogout = document.getElementById("td-logout");

  // check localStorage for the presence of a logged in user
  if (localStorage.getItem("userId") === null) {
    // hide the member options by removing elements from the DOM
    tdProfile.remove();
    mProfile.remove();
    mCreateClub.remove();
    tdCreateClub.remove();
    mLogout.remove();
    tdLogout.remove();

    // display the non-member options
    mLogin.classList.remove("d-none");
    tdLogin.classList.remove("d-none");
    mRegister.classList.remove("d-none");
    tdRegister.classList.remove("d-none");
  } else {
    mLogin.remove();
    tdLogin.remove();
    mRegister.remove();
    tdRegister.remove();

    // display the member options
    tdProfile.classList.remove("d-none");
    mProfile.classList.remove("d-none");
    mCreateClub.classList.remove("d-none");
    tdCreateClub.classList.remove("d-none");
    mLogout.classList.remove("d-none");
    tdLogout.classList.remove("d-none");
  }
}

function search() {
  let searchCategory = document.getElementById("search-category");
  let searchText = document.getElementById("search-text");

  // check if searchText is empty
  if (searchText.value.trim() == "") {
    alert("Please enter a search term");
  } else {
    // redirect user to the corresponding search HTML page
    if (searchCategory.value == "books") {
      location.href = "/search-books.html?q=" + searchText.value;
    } else if (searchCategory.value == "clubs") {
      location.href = "/search-clubs.html?q=" + searchText.value;
    } else {
      location.href = "/search-members.html?q=" + searchText.value;
    }
  }
}

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
  let btnLogin = document.getElementById("btn-login");

  btnLogin.classList.add("disabled");

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
    let loginFailed = document.getElementById("login-failed");
    loginFailed.classList.remove("d-none");
    btnLogin.classList.remove("disabled");
  }
}

function logout() {
  localStorage.removeItem("userId");
  localStorage.removeItem("userFirst");
  localStorage.removeItem("userLast");
  location.replace("/index.html");
}

loadAvatarBio = async () => {
  // let reviewSection = document.getElementById("review-section");
  // // clear previously rendered reviews and display all current reviews
  // reviewSection.innerHTML = "";

  // const spinnerDiv = document.createElement("div");
  // spinnerDiv.setAttribute("id", "spinner");
  // spinnerDiv.classList.add("spinner-border", "m-3");
  // spinnerDiv.setAttribute("role", "status");

  // reviewSection.appendChild(spinnerDiv);

  const teacherId = localStorage.getItem("userId").replaceAll("-", "");

  const teacher = await fetch("/api/teacher?id=" + teacherId).then((response) =>
    response.json()
  );

  console.log(teacher);

  let avatar = document.getElementById("avatar");
  avatar.innerText = "";
  let thumbnail = document.createElement("img");
  thumbnail.classList.add("avatar-large");

  if (teacher[0].properties["Avatar image"].files.length == 0) {
    thumbnail.src = "images/default_avatar.png";
  } else {
    thumbnail.src = teacher[0].properties["Avatar image"].files[0].external.url;
  }

  avatar.appendChild(thumbnail);

  let shortBio = document.getElementById("short-bio");
  shortBio.innerText = "";

  let bioContent = document.getElementById("bio-content");

  if (teacher[0].properties["Short bio"].rich_text.length == 0) {
    shortBio.innerText = "Once upon a time...";
  } else {
    shortBio.innerText =
      teacher[0].properties["Short bio"].rich_text[0].plain_text;
    bioContent.innerText =
      teacher[0].properties["Short bio"].rich_text[0].plain_text;
  }
};

loadMessages = async () => {
  let recipientUserId = localStorage.getItem("userId").replaceAll("-", "");

  let inboxMessages = document.getElementById("inbox-messages");
  // clear previously rendered messages and display all current messages
  inboxMessages.innerHTML = "";

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border", "m-3");
  spinnerDiv.setAttribute("role", "status");

  inboxMessages.appendChild(spinnerDiv);

  const messages = await fetch("/api/messages?id=" + recipientUserId).then(
    (response) => response.json()
  );

  console.log(messages[0]);

  spinnerDiv.remove();

  if (messages.length > 0) {
    for (i = 0; i < messages.length; i++) {
      const row = document.createElement("div");
      const col1 = document.createElement("div");
      const col2 = document.createElement("div");
      const anchorFirstLast = document.createElement("a");
      const msgDate = document.createElement("div");
      const messageContent = document.createElement("div");

      row.classList.add("row");
      col1.classList.add("col-sm-2");
      col2.classList.add("col-sm-10");

      let teacherId =
        messages[i].properties["🧑‍🏫 Sender from Employees"].relation[0].id;
      teacherId = teacherId.replaceAll("-", "");

      anchorFirstLast.href = "teacher.html?id=" + teacherId;
      anchorFirstLast.innerText =
        messages[i].properties["Sender First name"].rollup.array[0].rich_text[0]
          .plain_text +
        " " +
        messages[i].properties["Sender Last name"].rollup.array[0].title[0]
          .plain_text;

      let createdDate = new Date(
        messages[i].properties["Created time"].created_time
      );

      msgDate.innerText = createdDate.toLocaleString();

      messageContent.innerText =
        messages[i].properties.Message.rich_text[0].plain_text;
      messageContent.classList.add("review-details");

      col1.appendChild(anchorFirstLast);
      col1.appendChild(msgDate);

      col2.appendChild(messageContent);

      row.appendChild(col1);
      row.appendChild(col2);

      inboxMessages.appendChild(row);
    }
  } else {
    inboxMessages.innerHTML = "There are no messages to display.";
  }
};

loadProfile = async () => {
  const teacherId = localStorage.getItem("userId").replaceAll("-", "");

  loadAvatarBio();

  let bioSaved = document.getElementById("bio-saved");
  let closeBioBtn = document.getElementById("close-button");
  let cancelBioBtn = document.getElementById("cancel-button");
  let saveBioBtn = document.getElementById("save-button");
  let messageWarning = document.getElementById("message-warning");
  let bioContent = document.getElementById("bio-content");

  let editBioModal = new bootstrap.Modal(
    document.getElementById("editBioModal"),
    {
      keyboard: false,
    }
  );

  closeBioBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    bioContent.innerText = "";
    editBioModal.hide();
  });

  cancelBioBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    bioContent.innerText = "";
    editBioModal.hide();
  });

  saveBioBtn.addEventListener("click", async function () {
    if (bioContent.innerText.trim() == "") {
      messageWarning.classList.remove("d-none");
    } else {
      console.log("Message: ", bioContent.innerText);

      if (messageWarning.classList.contains("d-none") == false) {
        messageWarning.classList.add("d-none");
      }

      let body = {
        pageId: localStorage.getItem("userId"),
        bio: bioContent.innerText,
      };

      editBioModal.hide();

      // call nodeJS update bio endpoint -- POST
      const response = await fetch("/api/bio/update", {
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

      const confirmation = await response.json();

      console.log(confirmation);

      bioContent.innerText = "";

      bioSaved.classList.remove("d-none");
    }

    loadAvatarBio();
  });

  loadMessages();

  loadShelf("wishlist", teacherId);
  loadShelf("history", teacherId);

  // loop over the results to make one call to GB API per ISBN to render thumbnails on the page
};

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

loadSearchBooks = async () => {
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const q = urlParams.get("q");

  // perform the search if we have a query value in the URL
  if (q.trim() != "") {
    booksSearch(q);
  }
};

async function booksSearch(q) {
  let searchterm;

  if (q != null) {
    searchterm = q;
    document.getElementById("searchterm").value = q;
  } else {
    searchterm = document.getElementById("searchterm").value;

    if (searchterm.trim() == "") {
      alert("Please enter a search term");
      return;
    }

    location.href = "/search-books.html?q=" + searchterm;
  }

  let searchResults = document.getElementById("search-results");

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border", "m-3");
  spinnerDiv.setAttribute("role", "status");

  searchResults.appendChild(spinnerDiv);

  const response = await fetch("/api/books/search?q=" + searchterm);
  const books = await response.json();
  console.log(books);

  spinnerDiv.remove();

  // clear previous search results
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }

  // check if there are results available from Google Books API
  if (books.totalItems > 0) {
    for (i = 0; i < books.items.length; i++) {
      // check if industryIdentifiers are provided by Google Books
      // AND only create elements if they are ISBNs
      if (
        books.items[i].volumeInfo.industryIdentifiers != undefined &&
        (books.items[i].volumeInfo.industryIdentifiers[0].type == "ISBN_13" ||
          books.items[i].volumeInfo.industryIdentifiers[0].type == "ISBN_10")
      ) {
        const row = document.createElement("div");
        const col1 = document.createElement("div");
        const col2 = document.createElement("div");
        const thumbnail = document.createElement("img");
        const anchorThumbnail = document.createElement("a");
        const anchorTitle = document.createElement("a");
        const wishlistButton = document.createElement("button");
        const historyButton = document.createElement("button");

        row.classList.add("row");
        col1.classList.add("col", "col-sm-3");
        col2.classList.add("col", "col-sm-9");
        col2.classList.add("fs-5");

        wishlistButton.classList.add("btn", "btn-success", "btn-sm");
        wishlistButton.innerText = "I want to read this book";
        historyButton.classList.add("btn", "btn-info", "btn-sm");
        historyButton.innerText = "I have read this book";

        // if there are no thumbnails, display a generic image
        if (books.items[i].volumeInfo.imageLinks != undefined) {
          thumbnail.src = books.items[i].volumeInfo.imageLinks.smallThumbnail;
        } else {
          thumbnail.src = "images/default_book_small.png";
        }

        anchorTitle.innerText = books.items[i].volumeInfo.title;

        let ISBNid;

        // select the ISBN_13 object from the industryIdentifiers array (if available)
        let isbnAvailable = books.items[
          i
        ].volumeInfo.industryIdentifiers.filter(
          (element) => element.type == "ISBN_13"
        );

        // select the ISBN_10 only if the ISBN_13 is NOT available
        if (isbnAvailable.length == 0) {
          isbnAvailable = books.items[i].volumeInfo.industryIdentifiers.filter(
            (element) => element.type == "ISBN_10"
          );
        }

        // get the ISBN found in the previous step
        ISBNid = isbnAvailable[0].identifier;
        console.log(ISBNid);

        wishlistButton.addEventListener("click", async function () {
          // alert(ISBNid);
          // call node, passing userID, title & ISBN
          let body = {
            bookTitle: anchorTitle.innerText,
            isbn: ISBNid,
            userID: localStorage.getItem("userId").replaceAll("-", ""),
          };

          const response = await fetch("/api/wishlist/create", {
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
        });

        historyButton.addEventListener("click", async function () {
          // alert(ISBNid);
          // call node, passing userID, title & ISBN
          let body = {
            bookTitle: anchorTitle.innerText,
            isbn: ISBNid,
            userID: localStorage.getItem("userId").replaceAll("-", ""),
          };

          const response = await fetch("/api/history/create", {
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
        });

        anchorThumbnail.href = "book.html?id=" + ISBNid;
        anchorTitle.href = "book.html?id=" + ISBNid;

        anchorThumbnail.appendChild(thumbnail);

        col1.appendChild(anchorThumbnail);
        col2.appendChild(anchorTitle);
        col2.appendChild(wishlistButton);
        col2.appendChild(historyButton);

        row.appendChild(col1);
        row.appendChild(col2);

        searchResults.appendChild(row);
      }
    }
  } else {
    searchResults.innerText = "We didn't find any books to match your search.";
    searchResults.classList.add("m-3");
  }
}

loadSearchClubs = async () => {
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const q = urlParams.get("q");

  // perform the search if we have a query value in the URL
  if (q.trim() != "") {
    clubsSearch(q);
  }
};

async function clubsSearch(q) {
  let searchterm;

  if (q != null) {
    searchterm = q;
    document.getElementById("searchterm").value = q;
  } else {
    searchterm = document.getElementById("searchterm").value;

    if (searchterm.trim() == "") {
      alert("Please enter a search term");
      return;
    }

    location.href = "/search-clubs.html?q=" + searchterm;
  }

  let searchResults = document.getElementById("search-results");

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border", "m-3");
  spinnerDiv.setAttribute("role", "status");

  searchResults.appendChild(spinnerDiv);

  const response = await fetch("/api/clubs/search?q=" + searchterm);
  const clubs = await response.json();
  console.log(clubs);

  spinnerDiv.remove();

  // clear previous search results
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }

  if (clubs.length > 0) {
    const table = document.createElement("table");
    const thead = document.createElement("thead");
    const tr = document.createElement("tr");
    const thClubName = document.createElement("th");
    const thClubDescription = document.createElement("th");
    const tbody = document.createElement("tbody");

    // https://getbootstrap.com/docs/5.3/content/tables/
    table.classList.add("table", "table-striped", "table-hover", "table-sm");
    thClubName.setAttribute("scope", "col");
    thClubDescription.setAttribute("scope", "col");

    searchResults.appendChild(table);
    table.appendChild(thead);
    thead.appendChild(tr);
    tr.appendChild(thClubName);
    tr.appendChild(thClubDescription);
    table.appendChild(tbody);

    for (i = 0; i < clubs.length; i++) {
      const tableRow = document.createElement("tr");
      const tdName = document.createElement("td");
      const tdDescription = document.createElement("td");
      const anchorName = document.createElement("a");
      const spanDescription = document.createElement("span");

      anchorName.href = "club.html?id=" + clubs[i].id.replaceAll("-", "");
      anchorName.classList.add("fw-bold");
      anchorName.innerText =
        clubs[i].properties["Club Name"].title[0].plain_text;

      if (clubs[i].properties["Club Description"].length > 0) {
        spanDescription.innerText =
          clubs[i].properties["Club Description"].rich_text[0].plain_text;
      } else {
        spanDescription.innerText = "This description hasn't been written yet.";
      }

      tdName.appendChild(anchorName);
      tdDescription.appendChild(spanDescription);

      tbody.appendChild(tableRow);
      tableRow.appendChild(tdName);
      tableRow.appendChild(tdDescription);
      tdDescription.appendChild(anchorName);
      tdDescription.appendChild(spanDescription);
    }
  } else {
    searchResults.innerText = "We didn't find any clubs to match your search.";
    searchResults.classList.add("m-3");
  }
}

loadSearchMembers = async () => {
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const q = urlParams.get("q");

  // perform the search if we have a query value in the URL
  if (q.trim() != "") {
    membersSearch(q);
  }
};

async function membersSearch(q) {
  let searchterm;

  if (q != null) {
    searchterm = q;
    document.getElementById("searchterm").value = q;
  } else {
    searchterm = document.getElementById("searchterm").value;

    if (searchterm.trim() == "") {
      alert("Please enter a search term");
      return;
    }

    location.href = "/search-members.html?q=" + searchterm;
  }

  let searchResults = document.getElementById("search-results");

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border", "m-3");
  spinnerDiv.setAttribute("role", "status");

  searchResults.appendChild(spinnerDiv);

  const response = await fetch("/api/members/search?q=" + searchterm);
  const members = await response.json();
  console.log(members);

  spinnerDiv.remove();

  // clear previous search results
  while (searchResults.firstChild) {
    searchResults.removeChild(searchResults.firstChild);
  }

  if (members.length > 0) {
    for (i = 0; i < members.length; i++) {
      const row = document.createElement("div");
      const col1 = document.createElement("div");
      const col2 = document.createElement("div");
      const avatar = document.createElement("img");
      const anchorAvatar = document.createElement("a");
      const anchorName = document.createElement("a");
      const bioContent = document.createElement("div");

      row.classList.add("row");
      col1.classList.add("col-sm-2");
      col2.classList.add("col-sm-10");

      let teacherId = members[i].id;
      teacherId = teacherId.replaceAll("-", "");

      if (members[i].properties["Avatar image"].files.length == 0) {
        avatar.src = "images/default_avatar.png";
      } else {
        avatar.src =
          members[i].properties["Avatar image"].files[0].external.url;
      }

      anchorAvatar.href = "teacher.html?id=" + teacherId;
      anchorName.href = "teacher.html?id=" + teacherId;
      anchorName.classList.add("fw-bold");

      avatar.classList.add("avatar-thumbnail");
      anchorAvatar.appendChild(avatar);

      anchorName.innerText = members[i].properties["Full Name"].formula.string;

      if (members[i].properties["Short bio"].rich_text.length > 0) {
        bioContent.innerText =
          members[i].properties["Short bio"].rich_text[0].plain_text;
      } else {
        bioContent.innerText = "This bio hasn't been written yet.";
      }

      bioContent.classList.add("review-details");

      col1.appendChild(anchorAvatar);
      col1.appendChild(anchorName);
      col2.appendChild(bioContent);

      row.appendChild(col1);
      row.appendChild(col2);

      searchResults.appendChild(row);
    }
  } else {
    searchResults.innerText =
      "We didn't find any members to match your search.";
    searchResults.classList.add("m-3");
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
  const meetings = await fetch("/api/club/meetings?id=" + clubId).then(
    (response) => response.json()
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
    btnDiscussion.href =
      "discussion.html?id=" +
      clubId +
      "&isbn=" +
      book.items[0].volumeInfo.industryIdentifiers[0].identifier;
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

  let divAddBook = document.getElementById("div-add-book");
  let btnAddBook = document.createElement("a");
  // <a href="add-book.html" class="btn btn-warning">Add book</a>
  btnAddBook.href = "add-book.html?id=" + clubId;
  btnAddBook.classList.add("btn", "btn-warning");
  btnAddBook.innerText = "Add a book";

  divAddBook.appendChild(btnAddBook);

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
    anchorTitle.href = "club.html?id=" + clubId;

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

loadMeetings = async () => {
  let meetingsList = document.getElementById("meetings-list");
  // clear previously rendered reviews and display all current reviews
  meetingsList.innerHTML = "";

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border", "m-3");
  spinnerDiv.setAttribute("role", "status");

  meetingsList.appendChild(spinnerDiv);

  let bookId = document.getElementById("book-id").value;

  const meetings = await fetch("/api/book/meetings?bookId=" + bookId).then(
    (response) => response.json()
  );

  console.log(meetings[0]);

  spinnerDiv.remove();

  const table = document.createElement("table");
  const thead = document.createElement("thead");
  const tr = document.createElement("tr");
  const thMeetingDate = document.createElement("th");
  const thActions = document.createElement("th");
  const tbody = document.createElement("tbody");

  // https://getbootstrap.com/docs/5.3/content/tables/
  table.classList.add("table", "table-striped", "table-hover", "table-sm");
  thMeetingDate.setAttribute("scope", "col");
  thActions.setAttribute("scope", "col");

  meetingsList.appendChild(table);
  table.appendChild(thead);
  thead.appendChild(tr);
  tr.appendChild(thMeetingDate);
  tr.appendChild(thActions);
  table.appendChild(tbody);

  for (i = 0; i < meetings.length; i++) {
    const tableRow = document.createElement("tr");
    const tdDate = document.createElement("td");
    const tdBtns = document.createElement("td");
    const editBtn = document.createElement("button");
    const deleteBtn = document.createElement("button");

    editBtn.classList.add("btn", "btn-primary", "btn-sm");
    deleteBtn.classList.add("btn", "btn-danger", "btn-sm");

    editBtn.innerText = "EDIT";
    deleteBtn.innerText = "DELETE";

    tdDate.innerText = meetings[i].properties.Date.date.start;

    tbody.appendChild(tableRow);
    tableRow.appendChild(tdDate);
    tableRow.appendChild(tdBtns);
    tdBtns.appendChild(editBtn);
    tdBtns.appendChild(deleteBtn);
  }
};

loadAddBook = async () => {
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

  let meetingCreated = document.getElementById("meeting-created");
  let closeMeetingBtn = document.getElementById("close-button");
  let cancelMeetingBtn = document.getElementById("cancel-button");
  let createMeetingBtn = document.getElementById("create-button");
  let messageWarning = document.getElementById("message-warning");
  let datepickerResult = document.getElementById("datepicker-result");

  let createMeetingModal = new bootstrap.Modal(
    document.getElementById("createMeetingModal"),
    {
      keyboard: false,
    }
  );

  console.log("just want to see if it works...");

  closeMeetingBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    datepickerResult.value = "";
    createMeetingModal.hide();
  });

  cancelMeetingBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    datepickerResult.value = "";
    createMeetingModal.hide();
  });

  createMeetingBtn.addEventListener("click", async function () {
    if (datepickerResult.value.trim() == "") {
      messageWarning.classList.remove("d-none");
    } else {
      console.log("Message: ", datepickerResult.value);

      if (messageWarning.classList.contains("d-none") == false) {
        messageWarning.classList.add("d-none");
      }

      let body = {
        meetingDate: datepickerResult.value,
        bookID: document.getElementById("book-id").value,
        clubID: clubId,
      };

      createMeetingModal.hide();

      // call nodeJS create meeting endpoint -- POST
      const response = await fetch("/api/meeting/create", {
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

      const confirmation = await response.json();

      console.log(confirmation);

      datepickerResult.value = "";

      meetingCreated.classList.remove("d-none");

      loadMeetings();
    }
  });
};

async function adminSearchBooks() {
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
    const selectButton = document.createElement("button");
    const anchorTitle = document.createElement("a");

    // create an addtional element (button) for selecting this book
    // attach an on click event (add event listener targeting the onClick property)
    // on click, call another function that will pass the ISBN of this book
    // append the button child

    row.classList.add("row");
    col1.classList.add("col");
    col2.classList.add("col");
    selectButton.classList.add("btn", "btn-info");

    anchorTitle.innerText = books[i].volumeInfo.title;
    selectButton.innerText = "Select";
    let bookISBN = books[i].volumeInfo.industryIdentifiers[1].identifier;
    let selectedTitle = books[i].volumeInfo.title;
    let thumbnail;

    if (books[i].volumeInfo.imageLinks != undefined) {
      thumbnail = books[i].volumeInfo.imageLinks.smallThumbnail;
    } else {
      thumbnail = "images/default_book_small.png";
    }

    anchorTitle.href = "book.html?id=" + books[i].id;
    // https://www.w3schools.com/jsref/met_element_addeventlistener.asp
    selectButton.addEventListener("click", function () {
      document.getElementById("selection").innerText = selectedTitle;
      document.getElementById("selected-title").innerText = selectedTitle;
      document.getElementById("selection-isbn").value = bookISBN;
      document.getElementById("thumbnail").src = thumbnail;
      document.getElementById("selected-thumbnail").src = thumbnail;
      document.getElementById("confirm-book").className = "d-block";
    });

    col1.appendChild(anchorTitle);
    col2.appendChild(selectButton);

    row.appendChild(col1);
    row.appendChild(col2);

    searchResults.appendChild(row);
  }

  let buttonChange = document.getElementById("btn-change");
  buttonChange.addEventListener("click", function () {
    document.getElementById("add-book-search").className = "d-block";
    document.getElementById("confirm-book").className = "d-none";
    document.getElementById("selected-book").className = "d-none";
    document.getElementById("generate-questions").className = "d-none";
  });

  let buttonConfirm = document.getElementById("btn-confirm");
  buttonConfirm.addEventListener("click", async function () {
    console.log(
      "confirm book " + document.getElementById("selection").innerText
    );
    const urlParams = new URL(window.location.toLocaleString()).searchParams;
    const clubId = urlParams.get("id");

    // save new book info to Notion
    let body = {
      bookTitle: document.getElementById("selection").innerText,
      isbn: document.getElementById("selection-isbn").value,
      clubID: clubId,
    };

    const spinnerDiv = document.createElement("div");
    spinnerDiv.setAttribute("id", "spinner");
    spinnerDiv.classList.add("spinner-border", "m-3");
    spinnerDiv.setAttribute("role", "status");

    document.getElementById("confirm-book").appendChild(spinnerDiv);

    const response = await fetch("/api/book/create", {
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
    }).then((response) => response.json());

    spinnerDiv.remove();

    console.log(response.id);

    let bookId = document.createElement("input");
    bookId.id = "book-id";
    bookId.type = "hidden";
    bookId.value = response.id;

    searchResults.appendChild(bookId);

    document.getElementById("add-book-search").className = "d-none";
    document.getElementById("confirm-book").className = "d-none";
    document.getElementById("selected-book").className = "d-block";
    document.getElementById("generate-questions").className = "d-block";

    document.getElementById("create-meeting-btn").classList.remove("d-none");
  });
}

generateGPTQuestions = async () => {
  let buttonChatGPT = document.getElementById("btnChatGPT");
  buttonChatGPT.classList.add("disabled");
  let spinner = document.getElementById("spinner");
  spinner.classList.remove("invisible");
  // https://www.youtube.com/watch?v=LX_DXLlaymg

  let messages = [];
  const guidingQuestions = document.getElementById("guiding-questions");

  //const chatLog = document.getElementById("chat-log");
  //const messageText = "What are the names of the planets in our solar system?";

  const messageText =
    "Please generate 5 discussion questions for the book " +
    document.getElementById("selected-title").innerText;

  const newMessage = { role: "user", content: `${messageText}` };
  messages.push(newMessage);

  const messageElement = document.createElement("div");
  messageElement.classList.add("message");
  messageElement.classList.add("message--sent");
  messageElement.innerHTML = `
        <div class="message__text">${messageText}</div>
    `;

  //chatLog.appendChild(messageElement);
  //chatLog.scrollTop = chatLog.scrollHeight;

  fetch("http://localhost:3000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  })
    .then((res) => res.json())
    .then((data) => {
      let newAssistantMessage = {
        role: "assistant",
        content: `${data.completion.content}`,
      };
      messages.push(newAssistantMessage);
      const messageElement = document.createElement("div");
      messageElement.classList.add("message");
      messageElement.classList.add("message--received");
      messageElement.innerHTML = `
            <div class="message__text">${data.completion.content}</div>
        `;

      //chatLog.appendChild(messageElement);
      //chatLog.scrollTop = chatLog.scrollHeight;

      guidingQuestions.value = data.completion.content;
      spinner.classList.add("invisible");
    });
};

saveQuestions = async () => {
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const clubId = urlParams.get("id");
  const bookId = document.getElementById("book-id").value;

  const questions = document.getElementById("guiding-questions").value;

  let body = {
    bookID: bookId,
    clubID: clubId,
    questions: questions,
  };

  const response = await fetch("/api/questions/create", {
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
  }).then((response) => response.json());

  // remove the save button to prevent user from adding multiple records to Notion
  document.getElementById("btnSaveQuestions").remove();
};

loadReviews = async (bookId) => {
  let reviewSection = document.getElementById("review-section");
  // clear previously rendered reviews and display all current reviews
  reviewSection.innerHTML = "";

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border", "m-3");
  spinnerDiv.setAttribute("role", "status");

  reviewSection.appendChild(spinnerDiv);

  const reviews = await fetch("/api/reviews-notion?isbn=" + bookId).then(
    (response) => response.json()
  );

  console.log(reviews[0]);

  spinnerDiv.remove();

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

    let teacherId = reviews[i].properties["🧑‍🏫 Employees"].relation[0].id;
    teacherId = teacherId.replaceAll("-", "");

    if (reviews[i].properties.avatarURL == null) {
      avatar.src = "images/default_avatar.png";
    } else {
      avatar.src = reviews[i].properties.avatarURL;
    }

    anchorAvatar.href = "teacher.html?id=" + teacherId;

    avatar.classList.add("avatar-thumbnail");
    anchorAvatar.appendChild(avatar);

    reviewContent.innerText =
      reviews[i].properties.Review.rich_text[0].plain_text;
    reviewContent.classList.add("review-details");

    col1.appendChild(anchorAvatar);
    col2.appendChild(reviewContent);

    row.appendChild(col1);
    row.appendChild(col2);

    reviewSection.appendChild(row);
  }
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
  bookHeading.innerText = book.items[0].volumeInfo.title;

  let bookThumbnail = document.getElementById("book-thumbnail");
  let thumbnail = document.createElement("img");
  thumbnail.src = book.items[0].volumeInfo.imageLinks.smallThumbnail;
  thumbnail.alt = book.items[0].volumeInfo.title + " book cover";

  bookThumbnail.appendChild(thumbnail);

  // configure links to bookstore buttons
  let amznBtn = document.getElementById("amzn-button");
  let banBtn = document.getElementById("ban-button");
  amznBtn.href = "https://www.amazon.com/s?i=stripbooks&rh=p_66%3a" + bookId;
  banBtn.href = "https://www.barnesandnoble.com/w/?ean=" + bookId;

  let bookDetails = document.getElementById("book-details");
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

  // configure star icons for rating, if available
  if (book.items[0].volumeInfo.averageRating != undefined) {
    let avgRatingValue = book.items[0].volumeInfo.averageRating;
    let starsRating = document.getElementById("stars-rating");
    let halfPresent = false;

    for (let i = 1; i < 6; i++) {
      let star = document.createElement("span");

      if (i <= avgRatingValue) {
        star.classList.add("fa", "fa-star", "star");
      } else if (avgRatingValue % 1 != 0 && halfPresent == false) {
        star.classList.add("fa", "fa-star", "partial-star");
        halfPresent = true;
      } else {
        star.classList.add("fa", "fa-star");
      }

      starsRating.appendChild(star);
    }

    let avgRating = document.getElementById("average-rating");
    avgRating.innerText = avgRatingValue;
  }

  bookDetails.appendChild(title);
  bookDetails.appendChild(author);
  bookDetails.appendChild(isbnTen);
  bookDetails.appendChild(isbnThirteen);

  let reviewSubmitted = document.getElementById("review-submitted");
  let closeReviewBtn = document.getElementById("close-button");
  let cancelReviewBtn = document.getElementById("cancel-button");
  let submitReviewBtn = document.getElementById("submit-button");
  let messageWarning = document.getElementById("message-warning");
  let reviewContent = document.getElementById("review-content");

  let addReviewModal = new bootstrap.Modal(
    document.getElementById("addReviewModal"),
    {
      keyboard: false,
    }
  );

  closeReviewBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    reviewContent.innerText = "";
    addReviewModal.hide();
  });

  cancelReviewBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    reviewContent.innerText = "";
    addReviewModal.hide();
  });

  submitReviewBtn.addEventListener("click", async function () {
    if (reviewContent.innerText.trim() == "") {
      messageWarning.classList.remove("d-none");
    } else {
      console.log("Message: ", reviewContent.innerText);

      if (messageWarning.classList.contains("d-none") == false) {
        messageWarning.classList.add("d-none");
      }

      let body = {
        sender: localStorage.getItem("userId").replaceAll("-", ""),
        review: reviewContent.innerText,
        isbn: bookId,
      };

      addReviewModal.hide();

      // call nodeJS add reviews endpoint -- POST
      const response = await fetch("/api/reviews/add", {
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

      const confirmation = await response.json();

      console.log(confirmation);

      reviewContent.innerText = "";

      reviewSubmitted.classList.remove("d-none");

      loadReviews(bookId);
    }
  });

  loadReviews(bookId);
};

loadComments = async (discussionId) => {
  let commentSection = document.getElementById("comment-section");
  // clear previously rendered reviews and display all current reviews
  commentSection.innerHTML = "";

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border", "m-3");
  spinnerDiv.setAttribute("role", "status");

  commentSection.appendChild(spinnerDiv);

  const comments = await fetch("/api/discussion-posts?id=" + discussionId).then(
    (response) => response.json()
  );

  console.log(comments[0]);

  spinnerDiv.remove();

  for (i = 0; i < comments.length; i++) {
    const row = document.createElement("div");
    const col1 = document.createElement("div");
    const col2 = document.createElement("div");
    const avatar = document.createElement("img");
    const anchorAvatar = document.createElement("a");
    const commentContent = document.createElement("div");

    row.classList.add("row");
    col1.classList.add("col-sm-2");
    col2.classList.add("col-sm-10");

    let teacherId = comments[i].properties["🧑‍🏫 Employees"].relation[0].id;
    teacherId = teacherId.replaceAll("-", "");

    if (comments[i].properties.avatarURL == null) {
      avatar.src = "images/default_avatar.png";
    } else {
      avatar.src = comments[i].properties.avatarURL;
    }

    anchorAvatar.href = "teacher.html?id=" + teacherId;

    avatar.classList.add("avatar-thumbnail");
    anchorAvatar.appendChild(avatar);

    commentContent.innerText =
      comments[i].properties.Comment.rich_text[0].plain_text;
    commentContent.classList.add("review-details");

    col1.appendChild(anchorAvatar);
    col2.appendChild(commentContent);

    row.appendChild(col1);
    row.appendChild(col2);

    commentSection.appendChild(row);
  }
};

loadDiscussion = async () => {
  // https://www.w3docs.com/snippets/javascript/how-to-get-url-parameters.html#:~:text=When%20you%20want%20to%20access,get(%24PARAM_NAME)%20
  const urlParams = new URL(window.location.toLocaleString()).searchParams;
  const clubId = urlParams.get("id");
  const isbn = urlParams.get("isbn");

  const discussion = await fetch(
    "/api/discussion-guide?id=" + clubId + "&isbn=" + isbn
  ).then((response) => response.json());

  console.log(discussion);

  let discussionId = discussion[0].properties["discussion ID"].formula.string;

  // update the DOM with discussion information
  let discussionHeading = document.getElementById("discussion-heading");
  discussionHeading.innerText =
    discussion[0].properties["Club Name"].rollup.array[0].title[0].plain_text;

  const book = await fetch("/api/book?id=" + isbn).then((response) =>
    response.json()
  );

  // update the DOM with book information
  console.log(book);

  let bookThumbnail = document.createElement("img");
  bookThumbnail.src = book.items[0].volumeInfo.imageLinks.smallThumbnail;

  let bookDetails = document.getElementById("book-details");
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

  bookDetails.appendChild(bookThumbnail);
  bookDetails.appendChild(title);
  bookDetails.appendChild(author);
  bookDetails.appendChild(isbnTen);
  bookDetails.appendChild(isbnThirteen);

  let questions = document.getElementById("questions");
  questions.innerText =
    discussion[0].properties["Guiding Questions"].rich_text[0].plain_text;

  let goBackBtn = document.getElementById("go-back-button");
  goBackBtn.href = "club.html?id=" + clubId;

  let commentSubmitted = document.getElementById("comment-submitted");
  let closeCommentBtn = document.getElementById("close-button");
  let cancelCommentBtn = document.getElementById("cancel-button");
  let submitCommentBtn = document.getElementById("submit-button");
  let messageWarning = document.getElementById("message-warning");
  let commentContent = document.getElementById("comment-content");

  let addCommentModal = new bootstrap.Modal(
    document.getElementById("addCommentModal"),
    {
      keyboard: false,
    }
  );

  closeCommentBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    commentContent.innerText = "";
    addCommentModal.hide();
  });

  cancelCommentBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    commentContent.innerText = "";
    addCommentModal.hide();
  });

  submitCommentBtn.addEventListener("click", async function () {
    if (commentContent.innerText.trim() == "") {
      messageWarning.classList.remove("d-none");
    } else {
      console.log("Message: ", commentContent.innerText);

      if (messageWarning.classList.contains("d-none") == false) {
        messageWarning.classList.add("d-none");
      }

      let body = {
        discussionId: discussionId,
        sender: localStorage.getItem("userId").replaceAll("-", ""),
        comment: commentContent.innerText,
      };

      addCommentModal.hide();

      // call nodeJS add comments endpoint -- POST
      const response = await fetch("/api/comments/add", {
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

      const confirmation = await response.json();

      console.log(confirmation);

      commentContent.innerText = "";

      commentSubmitted.classList.remove("d-none");

      loadComments(discussionId);
    }
  });

  loadComments(discussionId);
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

  let messageSent = document.getElementById("message-sent");
  let closeMsgBtn = document.getElementById("close-button");
  let cancelMsgBtn = document.getElementById("cancel-button");
  let sendMsgBtn = document.getElementById("send-button");
  let messageWarning = document.getElementById("message-warning");
  let messageContent = document.getElementById("message-content");

  let sendMessageModal = new bootstrap.Modal(
    document.getElementById("sendMessageModal"),
    {
      keyboard: false,
    }
  );

  closeMsgBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    messageContent.innerText = "";
    sendMessageModal.hide();
  });

  cancelMsgBtn.addEventListener("click", async function () {
    if (messageWarning.classList.contains("d-none") == false) {
      messageWarning.classList.add("d-none");
    }

    messageContent.innerText = "";
    sendMessageModal.hide();
  });

  sendMsgBtn.addEventListener("click", async function () {
    if (messageContent.innerText.trim() == "") {
      messageWarning.classList.remove("d-none");
    } else {
      console.log("Message: ", messageContent.innerText);

      if (messageWarning.classList.contains("d-none") == false) {
        messageWarning.classList.add("d-none");
      }

      let body = {
        recipient: teacherId,
        message: messageContent.innerText,
        sender: localStorage.getItem("userId").replaceAll("-", ""),
      };

      sendMessageModal.hide();

      // call nodeJS send-message endpoint -- POST
      const response = await fetch("/api/send-message", {
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

      const confirmation = await response.json();

      console.log(confirmation);

      messageContent.innerText = "";

      messageSent.classList.remove("d-none");
    }
  });

  loadShelf("wishlist", teacherId);
  loadShelf("history", teacherId);

  // loop over the results to make one call to GB API per ISBN to render thumbnails on the page
};

async function loadShelf(shelfName, teacherId) {
  let shelf = document.getElementById(shelfName + "-shelf");

  const spinnerDiv = document.createElement("div");
  spinnerDiv.setAttribute("id", "spinner");
  spinnerDiv.classList.add("spinner-border");
  spinnerDiv.setAttribute("role", "status");

  shelf.appendChild(spinnerDiv);

  // make another call to Notion to get the Wishlist
  const booklist = await fetch("/api/" + shelfName + "?id=" + teacherId).then(
    (response) => response.json()
  );

  spinnerDiv.remove();

  console.log(shelfName, booklist);

  // IF there are books in the booklist
  if (booklist.length > 0) {
    for (i = 0; i < booklist.length; i++) {
      const thumbnailDiv = document.createElement("div");
      const anchorThumbnail = document.createElement("a");
      const thumbnailImg = document.createElement("img");
      const detailsDiv = document.createElement("div");
      const bookInfo = document.createElement("div");
      const anchorTitle = document.createElement("a");

      thumbnailDiv.classList.add("m-3");
      detailsDiv.classList.add("my-3", "mx-2");
      bookInfo.classList.add("details-small");

      thumbnailImg.src = booklist[i].properties.thumbnail;
      anchorThumbnail.href =
        "book.html?id=" + booklist[i].properties.ISBN.rich_text[0].plain_text;
      anchorThumbnail.appendChild(thumbnailImg);
      thumbnailDiv.appendChild(anchorThumbnail);

      anchorTitle.innerText = booklist[i].properties.title;
      anchorTitle.href =
        "book.html?id=" + booklist[i].properties.ISBN.rich_text[0].plain_text;

      bookInfo.innerHTML =
        "<a href=" +
        anchorTitle.href +
        ">" +
        anchorTitle.innerText +
        "</a><br>by<br>" +
        booklist[i].properties.authors;

      detailsDiv.appendChild(bookInfo);

      shelf.appendChild(thumbnailDiv);
      shelf.appendChild(detailsDiv);
    }
  } else {
    const messageDiv = document.createElement("div");

    messageDiv.innerText = "There are no books on this shelf yet.";

    shelf.classList.remove("shelf");
    shelf.classList.add("shelf-empty");

    shelf.appendChild(messageDiv);
  }
}
