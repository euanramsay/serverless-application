import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { DynamoDB } from 'aws-sdk'
import { createLogger } from '../../utils/logger'

const docClient = new DynamoDB.DocumentClient()
const TableName = process.env.TODOS_TABLE

const logger = createLogger('http')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { todoId } = event.pathParameters

  logger.info('Deleting todo', { todoId })

  const todoToDelete = {
    TableName,
    Key: {
      todoId
    }
  }

  logger.info('Deleting', { todoToDelete })

  try {
    await docClient.delete(todoToDelete).promise()

    logger.info('Successfully deleted', { todoId })

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
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
