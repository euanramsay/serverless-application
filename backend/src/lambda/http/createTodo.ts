import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { DynamoDB } from 'aws-sdk'
import { TodoItem } from '../../models/TodoItem'
import { getUserIdFromJwt } from '../../auth/utils'
import { v4 as uuid } from 'uuid'

const docClient = new DynamoDB.DocumentClient()

const todosTable = process.env.TODOS_TABLE

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)
  const { name, dueDate }: CreateTodoRequest = JSON.parse(event.body)

  const todoId = uuid()
  const userId = getUserIdFromJwt(event)
  const createdAt = new Date().toJSON()

  const Item: TodoItem = {
    todoId,
    userId,
    createdAt,
    name,
    dueDate,
    done: false
  }

  await docClient
    .put({
      TableName: todosTable,
      Item
    })
    .promise()

  return {
    statusCode: 201,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify({
      Item
    })
  }
}
