import 'source-map-support/register'

import {
  APIGatewayProxyEvent,
  APIGatewayProxyHandler,
  APIGatewayProxyResult
} from 'aws-lambda'

import { DynamoDB } from 'aws-sdk'
import { getUserIdFromJwt } from '../../auth/utils'

const docClient = new DynamoDB.DocumentClient()

const TableName = process.env.TODOS_TABLE
const IndexName = process.env.INDEX_NAME

export const handler: APIGatewayProxyHandler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserIdFromJwt(event)

    const { Items } = await docClient
      .scan({
        TableName,
        IndexName,
        FilterExpression: 'userId=:user',
        ExpressionAttributeValues: { ':user': userId }
      })
      .promise()

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ items: Items })
    }
  } catch (e) {
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: e.message
    }
  }
}
