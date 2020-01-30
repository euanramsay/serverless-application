import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId
  console.log('TCL: todoId', todoId)
  const updatedTodo: UpdateTodoRequest = JSON.parse(event.body)
  console.log('TCL: updatedTodo', updatedTodo)

  // TODO: Update a TODO item with the provided id using values in the "updatedTodo" object
  return undefined
}
