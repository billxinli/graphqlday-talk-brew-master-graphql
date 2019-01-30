const http = require('http')
const express = require('express')
const compression = require('compression')
const bodyParser = require('body-parser')

// express
const app = express()

// disable express header
app.disable('x-powered-by')

// 3rd party middleware
app.use(compression())
app.use(bodyParser.json())

app.use(require('./routes'))

// robots.txt
app.route('/robots.txt').get((req, res) => {
  res.type('text/plain')
  res.send('User-agent: *\nDisallow: /')
})

// export server
module.exports = http.createServer(app)
