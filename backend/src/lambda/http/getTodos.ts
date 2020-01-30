import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { DynamoDB } from 'aws-sdk'
import { getUserIdFromJwt } from '../../auth/utils'

const todosTable = process.env.TODO_TABLE
const indexName = process.env.INDEX_NAME

const docClient = new DynamoDB.DocumentClient()

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Processing event: ', event)

  const result = await docClient
    .scan({
      TableName: todosTable,
      IndexName: indexName,
      FilterExpression: 'userId=:user',
      ExpressionAttributeValues: { ':user': getUserIdFromJwt(event) }
    })
    .promise()

  const items = result.Items

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      items
    })
  }
}
