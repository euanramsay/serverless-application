import * as AWS from 'aws-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
import { createLogger } from '../utils/logger'

// import * as AWSXRay from 'aws-xray-sdk'

// const XAWS = AWSXRay.captureAWS(AWS)
const logger = createLogger('dataLayer')

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly indexName = process.env.INDEX_NAME
  ) {}

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

  async updateTodoData(updatedItem) {
    logger.info('Updating', { updatedItem })

    const { todoId, dueDate, done, name } = updatedItem
    const updateParams = {
      TableName: this.todosTable,
      Key: { todoId },
      ExpressionAttributeNames: { '#n': 'name' },
      UpdateExpression: 'set dueDate = :t, done = :d, #n = :n',
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
