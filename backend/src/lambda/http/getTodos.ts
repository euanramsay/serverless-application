import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { DynamoDB } from 'aws-sdk'
import { createLogger } from '../../utils/logger'
import { getUserIdFromJwt } from '../../auth/utils'

const docClient = new DynamoDB.DocumentClient()

const TableName = process.env.TODOS_TABLE
const IndexName = process.env.INDEX_NAME

const logger = createLogger('http')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserIdFromJwt(event)

    logger.info('Getting todos for user', { userId })

    const todoQuery = {
      TableName,
      IndexName,
      KeyConditionExpression: 'userId = :userIdValue',
      ExpressionAttributeValues: { ':userIdValue': userId }
    }

    logger.info('Querying', { todoQuery })

    const { Items } = await docClient.query(todoQuery).promise()

    logger.info('Successfully returned', { Items })

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ items: Items })
    }
  } catch (e) {
    logger.info('Error', { error: e })

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }
}
