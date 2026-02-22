import React from "react";
import { Plus, CheckCircle2, Circle, AlertCircle, Trash2, Edit2 } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "@corely/ui";
import { CrudListPageLayout } from "@/shared/crud/CrudListPageLayout";
import { fetchTodos, completeTodo, reopenTodo, deleteTodo } from "../todos-api";
import { TodoDto, TodoPriority } from "@corely/contracts";

const priorityMap: Record<TodoPriority, { label: string; color: string }> = {
  low: { label: "Low", color: "bg-blue-100 text-blue-800" },
  medium: { label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  high: { label: "High", color: "bg-red-100 text-red-800" },
};

export const TodosListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["todos"],
    queryFn: () => fetchTodos({ page: 1, pageSize: 100 }),
  });

  const completeMutation = useMutation({
    mutationFn: completeTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Todo completed" });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: reopenTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Todo reopened" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Todo deleted", variant: "destructive" });
    },
  });

  const handleToggle = (todo: TodoDto) => {
    if (todo.status === "done") {
      reopenMutation.mutate(todo.id);
    } else {
      completeMutation.mutate(todo.id);
    }
  };

  return (
    <CrudListPageLayout
      title="Tasks"
      subtitle="Manage your to-do items and stay productive."
      primaryAction={
        <Button onClick={() => navigate("/todos/new")}>
          <Plus className="h-4 w-4 mr-2" /> New Task
        </Button>
      }
    >
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10"></TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data?.items?.map((todo) => (
            <TableRow key={todo.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleToggle(todo)}
                  disabled={completeMutation.isPending || reopenMutation.isPending}
                >
                  {todo.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400" />
                  )}
                </Button>
              </TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span
                    className={todo.status === "done" ? "line-through text-muted-foreground" : ""}
                  >
                    {todo.title}
                  </span>
                  {todo.description && (
                    <span className="text-[11px] text-muted-foreground line-clamp-1">
                      {todo.description}
                    </span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className={priorityMap[todo.priority].color}>
                  {priorityMap[todo.priority].label}
                </Badge>
              </TableCell>
              <TableCell className="text-sm">
                {todo.dueDate ? todo.dueDate.split("T")[0] : "—"}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/todos/${todo.id}/edit`)}>
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteMutation.mutate(todo.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {!isLoading && !data?.items?.length && (
            <TableRow>
              <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-10 w-10 text-muted-foreground/50" />
                  <p>No tasks found. Create one to get started!</p>
                </div>
              </TableCell>
            </TableRow>
          )}
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                Loading tasks...
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </CrudListPageLayout>
  );
};
