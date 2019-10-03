const express = require("express");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
// const getUserByEmail = require("getUserByEmail");
const app = express();
const PORT = 8080; // default port 8080
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
app.set("view engine", "ejs");

const users = {};
const urlDatabase = {};
let usersURLS = {};

const urlsForUser = function(urlDatabase, userID) {
  const myURLS = {};
  for (const index of Object.keys(urlDatabase)) {
    if (userID === urlDatabase[index].userID) {
      myURLS[index] = urlDatabase[index];
    }
  }
  return myURLS;
};

const generateRandomString = function() {
  let result = '';
  let chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
};



app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    usersURLS = urlsForUser(urlDatabase, req.session.user_id);
    let templateVars = {
      urls: usersURLS,
      user: users[req.session.user_id]
    };
    res.render("urls_index", templateVars);
  } else {
    res.send("<html><body>ERROR 400</body></html>\n");
  }
});

app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let templateVars = {
      user: users[req.session.user_id],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/:shortURL", (req, res) => {
  if (typeof req.session.user_id === undefined) {
    res.send("<html><body>ERROR 400</body></html>\n");
  } else if (typeof urlDatabase[req.params.shortURL] === undefined) {
    res.send("<html><body>ERROR 400</body></html>\n");
  } else if (req.session.user_id && typeof usersURLS[req.session.user_id] === undefined) {
    res.send("<html><body>ERROR 400</body></html>\n");
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      user: users[req.session.user_id]
    };
    res.render("urls_show", templateVars);
  }
});

app.get("/u/:id", (req, res) => {
  try {
    res.redirect(urlDatabase[req.params.id].longURL);
  } catch (err) {
    res.send("<html><body>ERROR 400</body></html>\n");
  }
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_registration");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    res.render("urls_login");
  }
});



app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    urlDatabase[generateRandomString()] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls");
  } else {
    res.send("<html><body>ERROR 403</body></html>\n");
  }
});

app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userID === req.session.user_id) {
    urlDatabase[req.params.shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id
    };
    res.redirect("/urls");
  } else if (req.session.user_id && typeof usersURLS[req.session.user_id] === undefined) {
    res.send("<html><body>ERROR 403</body></html>\n");
  } else {
    res.send("<html><body>ERROR 403</body></html>\n");
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    console.log("HERE");
    res.redirect('/urls');
  }
});

app.post("/login", (req, res) => {
  for (const index of Object.keys(users)) {
    if (users[index].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[index].password)) {
        req.session.user_id = index;
        res.redirect("urls");
      } else {
        res.send("<html><body>ERROR 403</body></html>\n");
      }
    }
  }
  res.send("<html><body>ERROR 403</body></html>\n");
});

app.post("/logout", (req, res) => {
  req.session.user_id = undefined;
  res.redirect("/login");
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
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_id = newId;
  res.redirect("urls");
});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});