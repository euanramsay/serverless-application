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

  async getTodosData(userId: string): Promise<TodoItem[]> {
    logger.info('Querying', { userId })

    const result = await this.docClient
      .query({
        TableName: this.todosTable,
        IndexName: this.indexName,
        KeyConditionExpression: 'userId = :u',
        ExpressionAttributeValues: { ':u': userId }
      })
      .promise()

    const items = result.Items
    return items as TodoItem[]
  }

  async createTodoData(todo: TodoItem): Promise<TodoItem> {
    logger.info('Creating', { todo })

    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }

  async deleteTodoData(todoId: string) {
    logger.info('Deleting', { todoId })

    await this.docClient
      .delete({
        TableName: this.todosTable,
        Key: {
          todoId
        }
      })
      .promise()
  }
}
