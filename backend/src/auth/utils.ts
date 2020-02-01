import { APIGatewayProxyEvent } from 'aws-lambda'
import { JwtPayload } from './JwtPayload'
import { decode } from 'jsonwebtoken'

/**
 * Parse a JWT token and return a user id
 * @param jwtToken JWT token to parse
 * @returns a user id from the JWT token
 */
export function parseUserId(jwtToken: string): string {
  const decodedJwt = decode(jwtToken) as JwtPayload
  return decodedJwt.sub
}

export const getUserIdFromJwt = (event: APIGatewayProxyEvent) => {
  const jwtToken = event.headers.Authorization.split(' ')[1]
  const userId = decode(jwtToken).sub
  return userId
}
