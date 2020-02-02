import { TodoAccess } from '../dataLayer/todosAccess'
import { TodoItem } from '../models/TodoItem'
import { v4 as uuid } from 'uuid'

const fileUploadS3Bucket = process.env.FILE_UPLOAD_S3_BUCKET

const todoAccess = new TodoAccess()

export async function createTodo(
  name: string,
  dueDate: string,
  userId: string
): Promise<TodoItem> {
  const todoId = uuid()
  const createdAt = new Date().toJSON()
  const attachmentUrl = `https://${fileUploadS3Bucket}.s3.us-east-1.amazonaws.com/${todoId}`

  return await todoAccess.createTodoData({
    todoId,
    userId,
    createdAt,
    name,
    dueDate,
    done: false,
    attachmentUrl
  })
}

export async function deleteTodo(todoId) {
  return todoAccess.deleteTodoData(todoId)
}

export async function getTodos(userId): Promise<TodoItem[]> {
  return todoAccess.getTodosData(userId)
}
