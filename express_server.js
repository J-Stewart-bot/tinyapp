const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

let logout = false;

const urlsForUser = function(urlDatabase, userID) {
  const myURLS = {};
  for (const index of Object.keys(urlDatabase)) {
    if (userID === urlDatabase[index].userID) {
      myURLS[index] = urlDatabase[index];
    }
  }
  return myURLS;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const myURLS = urlsForUser(urlDatabase, req.cookies["user_id"]);
  let templateVars = {
    urls: myURLS,
    state: logout
  };
  if (req.cookies["user_id"]) {
    templateVars = {
      user: users[req.cookies['user_id']],
      urls: myURLS,
      state: logout
    };
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      user: users[req.cookies['user_id']],
      state: logout
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/u/:id", (req, res) => {
  res.redirect(urlDatabase[req.params.id].longURL)
});

app.get("/register", (req, res) => {
  res.render("urls_registration");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.post("/urls", (req, res) => {
  urlDatabase[generateRandomString()] = {
    longURL: req.body.longURL,
    userID: req.cookies['user_id']
  }
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.cookies['user_id']) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.cookies['user_id']
    }
    res.redirect("/urls");
  } else {
    res.redirect("/urls");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, user: users[req.cookies['user_id']], state: logout };
  res.render("urls_show", templateVars);
});

app.post("/login/go", (req, res) => {
  res.redirect("../login")
});

app.post("/login", (req, res) => {
  for (const index of Object.keys(users)) {
    if (users[index].email == req.body.email) {
      if (users[index].password == req.body.password) {
        res.cookie('user_id', index);
        logout = true;
        res.redirect("urls");
      } else {
        res.send("<html><body>ERROR 403</body></html>\n");
      }
    } 
  }
  res.send("<html><body>ERROR 403</body></html>\n");
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  logout = false;
  res.redirect("urls");
});

app.post("/register/go", (req, res) => {
  res.redirect("../register");
});

app.post("/register", (req, res) => {
  let newId = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.send("<html><body>ERROR 400</body></html>\n");
  } 
  for (const index of Object.keys(users)) {
    if (req.body.email === users[index].email) {
      res.send("<html><body>ERROR 400</body></html>\n");
    }
  }
  users[newId] = {
    id: newId,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', newId);
  logout = true;
  res.redirect("urls");
})

const generateRandomString = function() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};