const router = require('express-promise-router')()
const graphqlHTTP = require('express-graphql')

const contentful = require('./controllers/contentful')

router.use('/graphql', graphqlHTTP(async () => ({
  schema: await contentful.fetchRemoteSchema(),
  graphiql: true
})))

module.exports = router
