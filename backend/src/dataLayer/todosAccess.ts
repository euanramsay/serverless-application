import * as AWS from 'aws-sdk'

import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { TodoItem } from '../models/TodoItem'
// import * as AWSXRay from 'aws-xray-sdk'


// const XAWS = AWSXRay.captureAWS(AWS)

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new AWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE
  ) {}

  // async getAllTodos(): Promise<TodoItem[]> {
  //   console.log('Getting all todos')

  //   const result = await this.docClient
  //     .scan({
  //       TableName: this.todosTable
  //     })
  //     .promise()

  //   const items = result.Items
  //   return items as TodoItem[]
  // }

  async createTodo(todo: TodoItem): Promise<TodoItem> {
    await this.docClient
      .put({
        TableName: this.todosTable,
        Item: todo
      })
      .promise()

    return todo
  }
}
