var history = require('connect-history-api-fallback');
var express = require('express');
var path = require('path');


var app = express();
app.use(history({verbose: true}));

app.use(express.static(__dirname + '/dist'));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});


app.listen(3000, function(err) {
  if (err) {
    console.log(err);
    return;
  }

  console.log('Listening at http://localhost:3000');
});
