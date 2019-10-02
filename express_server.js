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
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase };
  if (req.cookies["user_id"]) {
    templateVars = {
      user: users[req.cookies['user_id']],
      urls: urlDatabase
    };
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      user: users[req.cookies['user_id']]
    };
    res.render("urls_new", templateVars);
  } else {
    res.render("urls_new");
  }
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
  urlDatabase[generateRandomString()] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/edit", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], user: users[req.cookies['user_id']] };
  res.render("urls_show", templateVars);
});

app.post("/login/go", (req, res) => {
  res.redirect("../login")
});

app.post("/login", (req, res) => {
  for (const index of Object.keys(users)) {
    if (users[index].email === req.body.email) {
      if (users[index].password === req.body.password) {
        res.cookie('user_id', index);
        res.redirect("urls");
      } else {
        res.send("<html><body>ERROR 403</body></html>\n");
      }
    } else {
      res.send("<html><body>ERROR 403</body></html>\n");
    }
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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