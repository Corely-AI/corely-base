import { apiClient } from "@/lib/api-client";
import {
  TodoDto,
  TodoListQuery,
  TodoListResponse,
  CreateTodoInput,
  UpdateTodoInput,
} from "@corely/contracts";

export const fetchTodos = async (query: TodoListQuery): Promise<TodoListResponse> => {
  const searchParams = new URLSearchParams();
  if (query.page) searchParams.set("page", query.page.toString());
  if (query.pageSize) searchParams.set("pageSize", query.pageSize.toString());
  if (query.q) searchParams.set("q", query.q);
  if (query.status) searchParams.set("status", query.status);
  if (query.priority) searchParams.set("priority", query.priority);

  const qs = searchParams.toString();
  return apiClient.get<TodoListResponse>(`/todos${qs ? `?${qs}` : ""}`);
};

export const fetchTodo = async (id: string): Promise<TodoDto> => {
  return apiClient.get<TodoDto>(`/todos/${id}`);
};

export const createTodo = async (input: CreateTodoInput): Promise<TodoDto> => {
  return apiClient.post<TodoDto>("/todos", input);
};

export const updateTodo = async (id: string, input: UpdateTodoInput): Promise<TodoDto> => {
  return apiClient.patch<TodoDto>(`/todos/${id}`, input);
};

export const deleteTodo = async (id: string): Promise<void> => {
  return apiClient.delete(`/todos/${id}`);
};

export const completeTodo = async (id: string): Promise<TodoDto> => {
  return apiClient.post<TodoDto>(`/todos/${id}/complete`, {});
};

export const reopenTodo = async (id: string): Promise<TodoDto> => {
  return apiClient.post<TodoDto>(`/todos/${id}/reopen`, {});
};
