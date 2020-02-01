import 'source-map-support/register'

import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import { Jwks, Key } from '../../auth/Jwks'
import { Secret, decode, verify } from 'jsonwebtoken'

import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'
import { createLogger } from '../../utils/logger'

const logger = createLogger('auth')

const jwksUrl = 'https://dev-hw08mj11.eu.auth0.com/.well-known/jwks.json'

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorising user', {
    authorizationToken: event.authorizationToken
  })

  try {
    const jwtToken = await verifyToken(event.authorizationToken)

    logger.info('User authorised', { jwtToken })

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
    logger.error('User not authorised', { error: e.message })

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

// Attributed to https://gist.github.com/chatu/7738411c7e8dcf604bc5a0aad7937299
const certToPEM = (cert: string): Secret => {
  cert = cert.match(/.{1,64}/g).join('\n')
  cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`
  return cert
}

// Attributed to https://auth0.com/blog/navigating-rs256-and-jwks/
async function verifyToken(authHeader: string): Promise<JwtPayload> {
  try {
    const jwks: Jwks = await Axios.get(jwksUrl)
    const token = getToken(authHeader)
    const jwt: Jwt = decode(token, { complete: true }) as Jwt
    const authHdrKid = jwt.header.kid
    const signingKey: Key = jwks.keys.filter(key => key.kid == authHdrKid)[0]
    const pem = certToPEM(signingKey.x5c[0])
    verify(token, pem)
    return Promise.resolve(jwt.payload)
  } catch (e) {
    console.error(e)
  }
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
