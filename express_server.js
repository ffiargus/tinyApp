//Declase and use dependencies
var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const methodOverride = require("method-override");
const cookieSession = require("cookie-session");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
//custom module for string generator
const generateRandomString = require("./modules/stringGenerator")

app.use(methodOverride("_method"));
app.use(express.static(__dirname + '/views'));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  secret: "HelloWorld",
  maxAge: 60 * 60 * 1000

}));
app.set("view engine", "ejs");

//default url and user databases
var urlDatabase = {
  "Sad342": {
    "b2xVn2": {
      fullURL: "http://www.lighthouselabs.ca",
      timesVisited: 0,
      uniqueVisited: 0,
      allVisits: []
    },
    "9sm5xK": {
      fullURL: "http://www.google.com",
      timesVisited: 0,
      uniqueVisited: 0,
      allVisits: []
    }
  },
  "V34Fvd": {
    "9SAen2": {
      fullURL: "http://www.twitter.com",
      timesVisited: 0,
      uniqueVisited: 0,
      allVisits: []
    }
  }
};

const users = {
  "Sad342": {
    id: "Sad342",
    email: "user@example.com",
    password: bcrypt.hashSync("password", 10)
  },
  "V34Fvd": {
    id: "V34Fvd",
    email: "coolguy@gmail.com",
    password: bcrypt.hashSync("123", 10)
  }
};

//arrays for "popular links" feature
var topVisits = [0, 0, 0, 0, 0];
var topLink = ["", "", "", "", ""];
var posts = [];

//Helper functions
function duplicateStringChecker(check) {
  for(user in urlDatabase){
    if(urlDatabase[user][check] || users[check]) {
      check = generateRandomString();
      duplicateStringChecker(check);
    };
  };
  return check;
};

function duplicateEmailChecker(email) {
  let dupe = false;
  for (user in users) {
    if (users[user]["email"] == email) {
      dupe = true;
    };
  };
  return dupe;
};

function loginChecker(email, pass) {
  let userId = "";
  for (user in users) {
    if (users[user]["email"] == email) {
      if (bcrypt.compareSync(pass, users[user]["password"]))
        userId = users[user]["id"];
    };
  };
  return userId;
};

//function that orders most popular urls using
//two linked arrays
function topLinkFinder(visits, url) {
  for (var i = 0; i < 5; i++) {
    if (visits > topVisits[i]){
      if (url == topLink[i]){
        topVisits[i] = visits;
        break;
      } else {
        topVisits.splice(i, 0, visits);   //These two arrays are always modified
        topLink.splice(i, 0, url);        //together to keep them linked
        for (var k = i + 1; k < 5; k++) {
          if (topLink[i] == topLink[k]) {   //inserts value where it should be
            topVisits.splice(k, 1);
            topLink.splice(k, 1);
            break;
          };
        };
        topVisits.splice(6, 1);
        topLink.splice(6, 1);
        break;
      };
    };
  };
};

app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
                       user: users[req.session.user_id],
                       topLinks: topLink
                     };
  if (templateVars.user)
    res.render("urls_new", templateVars);
  else
    res.redirect("/login");
});

//Registration checks if the user and password are valid and not
//already in use, then adds the user to the user database
app.post("/register", (req, res) => {
  if (req.body.email == "" || req.body.password == "" || duplicateEmailChecker(req.body.email) == true) {
    console.log("Invalid email and/or password!");
    res.send(res.statusCode = 400);
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
  if (req.body.longURL == "") {
    res.send("Invalid URL");
  } else {
    var tinyurl = generateRandomString();
    tinyurl = duplicateStringChecker(tinyurl);
    urlDatabase[req.session.user_id][tinyurl] = {
      "fullURL": "",
      "timesVisited": 0,
      "uniqueVisited": 0,
      "allVisits": []
    };
    urlDatabase[req.session.user_id][tinyurl].fullURL = req.body.longURL;
    res.redirect("/urls");
  }
});

app.get("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

//uses method overriding as delete can be used with forms
app.delete("/urls/:id", (req, res) => {
  delete urlDatabase[req.session.user_id][req.params.id];
  res.redirect("/urls");
});

//uses put as this is updating rather than creating
app.put("/urls/:id", (req, res) => {
  if (req.body.longURL == "") {
    res.send("Invalid URL");
  } else {
    urlDatabase[req.session.user_id][req.params.id].fullURL = req.body.longURL;
    urlDatabase[req.session.user_id][req.params.id].timesVisited = 0;
    urlDatabase[req.session.user_id][req.params.id].uniqueVisited = 0;
    req.session[req.params.id] = null;
    res.redirect("/urls");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      topLinks: topLink
    };
    res.render("urls_login", templateVars);
  };
});

app.post("/login", (req, res) => {
  let loginStatus = loginChecker(req.body.email, req.body.password);
  if (loginStatus == ""){
    res.send(res.statusCode = 403);
  } else {
    req.session.user_id = loginStatus;
    res.redirect("/urls");
  };
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    let templateVars = {
      topLinks: topLink
    };
    res.render("urls_register", templateVars);
  }
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.shortURL;
  for(user in urlDatabase){
    if(urlDatabase[user][longURL]){
      urlDatabase[user][longURL].timesVisited++;
      topLinkFinder(urlDatabase[user][longURL].timesVisited, longURL)
      let d = new Date();
      urlDatabase[user][longURL].allVisits.push(d + " : " + generateRandomString());
      if(!req.session[longURL]) {
        urlDatabase[user][longURL].uniqueVisited++;
        req.session[longURL] = 1;
      };
      res.redirect(urlDatabase[user][longURL].fullURL);
    };
  };
});

//allows user to post to chatbox and refreshes page to
//update chatbox
app.post("/chat", (req, res) => {
  let currentTime = new Date();
  let currentUser = "Guest";
  let hours = currentTime.getHours();
  let minutes = currentTime.getMinutes();
  if (minutes < 10) {
    minutes = "0" + minutes;
  }
  if (hours < 10) {
    hours = "0" + hours;
  }
  if (req.session.user_id) {
    currentUser = users[req.session.user_id].id;
  }
  posts.push(`[${hours}:${minutes}] ${currentUser}: ${req.body.post}`);
  res.redirect("/urls");
});

app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase[req.session.user_id],
    user: users[req.session.user_id],
    topLinks: topLink,
    chatLog: posts
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {

  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.session.user_id][req.params.id],
    user: users[req.session.user_id],
    topLinks: topLink
  };
  if (templateVars.user)
    res.render("urls_show", templateVars);
  else
    res.redirect("/urls");
});

app.get("/hello", (req, res) => {
  res.redirect("/urls/");
})

app.listen(PORT, () => {
  console.log( `URshortLs app listening on port ${PORT}!`);
});