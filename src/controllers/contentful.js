const _ = require('lodash')
const fetch = require('node-fetch')
const { HttpLink } = require('apollo-link-http')
const {
  mergeSchemas,
  transformSchema,
  RenameTypes,
  introspectSchema,
  makeRemoteExecutableSchema
} = require('graphql-tools')
const spaces = require('./../config').contentful
const NamespaceUnderFieldTransform = require('./../lib/namespaceUnderFieldTransform')

const getRemoteSchema = async (spaceId, accessToken, typePrefix) => {
  const uri = `https://graphql.contentful.com/content/v1/spaces/${spaceId}/environments/master?access_token=${accessToken}`
  const link = new HttpLink({ uri, fetch })
  const schema = await introspectSchema(link)
  const executableSchema = makeRemoteExecutableSchema({ schema, link })
  const transformedSchema = transformSchema(executableSchema, [
    new RenameTypes(name => `${typePrefix}${_.upperFirst(name)}`),
    // new RenameRootFields((operation, name) => {return `${typePrefix}${_.upperFirst(name)}`}),
    new NamespaceUnderFieldTransform({
      typeName: typePrefix,
      fieldName: typePrefix,
      resolver: null
    })
  ])

  return transformedSchema
}

const cachedSchema = {
  fetched: null
}

module.exports.fetchRemoteSchema = async () => {
  if (cachedSchema.fetched === null) {
    const remoteSchemas = _.compact(await Promise.all(_.map(spaces, async (contentful, key) => {
      console.log({ spaceId: contentful.spaceId, accessToken: contentful.accessToken, key })
      try {
        return await getRemoteSchema(contentful.spaceId, contentful.accessToken, key)
      } catch (e) {
        console.log({
          spaceId: contentful.spaceId,
          accessToken: contentful.accessToken,
          key,
          error: e
        })
      }
      return null
    })))

    cachedSchema.fetched = mergeSchemas({ schemas: remoteSchemas })
  }
  return cachedSchema.fetched
}

