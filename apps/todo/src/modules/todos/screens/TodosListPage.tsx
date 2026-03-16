import React, { useDeferredValue, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  useToast,
} from "@corely/ui";
import {
  AlertCircle,
  CheckCircle2,
  Circle,
  Edit2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { type TodoDto } from "@corely/contracts";
import { completeTodo, deleteTodo, fetchTodos, reopenTodo } from "../todos-api";

const priorityStyles = {
  low: "bg-blue-100 text-blue-800 border-blue-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  high: "bg-rose-100 text-rose-800 border-rose-200",
} as const;

type StatusFilter = "all" | "open" | "done";

export const TodosListPage: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const deferredSearch = useDeferredValue(search);

  const { data, isLoading } = useQuery({
    queryKey: ["todos", deferredSearch, status],
    queryFn: () =>
      fetchTodos({
        page: 1,
        pageSize: 100,
        q: deferredSearch.trim() || undefined,
        status: status === "all" ? undefined : status,
      }),
  });

  const completeMutation = useMutation({
    mutationFn: completeTodo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Task completed" });
    },
  });

  const reopenMutation = useMutation({
    mutationFn: reopenTodo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Task reopened" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTodo,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["todos"] });
      toast({ title: "Task deleted", variant: "destructive" });
    },
  });

  const items = data?.items ?? [];
  const openCount = items.filter((todo) => todo.status === "open").length;
  const doneCount = items.filter((todo) => todo.status === "done").length;
  const overdueCount = items.filter((todo) => {
    if (!todo.dueDate || todo.status === "done") {
      return false;
    }
    return new Date(todo.dueDate).getTime() < Date.now();
  }).length;

  const toggleTodo = (todo: TodoDto) => {
    if (todo.status === "done") {
      reopenMutation.mutate(todo.id);
      return;
    }

    completeMutation.mutate(todo.id);
  };

  const removeTodo = (todo: TodoDto) => {
    if (!window.confirm(`Delete "${todo.title}"?`)) {
      return;
    }

    deleteMutation.mutate(todo.id);
  };

  return (
    <div className="space-y-6 p-4 lg:p-8">
      <section className="rounded-[2rem] border border-border/70 bg-background/80 p-6 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              Personal task cockpit
            </Badge>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight">Stay on top of work</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                A dedicated frontend for the todo module. Filter fast, close work quickly, and
                keep the backend API isolated behind a purpose-built client.
              </p>
            </div>
          </div>

          <Button size="lg" onClick={() => navigate("/todos/new")}>
            <Plus className="mr-2 h-4 w-4" />
            Create task
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[1.75rem] border-border/70 bg-background/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{openCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.75rem] border-border/70 bg-background/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Done</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{doneCount}</p>
          </CardContent>
        </Card>
        <Card className="rounded-[1.75rem] border-border/70 bg-background/80">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overdue</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-semibold">{overdueCount}</p>
          </CardContent>
        </Card>
      </section>

      <Card className="rounded-[2rem] border-border/70 bg-background/85 shadow-sm">
        <CardHeader className="gap-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-md">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks"
                className="pl-9"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              {(["all", "open", "done"] as const).map((option) => (
                <Button
                  key={option}
                  type="button"
                  variant={status === option ? "default" : "outline"}
                  onClick={() => setStatus(option)}
                  className="capitalize"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead>Task</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Due</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((todo) => (
                <TableRow key={todo.id}>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleTodo(todo)}
                      disabled={completeMutation.isPending || reopenMutation.isPending}
                      aria-label={
                        todo.status === "done"
                          ? `Reopen ${todo.title}`
                          : `Mark ${todo.title} as complete`
                      }
                    >
                      {todo.status === "done" ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      <Link
                        to={`/todos/${todo.id}`}
                        className={[
                          "font-medium transition hover:text-primary",
                          todo.status === "done" ? "line-through text-muted-foreground" : "",
                        ].join(" ")}
                      >
                        {todo.title}
                      </Link>
                      {todo.description ? (
                        <p className="line-clamp-1 text-xs text-muted-foreground">
                          {todo.description}
                        </p>
                      ) : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={priorityStyles[todo.priority]}>
                      {todo.priority}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : "No due date"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate(`/todos/${todo.id}/edit`)}
                        aria-label={`Edit ${todo.title}`}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive"
                        onClick={() => removeTodo(todo)}
                        aria-label={`Delete ${todo.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}

              {!isLoading && items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20">
                    <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                      <AlertCircle className="h-10 w-10 opacity-50" />
                      <div>
                        <p className="font-medium text-foreground">No tasks found</p>
                        <p className="text-sm">Create a new task or change the current filters.</p>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : null}

              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                    Loading tasks…
                  </TableCell>
                </TableRow>
              ) : null}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};
