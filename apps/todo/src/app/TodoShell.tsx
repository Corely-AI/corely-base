import { Badge, Button, Separator } from "@corely/ui";
import { CheckSquare, LogOut, Plus, Sparkles } from "lucide-react";
import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-provider";

const appTitle = import.meta.env.VITE_APP_TITLE || "Corely Todo";
const appTagline =
  import.meta.env.VITE_APP_TAGLINE || "Focused task tracking for your workspace";

const navItems = [{ to: "/todos", label: "Tasks", caption: "Inbox, focus, done" }];

export const TodoShell: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const primaryMembership = user?.memberships[0];
  const workspaceLabel =
    primaryMembership?.workspaceName || primaryMembership?.tenantName || "Active workspace";

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid min-h-screen max-w-7xl lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-border/70 bg-background/70 px-6 py-8 backdrop-blur lg:flex lg:flex-col">
          <div className="space-y-4">
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold tracking-tight">{appTitle}</h1>
                <Badge variant="secondary" className="rounded-full">
                  beta
                </Badge>
              </div>
              <p className="text-sm leading-6 text-muted-foreground">{appTagline}</p>
            </div>
          </div>

          <Separator className="my-6" />

          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    "block rounded-2xl border px-4 py-3 transition",
                    isActive
                      ? "border-primary/30 bg-primary/10 shadow-sm"
                      : "border-transparent bg-background/50 hover:border-border hover:bg-accent/40",
                  ].join(" ")
                }
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="font-medium">{item.label}</span>
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{item.caption}</p>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-4 rounded-3xl border border-border/70 bg-background/80 p-4 shadow-sm">
            <div>
              <p className="text-sm font-medium">{user?.name || user?.email || "Signed in"}</p>
              <p className="text-xs text-muted-foreground">{workspaceLabel}</p>
            </div>
            <Button className="w-full justify-start" onClick={() => navigate("/todos/new")}>
              <Plus className="mr-2 h-4 w-4" />
              New task
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => void logout()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="min-w-0">
          <header className="sticky top-0 z-20 border-b border-border/60 bg-background/75 px-4 py-4 backdrop-blur lg:px-8">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                  Task workspace
                </p>
                <h1 className="truncate text-lg font-semibold">{workspaceLabel}</h1>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" className="lg:hidden" onClick={() => navigate("/todos")}>
                  Tasks
                </Button>
                <Button onClick={() => navigate("/todos/new")}>
                  <Plus className="mr-2 h-4 w-4" />
                  New task
                </Button>
              </div>
            </div>
          </header>

          <main className="min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
