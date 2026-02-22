import { Route } from "react-router-dom";
import { TodosListPage } from "./screens/TodosListPage";
import { TodoDetailPage } from "./screens/TodoDetailPage";
import { TodoEditPage } from "./screens/TodoEditPage";

export const todoRoutes = (
  <>
    <Route path="/todos" element={<TodosListPage />} />
    <Route path="/todos/new" element={<TodoEditPage />} />
    <Route path="/todos/:id" element={<TodoDetailPage />} />
    <Route path="/todos/:id/edit" element={<TodoEditPage />} />
  </>
);
