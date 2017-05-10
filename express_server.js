var express = require("express");
var app = express();
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

function generateRandomString() {
  var text = "";
  var possible = "ZXCVBNMASDFGHJKLQWERTYUIOPzxcvbnmasdfghjklqwertyuiop1234567890";
  for(var i = 0; i < 6; i++) {
    text += possible[Math.floor(Math.random()*possible.length)];
  }
  return text;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.use(express.static(__dirname + '/views'));

app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
  var tinyurl = generateRandomString();
  console.log(tinyurl);
  urlDatabase[tinyurl] = req.body.longURL;
  // res.render("/urls_index");
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  delete urlDatabase[req.params.id]
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.post("/urls/:id", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  console.log(req.params.id);
  urlDatabase[req.params.id] = req.body.longURL;
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = req.params.shortURL;
  res.redirect(urlDatabase[longURL]);
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
})

app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                       longURL: urlDatabase[req.params.id]
                     };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
})

app.listen(PORT, () => {
  console.log( `Example app listening on port ${PORT}!`);
});