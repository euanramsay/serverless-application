import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

// Using require as a workaround, I could not get this to work using import
// Also using aws-xray-sdk-core, I could not get this to work using aws-xray-sdk
const AWSXRay = require('aws-xray-sdk-core')
const AWS = AWSXRay.captureAWS(require('aws-sdk'))

const logger = createLogger('dataLayer')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME
  ) {}

  async createTodoData(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating', { todo })

    const putParams = {
      TableName: this.todosTable,
      Item: todo
    }

    logger.info('Update', { putParams })

    await this.docClient.put(putParams).promise()

    return todo
  }

  async deleteTodoData(todoId: string) {
    logger.info('Deleting', { todoId })

    const deleteParams = {
      TableName: this.todosTable,
      Key: {
        todoId
      }
    }

    logger.info('Update', { deleteParams })

    await this.docClient.delete(deleteParams).promise()
  }

  getSignedUrlData(todoId: string) {
    logger.info('Getting signed url', { todoId })

    const s3 = new AWS.S3({ signatureVersion: 'v4' })

    const getSignedUrlParams = {
      Bucket: process.env.FILE_UPLOAD_S3_BUCKET,
      Key: todoId,
      Expires: 300
    }

    logger.info('Get signed url', { getSignedUrlParams })

    const uploadUrl = s3.getSignedUrl('putObject', getSignedUrlParams)

    return uploadUrl
  }

  async getTodoData(todoId: string): Promise<TodoItem> {
    logger.info('Getting', { todoId })

    const getParams = { TableName: this.todosTable, Key: { todoId } }

    logger.info('Get', { getParams })

    const result = await this.docClient.get(getParams).promise()
    const item = result.Item

    logger.info('Returning', { item })

    return item as TodoItem
  }

  async getTodosData(userId: string): Promise<TodoItem[]> {
    logger.info('Querying', { userId })

    const queryParams = {
      TableName: this.todosTable,
      IndexName: this.indexName,
      KeyConditionExpression: 'userId = :u',
      ExpressionAttributeValues: { ':u': userId }
    }

    logger.info('Update', { queryParams })

    const result = await this.docClient.query(queryParams).promise()
    const items = result.Items

    logger.info('Returning', { items })

    return items as TodoItem[]
  }

  async updateTodoData(updatedItem: TodoItem) {
    logger.info('Updating', { updatedItem })

    const { todoId, dueDate, done, name } = updatedItem

    // Workaround to allow tick boxes in UI to work
    const updateExpression = dueDate
      ? 'set dueDate = :t, done = :d, #n = :n'
      : 'set done = :d, #n = :n'
    const updateParams = {
      TableName: this.todosTable,
      Key: { todoId },
      ExpressionAttributeNames: { '#n': 'name' },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: {
        ':t': dueDate,
        ':d': done,
        ':n': name
      }
    }

    logger.info('Update', { updateParams })

    await this.docClient.update(updateParams).promise()
  }
}
