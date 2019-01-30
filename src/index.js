const config = require('./config')
const server = require('./server')

server.listen(process.env.PORT || 3000, () => {
  console.log(`Started on port ${server.address().port}`)
})
