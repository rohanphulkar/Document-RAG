import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchChats,
  fetchMessages,
  createChat,
  sendMessage,
  setActiveChat,
  addOptimisticMessage,
} from "../store/slices/chatSlice";
import Navbar from "../components/Navbar";
import ChatList from "../components/ChatList";
import MessageView from "../components/MessageView";
import MessageInput from "../components/MessageInput";
import {
  Plus,
  Menu,
  MessageSquare,
  Upload,
  FileText,
  X,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../components/ui/sheet";
import { Badge } from "../components/ui/badge";

const ChatPage = () => {
  const dispatch = useDispatch();
  const { chats, activeChat, messages, messagesLoading } = useSelector(
    (state) => state.chat
  );
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatFiles, setNewChatFiles] = useState([]);
  const [creating, setCreating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages(activeChat.id));
    }
  }, [activeChat, dispatch]);

  const handleCreateChat = async () => {
    setCreating(true);
    await dispatch(createChat({ name: "New Chat", files: newChatFiles }));
    setCreating(false);
    setShowNewChatModal(false);
    setNewChatFiles([]);
  };

  const handleSendMessage = async (content, files) => {
    if (!activeChat) return;

    if (content.trim()) {
      dispatch(addOptimisticMessage({ content }));
    }

    await dispatch(sendMessage({ chatId: activeChat.id, content, files }));
  };

  return (
    <div className="h-screen flex flex-col bg-background">
      <Navbar />

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col h-full w-80 bg-card border-r">
          {/* Sidebar Header */}
          <div className="p-4 border-b">
            <h2 className="font-semibold text-lg mb-4">Conversations</h2>
            <Button
              onClick={() => setShowNewChatModal(true)}
              className="w-full gap-2"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          {/* Chat List */}
          <ChatList
            activeChat={activeChat}
            onChatSelect={(chat) => dispatch(setActiveChat(chat))}
            onChatCreated={() => dispatch(fetchChats())}
            onChatDeleted={() => dispatch(setActiveChat(null))}
          />
        </aside>

        {/* Mobile Sidebar Sheet */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Conversations</SheetTitle>
            </SheetHeader>
            <div className="p-4">
              <Button
                onClick={() => {
                  setShowNewChatModal(true);
                  setSidebarOpen(false);
                }}
                className="w-full gap-2"
              >
                <Plus className="h-4 w-4" />
                New Chat
              </Button>
            </div>
            <ChatList
              activeChat={activeChat}
              onChatSelect={(chat) => {
                dispatch(setActiveChat(chat));
                setSidebarOpen(false);
              }}
              onChatCreated={() => dispatch(fetchChats())}
              onChatDeleted={() => dispatch(setActiveChat(null))}
            />
          </SheetContent>
        </Sheet>

        {/* Main Chat Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-muted/30">
          {/* Chat Header */}
          {activeChat && (
            <header className="bg-card border-b px-4 py-3 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
                  <MessageSquare className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="min-w-0">
                  <h1 className="font-semibold truncate">{activeChat.name}</h1>
                  <p className="text-sm text-muted-foreground">AI Assistant</p>
                </div>
              </div>
            </header>
          )}

          {/* Messages or Empty State */}
          {activeChat ? (
            <>
              <MessageView messages={messages} loading={messagesLoading} />
              <MessageInput onSend={handleSendMessage} />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md animate-fade-in">
                <div className="relative inline-block mb-6">
                  <div className="h-20 w-20 rounded-2xl bg-primary/20 flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 text-primary" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold mb-3">
                  Welcome to ContextBase
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Start a conversation with AI about your documents. Upload PDFs
                  and get intelligent answers powered by context-aware AI.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={() => setShowNewChatModal(true)}
                    className="gap-2"
                    size="lg"
                  >
                    <Plus className="h-5 w-5" />
                    Start New Chat
                  </Button>
                  <Button
                    onClick={() => setSidebarOpen(true)}
                    variant="outline"
                    size="lg"
                    className="lg:hidden gap-2"
                  >
                    <Menu className="h-5 w-5" />
                    View Chats
                  </Button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* New Chat Dialog */}
      <Dialog open={showNewChatModal} onOpenChange={setShowNewChatModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <Plus className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle>Create New Chat</DialogTitle>
                <DialogDescription>
                  Start a conversation about your documents
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>
                Upload Documents <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <input
                  type="file"
                  accept=".pdf"
                  multiple
                  className="hidden"
                  id="chat-file-upload"
                  onChange={(e) => setNewChatFiles(Array.from(e.target.files))}
                />
                <label
                  htmlFor="chat-file-upload"
                  className="flex items-center justify-center gap-3 p-6 border-2 border-dashed rounded-xl cursor-pointer hover:border-primary hover:bg-primary/5 transition-all"
                >
                  <Upload className="h-6 w-6 text-muted-foreground" />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload PDFs</p>
                    <p className="text-xs text-muted-foreground">
                      or drag and drop
                    </p>
                  </div>
                </label>
              </div>
              {newChatFiles.length > 0 && (
                <div className="space-y-2 mt-3">
                  {newChatFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg"
                    >
                      <FileText className="h-4 w-4 text-destructive" />
                      <span className="text-sm truncate flex-1">
                        {file.name}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() =>
                          setNewChatFiles((files) =>
                            files.filter((_, i) => i !== index)
                          )
                        }
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowNewChatModal(false);
                setNewChatFiles([]);
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateChat}
              disabled={creating || newChatFiles.length === 0}
              className="gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Chat"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChatPage;
