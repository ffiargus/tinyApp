var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
var cookieParser = require('cookie-parser')
const bodyParser = require("body-parser");

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "wem": {
    id: "wem",
    email: "user@example.com",
    password: "password"
  },
  "vhf": {
    id: "vhf",
    email: "coolguy@gmail.com",
    password: "123"
  }
};

function generateRandomString() {
  var text = "";
  var possible = "ZXCVBNMASDFGHJKLQWERTYUIOPzxcvbnmasdfghjklqwertyuiop1234567890";
  for(var i = 0; i < 6; i++) {
    text += possible[Math.floor(Math.random()*possible.length)];
  }
  return text;
}

function duplicateEmailChecker(email) {
  let dupe = false;
  for (user in users) {
    if (users[user]["email"] == email) {
      dupe = true;
    }
  }
  return dupe;
}

function loginChecker(email, pass) {
  let userId = "";
  for (user in users) {
    if (users[user]["email"] == email) {
      if (users[user]["password"] == pass)
        userId = users[user]["id"];
    }
  }
  return userId;
}

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
                       user: users[req.cookies["user_id"]]
                     };

  res.render("urls_new", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email == "" || req.body.password == "" || duplicateEmailChecker(req.body.email) == true) {
    console.log("Invalid email and/or password!");
    res.send(res.statusCode = 400);
    //res.redirect("/urls");
  } else {
    let tempId = generateRandomString();
    users[tempId] = {};
    users[tempId]["id"] = tempId;
    users[tempId]["email"] = req.body.email;
    users[tempId]["password"] = req.body.password;
    res.cookie("user_id", tempId);
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  var tinyurl = generateRandomString();
  console.log(tinyurl);
  urlDatabase[tinyurl] = req.body.longURL;
  // res.render("/urls_index");
});

app.get("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  delete urlDatabase[req.params.id]
  console.log("lighhouse sucks")
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/login", (req, res) => {
  res.render("urls_login");
})

app.post("/login", (req, res) => {
  let loginStatus = loginChecker(req.body.email, req.body.password);
  if (loginStatus == ""){
    res.send(res.statusCode = 403);
  } else {
    res.cookie("user_id", loginStatus);
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.shortURL;
  res.redirect(urlDatabase[longURL]);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase,
                       user: users[req.cookies["user_id"]]
                     };
  console.log(users[req.cookies["user_id"]]);
  console.log(users);
  console.log(req.cookies["user_id"]);
  res.render("urls_index", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id],
                       user: users[req.cookies["user_id"]]
                     };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  //res.end("<html><body>Hello <b>World</b></body></html>\n");
  res.redirect("/urls/");
})

app.listen(PORT, () => {
  console.log( `Example app listening on port ${PORT}!`);
});