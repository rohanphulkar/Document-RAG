import React, { useState, useRef, useEffect } from "react";
import { Send, Paperclip, X, FileText } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Kbd } from "./ui/kbd";

const MessageInput = ({ onSend, disabled }) => {
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState([]);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 150) + "px";
    }
  }, [message]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() && files.length === 0) return;

    await onSend(message, files);
    setMessage("");
    setFiles([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const canSend = message.trim() || files.length > 0;

  return (
    <div className="border-t bg-card/80 backdrop-blur-lg p-4">
      <div className="max-w-3xl mx-auto">
        {/* Attached Files */}
        {files.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3 animate-fade-in">
            {files.map((file, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="gap-2 pl-2 pr-1 py-1.5 bg-primary/10 text-primary hover:bg-primary/15"
              >
                <FileText className="h-3.5 w-3.5 text-destructive" />
                <span className="max-w-[150px] truncate text-xs font-medium">
                  {file.name}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 hover:bg-primary/20 rounded-full"
                  onClick={() => removeFile(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        {/* Input Container */}
        <form onSubmit={handleSubmit} className="relative">
          <div
            className={`flex items-end gap-2 p-2 bg-muted/50 rounded-2xl border-2 transition-all duration-200 ${
              isFocused
                ? "border-primary bg-background shadow-lg shadow-primary/10"
                : "border-transparent"
            }`}
          >
            {/* Attach Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf"
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
              className="flex-shrink-0 h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary"
              disabled={disabled}
              title="Attach PDF files"
            >
              <Paperclip className="h-5 w-5" />
            </Button>

            {/* Textarea */}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Type your message..."
                className="w-full bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground text-[15px] leading-relaxed py-2 px-1 max-h-[150px]"
                rows={1}
                disabled={disabled}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />
            </div>

            {/* Send Button */}
            <Button
              type="submit"
              size="icon"
              className={`flex-shrink-0 h-10 w-10 rounded-xl transition-all duration-200 ${
                canSend && !disabled
                  ? "bg-primary shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
              disabled={disabled || !canSend}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>

          {/* Helper Text */}
          <p className="text-center text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
            Press <Kbd>Enter</Kbd> to send • <Kbd>Shift + Enter</Kbd> for new
            line
          </p>
        </form>
      </div>
    </div>
  );
};

export default MessageInput;
