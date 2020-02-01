import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { CreateTodoRequest } from '../../requests/CreateTodoRequest'
import { DynamoDB } from 'aws-sdk'
import { TodoItem } from '../../models/TodoItem'
import { createLogger } from '../../utils/logger'
import { getUserIdFromJwt } from '../../auth/utils'
import { v4 as uuid } from 'uuid'

const docClient = new DynamoDB.DocumentClient()
const TableName = process.env.TODOS_TABLE
const fileUploadS3Bucket = process.env.FILE_UPLOAD_S3_BUCKET

const logger = createLogger('http')

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const todoId = uuid()
    const userId = getUserIdFromJwt(event)
    const createdAt = new Date().toJSON()
    const { name, dueDate }: CreateTodoRequest = JSON.parse(event.body)
    const attachmentUrl = `https://${fileUploadS3Bucket}.s3.us-east-1.amazonaws.com/${todoId}`

    const Item: TodoItem = {
      todoId,
      userId,
      createdAt,
      name,
      dueDate,
      done: false,
      attachmentUrl
    }

    logger.info('Creating todo', { Item })

    const todoToCreate = {
      TableName,
      Item
    }

    logger.info('Creating', { todoToCreate })

    await docClient.put(todoToCreate).promise()

    logger.info('Successfully created', { todoId })

    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(Item)
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
