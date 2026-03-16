import React from "react";
import { Button } from "@corely/ui";
import { Link } from "react-router-dom";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-[2rem] border border-border/70 bg-background/85 p-10 text-center shadow-sm">
        <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">404</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">This page does not exist</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The todo frontend is intentionally small, so most paths route back to the task list.
        </p>
        <Button asChild className="mt-6">
          <Link to="/todos">Go to tasks</Link>
        </Button>
      </div>
    </div>
  );
};
