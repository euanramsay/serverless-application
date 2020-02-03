import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'
import { getTodo, updateTodo } from '../../businessLogic/todos'

import { UpdateTodoRequest } from '../../requests/UpdateTodoRequest'
import { createLogger } from '../../utils/logger'

const logger = createLogger('http')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  const { todoId } = event.pathParameters

  logger.info(`Updating todo ${todoId}`)

  const updatedItem: UpdateTodoRequest = JSON.parse(event.body)

  try {
    logger.info('Getting todo', { todoId })

    const Item = await getTodo(todoId)

    logger.info('Successfully returned', { Item })

    const updatedTodo = { ...Item, ...updatedItem }

    logger.info('Updating', { updatedTodo })

    await updateTodo(updatedTodo)

    logger.info('Successfully updated', { updatedTodo })

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
