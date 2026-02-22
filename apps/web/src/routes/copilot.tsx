import React, { useEffect, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { Button, Badge, Card, CardContent, CardHeader, CardTitle } from "@corely/ui";
import { CheckCircle2, Circle, ListTodo, Search, Trash2, Edit, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import {
  fetchCopilotHistory,
  useCopilotChatOptions,
  type CopilotChatMessage,
} from "@/lib/copilot-api";

type MessagePart = {
  type: string;
  text?: string;
  toolCallId?: string;
  toolName?: string;
  input?: unknown;
  output?: unknown;
  result?: unknown;
  state?: string;
  approval?: { id: string; approved?: boolean; reason?: string };
  errorText?: string;
};

const ConfirmCard: React.FC<{
  toolCallId: string;
  toolName: string;
  input?: any;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ toolCallId, toolName, input, onConfirm, onCancel }) => {
  const { t } = useTranslation();

  const isTodoTool = toolName.startsWith("todo.");

  return (
    <Card className="my-2 border-primary/20 bg-primary/5 shadow-sm overflow-hidden">
      <CardHeader className="py-3 px-4 bg-primary/10 border-b border-primary/10">
        <CardTitle className="text-sm flex items-center gap-2">
          {isTodoTool ? <ListTodo className="h-4 w-4" /> : null}
          {t("copilot.confirmation.title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-4 space-y-3">
        <div className="text-xs text-muted-foreground">
          {isTodoTool
            ? `Proposed action: ${toolName.replace("todo.", "")} task`
            : t("copilot.confirmation.subtitle", { toolName, toolCallId })}
        </div>

        {isTodoTool && input && (
          <div className="p-2 border rounded bg-white/50 text-sm space-y-1">
            {input.title && (
              <div className="font-semibold">
                {toolName === "todo.delete" ? "Delete: " : ""}
                {input.title}
              </div>
            )}
            {input.description && <div className="text-xs italic">{input.description}</div>}
            {input.priority && <Badge variant="outline" className="text-[10px] uppercase">{input.priority}</Badge>}
            {input.dueDate && <div className="text-[10px] text-muted-foreground">Due: {input.dueDate.split("T")[0]}</div>}
            {input.id && <div className="text-[9px] text-muted-foreground font-mono">ID: {input.id}</div>}
          </div>
        )}

        <div className="flex gap-2">
          <Button size="sm" onClick={onConfirm} data-testid={`confirm-${toolCallId}`}>
            {t("common.confirm")}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onCancel}
            data-testid={`cancel-${toolCallId}`}
          >
            {t("common.cancel")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const TodoResultCard: React.FC<{ toolName: string; result: any }> = ({ toolName, result }) => {
  if (toolName === "todo.search" || toolName === "todo.list") {
    const todos = result?.items || result || [];
    if (!Array.isArray(todos)) return null;

    return (
      <div className="space-y-2 mt-2">
        <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1">
          <Search className="h-3 w-3" /> Search Results
        </div>
        {todos.slice(0, 5).map((todo: any) => (
          <div key={todo.id} className="flex items-center justify-between p-2 border rounded bg-slate-50 shadow-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium line-clamp-1">{todo.title}</span>
              {todo.priority && <Badge variant="outline" className="w-fit text-[9px] h-4 py-0 uppercase">{todo.priority}</Badge>}
            </div>
            {todo.status === "done" ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-slate-300" />}
          </div>
        ))}
        {todos.length > 5 && <div className="text-[10px] text-center text-muted-foreground">+{todos.length - 5} more items</div>}
      </div>
    );
  }

  if (toolName === "todo.create" || toolName === "todo.update" || toolName === "todo.complete" || toolName === "todo.reopen") {
    const todo = result;
    if (!todo || !todo.id) return null;
    return (
      <div className="flex items-center gap-3 p-3 my-2 border rounded-lg bg-green-50/30 border-green-100 shadow-sm">
        <div className="bg-green-100 p-2 rounded-full">
          {toolName === "todo.create" ? <Plus className="h-4 w-4 text-green-700" /> : <Edit className="h-4 w-4 text-green-700" />}
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold text-green-900">{todo.title}</div>
          <div className="text-[10px] text-green-700 capitalize">{todo.status} • {todo.priority}</div>
        </div>
      </div>
    );
  }

  if (toolName === "todo.delete") {
     return (
        <div className="flex items-center gap-2 p-2 my-2 border rounded bg-red-50/50 border-red-100 text-xs text-red-700">
           <Trash2 className="h-4 w-4" /> Deleted successfully
        </div>
     );
  }

  return null;
};

const MessageBubble: React.FC<{
  role: string;
  children: React.ReactNode;
}> = ({ role, children }) => {
  const { t } = useTranslation();
  const roleLabel = role === "user" ? t("copilot.roles.user") : t("copilot.roles.assistant");

  return (
    <div
      className={`max-w-3xl w-full p-3 rounded-lg ${
        role === "user" ? "bg-blue-50 text-gray-900 ml-auto" : "bg-gray-50 text-gray-900"
      } border border-gray-200 shadow-sm`}
    >
      <div className="text-[11px] uppercase tracking-wide text-gray-500 mb-1">{roleLabel}</div>
      <div className="space-y-1 text-sm leading-relaxed">{children}</div>
    </div>
  );
};

export const CopilotPage: React.FC = () => {
  const { t, i18n } = useTranslation();
  const {
    options: chatOptions,
    runId,
    apiBase,
    workspaceId,
    accessToken,
  } = useCopilotChatOptions({
    activeModule: "freelancer",
    locale: i18n.language,
  });

  const { messages, sendMessage, addToolResult, addToolApprovalResponse, setMessages } =
    useChat<CopilotChatMessage>(chatOptions);
  const [hydratedRunId, setHydratedRunId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };
  const handleSubmit = (event?: { preventDefault?: () => void }) => {
    event?.preventDefault?.();
    const trimmed = input.trim();
    if (!trimmed) {
      return;
    }
    void sendMessage({ text: trimmed });
    setInput("");
  };

  useEffect(() => {
    let cancelled = false;
    void fetchCopilotHistory({ runId, apiBase, workspaceId, accessToken })
      .then((history) => {
        if (!cancelled && (!hydratedRunId || hydratedRunId !== runId)) {
          setMessages(history);
          setHydratedRunId(runId);
        }
      })
      .catch((error) => {
        console.error("Failed to fetch copilot history:", error);
      });
    return () => {
      cancelled = true;
    };
  }, [accessToken, apiBase, hydratedRunId, runId, setMessages, workspaceId]);

  const renderPart = (part: MessagePart, messageId: string) => {
    if (part.type === "text") {
      return <p className="whitespace-pre-wrap">{part.text}</p>;
    }
    if (part.type === "reasoning") {
      return <p className="text-xs text-muted-foreground">{part.text}</p>;
    }
    if (
      part.type === "tool-call" ||
      part.type === "dynamic-tool" ||
      part.type.startsWith("tool-")
    ) {
      const toolCallId = part.toolCallId || messageId;
      const toolName = part.toolName || part.type.replace("tool-", "");
      if (toolName === "invoice.issue" || toolName === "expense.confirmCreate") {
        return (
          <ConfirmCard
            key={toolCallId}
            toolCallId={toolCallId}
            toolName={toolName}
            onConfirm={() =>
              addToolResult?.({
                toolCallId,
                result: { confirmed: true },
                toolName,
              } as any)
            }
            onCancel={() =>
              addToolResult?.({
                toolCallId,
                result: { confirmed: false },
                toolName,
              } as any)
            }
          />
        );
      }
      if (part.state === "approval-requested" && part.approval?.id) {
        return (
          <ConfirmCard
            key={toolCallId}
            toolCallId={toolCallId}
            toolName={toolName}
            input={part.input}
            onConfirm={() =>
              addToolApprovalResponse?.({ id: part.approval?.id ?? toolCallId, approved: true })
            }
            onCancel={() =>
              addToolApprovalResponse?.({ id: part.approval?.id ?? toolCallId, approved: false })
            }
          />
        );
      }
      if (part.state === "output-available") {
        const isTodoTool = toolName.startsWith("todo.");
        return (
          <div className="space-y-1">
            <div className="text-[10px] text-muted-foreground uppercase">
              {t("copilot.toolResult", {
                toolName,
                result: "",
              }).split(":")[0]}
            </div>
            {isTodoTool && <TodoResultCard toolName={toolName} result={part.output ?? part.result} />}
            {!isTodoTool && (
               <div className="text-xs text-green-700 bg-green-50 p-2 rounded border border-green-100 italic">
                  {JSON.stringify(part.output ?? part.result ?? part.input)}
               </div>
            )}
          </div>
        );
      }
      if (part.state === "output-error" || part.state === "output-denied") {
        return (
          <div className="text-xs text-destructive">
            {t("copilot.toolFailed", {
              toolName,
              reason: part.errorText ?? t("copilot.denied"),
            })}
          </div>
        );
      }
      return (
        <div className="text-xs text-gray-600">
          {t("copilot.toolCall", { toolName, toolCallId })}
        </div>
      );
    }
    if (part.type.startsWith("data-")) {
      return null;
    }
    return null;
  };

  const formatMessageContent = (value: unknown) => {
    if (value == null) {
      return "";
    }
    if (typeof value === "string") {
      return value;
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-semibold">{t("copilot.title")}</h1>

      <div className="border rounded p-3 h-[60vh] overflow-y-auto bg-white shadow-sm">
        {messages.map((m) => (
          <div key={m.id} className="mb-3 flex flex-col gap-1">
            <MessageBubble role={m.role}>
              {(m.parts as MessagePart[] | undefined)?.length
                ? (m.parts as MessagePart[]).map((p, idx) => (
                    <div key={idx}>{renderPart(p, m.id)}</div>
                  ))
                : m.content != null && (
                    <p className="whitespace-pre-wrap">{formatMessageContent(m.content)}</p>
                  )}
            </MessageBubble>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          value={input}
          onChange={handleInputChange}
          placeholder={t("copilot.placeholder")}
        />
        <Button type="submit">{t("common.send")}</Button>
      </form>
    </div>
  );
};

export default CopilotPage;
