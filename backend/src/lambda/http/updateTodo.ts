import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { DynamoDB } from 'aws-sdk'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const docClient = new DynamoDB.DocumentClient()

const TableName = process.env.TODOS_TABLE

const logger = createLogger('http')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { todoId } = event.pathParameters

  logger.info(`Updating todo ${todoId}`)

  const updatedItem: UpdateTodoRequest = JSON.parse(event.body)

  try {
    const { Item } = await docClient
      .get({ TableName, Key: { todoId } })
      .promise()

    const updatedTodo = { ...Item, ...updatedItem }

    const todoToUpdate = {
      TableName,
      Key: { todoId },
      UpdateExpression: 'dueDate = :t, done = :d',
      ExpressionAttributeValues: {
        ':t': updatedTodo.dueDate,
        ':d': updatedTodo.done
      }
    }

    logger.info(`Updating ${todoToUpdate}`)

    await docClient.update(todoToUpdate).promise()

    logger.info(`Successfully updated ${todoId}`)

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  } catch (e) {
    logger.info(`Error ${e}`)

    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }
}
