import 'source-map-support/register'

import * as AWS from 'aws-sdk'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { createLogger } from '../../utils/logger'

const logger = createLogger('http')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { todoId } = event.pathParameters

  logger.info('Getting signed url', { todoId })

  const s3 = new AWS.S3({ signatureVersion: 'v4' })

  const todoToGetSignedUrl = {
    Bucket: process.env.FILE_UPLOAD_S3_BUCKET,
    Key: todoId,
    Expires: 300
  }

  logger.info('Signed url', { todoToGetSignedUrl })

  const uploadUrl = s3.getSignedUrl('putObject', todoToGetSignedUrl)

  logger.info('Successfully returned', { uploadUrl })

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ uploadUrl })
  }
}
