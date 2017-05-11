var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
// var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  secret: "HelloWorld",
  maxAge: 60 * 60 * 1000

}));
app.set("view engine", "ejs");

var urlDatabase = {
  "Sad342": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  "V34Fvd": {
    "9SAen2": "http://www.twitter.com"
  }
};

const user1Pass = bcrypt.hashSync("password", 10);
const user2Pass = bcrypt.hashSync("123", 10);

const users = {
  "Sad342": {
    id: "Sad342",
    email: "user@example.com",
    password: user1Pass
  },
  "V34Fvd": {
    id: "V34Fvd",
    email: "coolguy@gmail.com",
    password: user2Pass
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

function duplicateStringChecker(check) {
  for(user in urlDatabase){
    if(urlDatabase[user][check] || users[check]) {
      check = generateRandomString();
      duplicateStringChecker(check);
    }
  }
  return check;
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
      if (bcrypt.compareSync(pass, users[user]["password"]))
        userId = users[user]["id"];
    }
  }
  return userId;
}

app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
                       user: users[req.session.user_id]
                     };
  if (templateVars.user)
    res.render("urls_new", templateVars);
  else
    res.redirect("/login");
});

app.post("/register", (req, res) => {
  if (req.body.email == "" || req.body.password == "" || duplicateEmailChecker(req.body.email) == true) {
    console.log("Invalid email and/or password!");
    res.send(res.statusCode = 400);
    //res.redirect("/urls");
  } else {
    let tempId = generateRandomString();
    tempId = duplicateStringChecker(tempId);
    users[tempId] = {};
    users[tempId]["id"] = tempId;
    users[tempId]["email"] = req.body.email;
    users[tempId]["password"] = bcrypt.hashSync(req.body.password, 10);
    urlDatabase[tempId] = {};
    req.session.user_id = tempId;
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  var tinyurl = generateRandomString();
  tinyurl = duplicateStringChecker(tinyurl);
  urlDatabase[req.session.user_id][tinyurl] = req.body.longURL;
  res.redirect("/urls");
  // res.render("/urls_index");
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  delete urlDatabase[req.session.user_id][req.params.id];
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect("/urls");
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  console.log(req.params.id);
  urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect("/urls");
});

app.get("/login", (req, res) => {
  res.render("urls_login");
})

app.post("/login", (req, res) => {
  let loginStatus = loginChecker(req.body.email, req.body.password);
  if (loginStatus == ""){
    res.send(res.statusCode = 403);
  } else {
    req.session.user_id = loginStatus;
    res.redirect("/urls");
  }
});

app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.shortURL;
  for(user in urlDatabase){
    if(urlDatabase[user][longURL]){
      res.redirect(urlDatabase[user][longURL]);
    }
  }
  // res.redirect(urlDatabase[req.cookies["user_id"]][longURL]);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase[req.session.user_id],
                       user: users[req.session.user_id]
                     };
  // console.log(req.cookies["user_id"]);
  // console.log(templateVars.urls);
  // console.log(req.cookies["user_id"]);
  res.render("urls_index", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.session.user_id][req.params.id],
                       user: users[req.session.user_id]
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