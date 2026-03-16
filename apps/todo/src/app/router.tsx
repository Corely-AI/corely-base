import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { RequireAuth } from "./RequireAuth";
import { TodoShell } from "./TodoShell";
import { LoginPage } from "@/routes/auth/LoginPage";
import { SignupPage } from "@/routes/auth/SignupPage";
import { NotFoundPage } from "@/routes/NotFoundPage";
import { TodoDetailPage } from "@/modules/todos/screens/TodoDetailPage";
import { TodoEditPage } from "@/modules/todos/screens/TodoEditPage";
import { TodosListPage } from "@/modules/todos/screens/TodosListPage";

export const Router = () => (
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true,
    }}
  >
    <Routes>
      <Route path="/" element={<Navigate to="/todos" replace />} />
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/signup" element={<SignupPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<TodoShell />}>
          <Route path="/todos" element={<TodosListPage />} />
          <Route path="/todos/new" element={<TodoEditPage />} />
          <Route path="/todos/:id" element={<TodoDetailPage />} />
          <Route path="/todos/:id/edit" element={<TodoEditPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  </BrowserRouter>
);
