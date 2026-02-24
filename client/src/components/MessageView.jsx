import React, { useEffect, useRef } from "react";
import { Bot, User as UserIcon, FileText, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";

const MessageSkeleton = () => (
  <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6">
    <div className="max-w-3xl mx-auto space-y-6">
      {[...Array(3)].map((_, i) => (
        <div
          key={i}
          className={`flex gap-3 ${
            i % 2 === 0 ? "flex-row" : "flex-row-reverse"
          }`}
        >
          <Skeleton className="h-9 w-9 rounded-xl shrink-0" />
          <div
            className={`flex flex-col gap-2 max-w-[70%] ${
              i % 2 === 0 ? "items-start" : "items-end"
            }`}
          >
            <Skeleton className="h-3 w-20" />
            <Skeleton
              className={`h-20 ${i % 2 === 0 ? "w-64" : "w-48"} rounded-2xl`}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

const MessageView = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (loading) {
    return <MessageSkeleton />;
  }

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 bg-muted/30">
        <div className="text-center max-w-md animate-fade-in">
          <div className="relative inline-block mb-6">
            <div className="h-20 w-20 rounded-2xl bg-slate-800 flex items-center justify-center shadow-xl">
              <Bot className="h-10 w-10 text-white" />
            </div>
            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center border-2 border-background">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold mb-2">Ready to assist</h3>
          <p className="text-muted-foreground leading-relaxed">
            Send a message to start your conversation. I can help you analyze
            documents, answer questions, and more.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-6 lg:px-8 py-6 bg-muted/20">
      <div className="max-w-3xl mx-auto space-y-6">
        {messages.map((msg, index) => (
          <div
            key={msg.id || index}
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
            className={`flex gap-3 animate-fade-in ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <Avatar
              className={`h-9 w-9 rounded-xl shrink-0 ${
                msg.role === "user"
                  ? "bg-primary shadow-lg shadow-primary/25"
                  : "bg-slate-800 shadow-lg"
              }`}
            >
              <AvatarFallback
                className={`rounded-xl ${
                  msg.role === "user" ? "bg-primary" : "bg-slate-800"
                }`}
              >
                {msg.role === "user" ? (
                  <UserIcon className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </AvatarFallback>
            </Avatar>

            {/* Message Content */}
            <div
              className={`flex flex-col gap-1 max-w-[80%] ${
                msg.role === "user" ? "items-end" : "items-start"
              }`}
            >
              {/* Sender Label */}
              <span className="text-xs font-medium text-muted-foreground px-1">
                {msg.role === "user" ? "You" : "AI Assistant"}
              </span>

              {/* Message Bubble */}
              <div
                className={`px-4 py-3 ${
                  msg.role === "user"
                    ? "message-bubble-user"
                    : "message-bubble-assistant"
                }`}
              >
                {msg.loading ? (
                  <div className="flex items-center gap-1.5 py-1">
                    <div className="h-2 w-2 bg-muted-foreground rounded-full typing-dot" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full typing-dot" />
                    <div className="h-2 w-2 bg-muted-foreground rounded-full typing-dot" />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap break-words text-[15px] leading-relaxed">
                    {msg.content}
                  </p>
                )}
              </div>

              {/* Sources Indicator */}
              {msg.sources && (
                <div className="flex items-center gap-1.5 px-2 py-1 bg-muted rounded-lg">
                  <FileText className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Referenced sources
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} className="h-4" />
      </div>
    </div>
  );
};

export default MessageView;
