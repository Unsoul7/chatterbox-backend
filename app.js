const express = require('express')
const router = require('./routes')
const app = express()
const session = require('express-session')
const cors = require('cors')

const path = require('path')
app.use(cors())
app.use(express.json());
app.use(session({
  saveUninitialized : false,
  resave: false,
  secret : 'oldmonkbrocode'
}))
app.use(express.static('public'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'))


app.listen(5000)

module.exports = app