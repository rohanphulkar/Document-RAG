import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchChats, deleteChat } from "../store/slices/chatSlice";
import { MessageSquare, Trash2, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { Skeleton } from "./ui/skeleton";

const ChatListSkeleton = () => (
  <div className="p-2 space-y-2">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    ))}
  </div>
);

const ChatList = ({ activeChat, onChatSelect, onChatDeleted }) => {
  const dispatch = useDispatch();
  const { chats, loading } = useSelector((state) => state.chat);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleDelete = async (chatId, e) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat?")) return;

    await dispatch(deleteChat(chatId));
    if (activeChat?.id === chatId) {
      onChatDeleted();
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }
  };

  if (loading) {
    return <ChatListSkeleton />;
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
          <MessageSquare className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-semibold mb-2">No conversations</h3>
        <p className="text-sm text-muted-foreground max-w-[200px]">
          Start a new chat to begin exploring your documents with AI
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2">
      {chats.map((chat, index) => (
        <div
          key={chat.id}
          onClick={() => onChatSelect(chat)}
          style={{ animationDelay: `${index * 50}ms` }}
          className={`group flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all duration-200 animate-fade-in ${
            activeChat?.id === chat.id
              ? "bg-primary/10 border-l-4 border-primary shadow-sm"
              : "hover:bg-muted border-l-4 border-transparent"
          }`}
        >
          <div
            className={`h-10 w-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
              activeChat?.id === chat.id
                ? "bg-primary shadow-lg shadow-primary/25"
                : "bg-muted group-hover:bg-muted-foreground/10"
            }`}
          >
            <MessageSquare
              className={`h-5 w-5 ${
                activeChat?.id === chat.id
                  ? "text-primary-foreground"
                  : "text-muted-foreground"
              }`}
            />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={`font-medium truncate text-sm ${
                  activeChat?.id === chat.id
                    ? "text-foreground"
                    : "text-foreground/80"
                }`}
              >
                {chat.name}
              </h3>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {formatDate(chat.created_at)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <p className="text-xs text-muted-foreground truncate">
                Created {new Date(chat.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all flex-shrink-0"
            onClick={(e) => handleDelete(chat.id, e)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};

export default ChatList;
