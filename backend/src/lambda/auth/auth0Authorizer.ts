import 'source-map-support/register'

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { Jwks, Key } from '../../auth/Jwks'
import { decode, verify } from 'jsonwebtoken'

import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const jwksUrl = 'https://dev-hw08mj11.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

// Code snippet from https://gist.github.com/chatu/7738411c7e8dcf604bc5a0aad7937299
function certToPEM(cert) {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  // const token = getToken(authHeader)
  // const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // const { data } = await Axios.get(jwksUrl)

  // const signingKey = data.keys.find(key => key.kid === jwt.header.kid)

  // const cert: string = signingKey.x5c[0]

  // return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
  const jwks: Jwks = await Axios.get(jwksUrl)
  // Extract the JWT from the request's authorization header.
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  // Decode the JWT and grab the kid property from the header.
  const authHdrKid = jwt.header.kid
  // Find a signing key in the filtered JWKS with a matching kid property
  const signingKey: Key = jwks.keys.filter(key => key.kid == authHdrKid)[0]
  // Using the x5c property build a certificate which will be used to verify the JWT signature.
  const pem = certToPEM(signingKey.x5c[0])
  // Ensure the JWT contains the expected audience, issuer, expiration, etc.
  verify(token, pem)
  // This is async function, so return the result as a promise that resolves to the payload
  return Promise.resolve(jwt.payload)
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
