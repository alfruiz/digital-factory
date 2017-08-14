// app.js

// call the packages we need
import express from 'express'
import bodyParser from 'body-parser'
import uuid from 'uuid'

// get all constants
const app = express()
const port = process.env.PORT || 8080
const min = 60

//local memory
let memory = {
  'test-token': {
    numbers: '3,4,6'
  }
}

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({
  extended: true
})).use(bodyParser.json())

// GENERAL FUNCTIONS
function expireDate(min) {
  let serverDate = new Date()
  let expireDate = new Date(serverDate.getTime() + min * 60000)
  return expireDate.getTime()
}

function removeMemory() {
  let currentDate = new Date()
  for (let k in memory) {
    if (memory[k].expire - currentDate.getTime() < 0) {
      console.log(`remove token: ${k}`)
      delete memory[k]
    }
  }
}

function checkInMemory(token) {
  return (memory.hasOwnProperty(token))
}

// GET METHODS
app.get('/', (req, res) => {
  res.sendFile('doc.html', { root: __dirname })
})

app.get('/api/tokens', (req, res) => {
  res.json(Object.keys(memory))
})

app.get('/api/numbers/:token', (req,res) => {
  let token = req.params.token;
  if (!token) {
    return res.status(400).json({
      msg: 'Token is needed'
    })
  }

  if (!checkInMemory(token)) {
    return res.status(400).json({
      msg: 'Token does\'nt match, please check your token...'
    })
  }

  res.status(200).json(memory[token]);
})


// DEL METHODS
app.delete('/api/tokens/:password', (req, res) => {
  let password = req.params.password;
  if (!password) {
    return res.status(400).json({
      msg: 'Token is needed'
    })
  }

  if (password != 'admin') {
    return res.status(400).json({
      msg: 'Password doesn\'t match'
    })
  }
  //Remove is needed in memory
  removeMemory();
  res.json(Object.keys(memory))
})

app.delete('/api/token/:token', (req, res) => {
  let token = req.params.token;
  if (!token) {
    return res.status(400).json({
      msg: 'Token is needed'
    })
  }

  if (!checkInMemory(token)) {
    return res.status(400).json({
      msg: 'Not token found...'
    })
  }

  //Remove is needed in memory
  delete memory[token];
  res.json({
    msg: `token deleted ${token}`
  })
})


// POST METHODS
app.post('/api/token', (req, res) => {
  let token = uuid.v4()

  memory[token] = {
    expire: expireDate(min)
  }

  res.status(200).json({
    msg: 'Please keep your token',
    token: token
  })
})


//PUT Methods
app.put('/api/numbers/:token', (req, res) => {
  let token = req.params.token;
  if (!token) {
    return res.status(400).json({
      msg: 'Token is needed'
    })
  }

  if (!checkInMemory(token)) {
    return res.status(400).json({
      msg: 'Token is not found, please review API Documentation'
    })
  }

  if (!req.body.numbers) {
    return res.status(400).json({
      msg: 'body of POST should contain numbers'
    })
  }



  if (req.body.numbers.length === 0) {
    return res.status(400).json({
      msg: 'numbers are empty'
    })
  }

  memory[token] = {
    expireDate: expireDate(min),
    numbers: req.body.numbers
  }

  res.status(200).json({
    msg: `numbers are upload to token: ${token}`
  })
})

app.listen(port, function() {
  console.log(`Exam app listening on port ${port}!`)
})