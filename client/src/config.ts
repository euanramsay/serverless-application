// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = '19yyd4gydf'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  domain: 'dev-hw08mj11.eu.auth0.com', // Auth0 domain
  clientId: 'gbw8ic9kNAaD5isb8AZwH3POcw1L3hiw', // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
