'use strict';

var _express = require('express');

var _express2 = _interopRequireDefault(_express);

var _bodyParser = require('body-parser');

var _bodyParser2 = _interopRequireDefault(_bodyParser);

var _uuid = require('uuid');

var _uuid2 = _interopRequireDefault(_uuid);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// get all constants
// app.js

// call the packages we need
var app = (0, _express2.default)();
var port = process.env.PORT || 3000;
var min = 60;

//local memory
var memory = {
  'test-token': {
    numbers: [3, 4, 6]
  }

  // configure app to use bodyParser()
  // this will let us get the data from a POST
};app.use(_bodyParser2.default.urlencoded({
  extended: true
})).use(_bodyParser2.default.json());

// GENERAL FUNCTIONS
function expireDate(min) {
  var serverDate = new Date();
  var expireDate = new Date(serverDate.getTime() + min * 60000);
  return expireDate.getTime();
}

function removeMemory() {
  var currentDate = new Date();
  for (var k in memory) {
    if (memory[k].expire - currentDate.getTime() < 0) {
      //console.log(`remove token: ${k}`)
      delete memory[k];
    }
  }
}

function checkInMemory(token) {
  return memory.hasOwnProperty(token);
}

// GET METHODS
app.get('/', function (req, res) {
  res.sendFile(_path2.default.resolve('app/views/doc.html'));
  // res.sendFile('../views/doc.html', { root: __dirname })
});

app.get('/api/tokens', function (req, res) {
  res.json(Object.keys(memory));
});

app.get('/api/numbers', function (req, res) {
  var token = req.get('Authorization') || 0;
  if (!token) {
    return res.status(400).json({
      msg: 'Token is needed'
    });
  }

  if (!checkInMemory(token)) {
    return res.status(400).json({
      msg: 'Token does\'nt match, please check your token...'
    });
  }

  res.status(200).json(memory[token]);
});

// DEL METHODS
app.delete('/api/tokens/:password', function (req, res) {
  var password = req.params.password;
  if (!password) {
    return res.status(400).json({
      msg: 'Token is needed'
    });
  }

  if (password != 'admin') {
    return res.status(400).json({
      msg: 'Password doesn\'t match'
    });
  }
  //Remove is needed in memory
  removeMemory();
  res.json(Object.keys(memory));
});

app.delete('/api/token', function (req, res) {
  var token = req.get('Authorization') || 0;
  if (!token) {
    return res.status(400).json({
      msg: 'Token is needed'
    });
  }

  if (!checkInMemory(token)) {
    return res.status(400).json({
      msg: 'Not token found...'
    });
  }

  //Remove is needed in memory
  delete memory[token];
  res.json({
    msg: 'token deleted ' + token
  });
});

// POST METHODS
app.post('/api/token', function (req, res) {
  var token = _uuid2.default.v4();
  var name = req.body.name || 0;

  if (!name) {
    return res.status(401).json({
      msg: 'Name is needed to create token'
    });
  }

  memory[token] = {
    expire: expireDate(min),
    name: name
  };

  res.status(200).json({
    token: token
  });
});

//PUT Methods
app.put('/api/numbers', function (req, res) {
  var token = req.get('Authorization') || 0;
  var num = req.body.numbers || 0;
  if (!token) {
    return res.status(401).json({
      msg: 'Token is needed on the HEAD'
    });
  }

  if (!checkInMemory(token)) {
    return res.status(410).json({
      msg: 'Token is not found, please review API Documentation'
    });
  }

  if (!num || !Array.isArray(num)) {
    return res.status(400).json({
      msg: 'the body should have an specific structure, please review API Documentation'
    });
  }

  if (num.length === 0) {
    return res.status(400).json({
      msg: 'numbers are empty'
    });
  }

  memory[token] = {
    expireDate: expireDate(min),
    numbers: num
  };

  res.status(200).json({
    msg: 'numbers are upload to token: ' + token
  });
});

app.listen(port, function () {
  console.log('Exam app listening on port ' + port + '!');
});
