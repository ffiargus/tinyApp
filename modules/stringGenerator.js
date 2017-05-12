module.exports = function () {
  var text = "";
  var possible = "ZXCVBNMASDFGHJKLQWERTYUIOPzxcvbnmasdfghjklqwertyuiop1234567890";
  for(var i = 0; i < 6; i++) {
    text += possible[Math.floor(Math.random()*possible.length)];
  }
  return text;
}
