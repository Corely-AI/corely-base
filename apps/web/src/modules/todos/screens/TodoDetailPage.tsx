import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, Badge, useToast } from "@corely/ui";
import { fetchTodo, completeTodo, reopenTodo, deleteTodo } from "../todos-api";
import { ChevronLeft, Edit2, Trash2, CheckCircle2, Circle, Loader2, Calendar } from "lucide-react";

export const TodoDetailPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: todo, isLoading } = useQuery({
    queryKey: ["todos", id],
    queryFn: () => fetchTodo(id!),
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
      navigate("/todos");
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!todo) return <div className="p-8 text-center text-muted-foreground">Todo not found</div>;

  return (
    <div className="p-6 lg:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate("/todos")} className="-ml-4">
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to list
        </Button>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => navigate(`/todos/${todo.id}/edit`)}
            aria-label={`Edit ${todo.title}`}
          >
            <Edit2 className="h-4 w-4 mr-2" /> Edit
          </Button>
          <Button
            variant="ghost"
            onClick={() => deleteMutation.mutate(todo.id)}
            className="text-destructive hover:text-destructive"
            aria-label={`Delete ${todo.title}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-2xl">{todo.title}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={todo.status === "done" ? "default" : "secondary"}>
                {todo.status === "done" ? "Completed" : "Open"}
              </Badge>
              <Badge variant="outline" className="capitalize">
                {todo.priority}
              </Badge>
            </div>
          </div>
          <Button
            size="lg"
            variant={todo.status === "done" ? "outline" : "default"}
            disabled={completeMutation.isPending || reopenMutation.isPending}
            aria-label={todo.status === "done" ? `Reopen ${todo.title}` : `Complete ${todo.title}`}
            onClick={() =>
              todo.status === "done" ? reopenMutation.mutate(todo.id) : completeMutation.mutate(todo.id)
            }
          >
            {todo.status === "done" ? (
              <>
                <Circle className="h-4 w-4 mr-2" /> Reopen
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" /> Complete
              </>
            )}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {todo.description && (
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-wrap text-foreground/80">{todo.description}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Due: {todo.dueDate ? todo.dueDate.split("T")[0] : "No due date"}</span>
            </div>
            <div className="text-sm text-muted-foreground text-right italic">
              Created {new Date(todo.createdAt).toLocaleDateString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
