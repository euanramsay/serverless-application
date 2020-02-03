import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { createLogger } from '../../utils/logger'
import { createTodo } from '../../businessLogic/todos'
import { getUserIdFromJwt } from '../../auth/utils'

const logger = createLogger('http')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserIdFromJwt(event)
    const { name, dueDate }: CreateTodoRequest = JSON.parse(event.body)
    logger.info('Creating todo', { name, dueDate, userId })

    const newTodo = await createTodo(name, dueDate, userId)

    logger.info('Successfully created', { newTodo })

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ item: newTodo })
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
