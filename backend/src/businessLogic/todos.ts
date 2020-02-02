import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { v4 as uuid } from 'uuid'

const fileUploadS3Bucket = process.env.FILE_UPLOAD_S3_BUCKET

const todoAccess = new TodoAccess()

// export async function getAllTodos(): Promise<TodoItem[]> {
//   return todoAccess.getAllTodos()
// }

export async function createTodo(
  name: string,
  dueDate: string,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid()
  const createdAt = new Date().toJSON()
  const attachmentUrl = `https://${fileUploadS3Bucket}.s3.us-east-1.amazonaws.com/${todoId}`

  return await todoAccess.createTodo({
    todoId,
    userId,
    createdAt,
    name,
    dueDate,
    done: false,
    attachmentUrl
  })
}
