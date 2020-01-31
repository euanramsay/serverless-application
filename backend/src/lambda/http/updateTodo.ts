import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { DynamoDB } from 'aws-sdk'
import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

const docClient = new DynamoDB.DocumentClient()

const TableName = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { todoId } = event.pathParameters
  const updatedItem: UpdateTodoRequest = JSON.parse(event.body)

  try {
    const { Item } = await docClient
      .get({ TableName, Key: { todoId } })
      .promise()

    const updatedTodo = { ...Item, ...updatedItem }

    const params = {
      TableName,
      Key: { todoId },
      UpdateExpression: 'dueDate = :t, done = :d',
      ExpressionAttributeValues: {
        ':t': updatedTodo.dueDate,
        ':d': updatedTodo.done
      }
    }
    await docClient.update(params).promise()

    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }
}
