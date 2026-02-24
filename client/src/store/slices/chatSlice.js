import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { chatsAPI } from "../../utils/api";
import toast from "react-hot-toast";

// Async thunks
export const fetchChats = createAsyncThunk(
  "chat/fetchChats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await chatsAPI.listChats();
      return response.data;
    } catch (error) {
      toast.error("Failed to load chats");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchMessages = createAsyncThunk(
  "chat/fetchMessages",
  async (chatId, { rejectWithValue }) => {
    try {
      const response = await chatsAPI.getMessages(chatId);
      return response.data;
    } catch (error) {
      toast.error("Failed to load messages");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createChat = createAsyncThunk(
  "chat/createChat",
  async ({ name, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      if (name) {
        formData.append("data", JSON.stringify({ name }));
      }
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      }

      const response = await chatsAPI.createChat(formData);
      toast.success("Chat created successfully");
      return response.data.chat;
    } catch (error) {
      toast.error("Failed to create chat");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const sendMessage = createAsyncThunk(
  "chat/sendMessage",
  async ({ chatId, content, files }, { rejectWithValue }) => {
    try {
      // Upload files first if any
      if (files && files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        await chatsAPI.uploadToChat(chatId, formData);
      }

      // Send message
      if (content.trim()) {
        const response = await chatsAPI.sendMessage(chatId, { content });
        return response.data;
      }
      return null;
    } catch (error) {
      toast.error("Failed to send message");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteChat = createAsyncThunk(
  "chat/deleteChat",
  async (chatId, { rejectWithValue }) => {
    try {
      await chatsAPI.deleteChat(chatId);
      toast.success("Chat deleted");
      return chatId;
    } catch (error) {
      toast.error("Failed to delete chat");
      return rejectWithValue(error.response?.data);
    }
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState: {
    chats: [],
    activeChat: null,
    messages: [],
    loading: false,
    messagesLoading: false,
    sendingMessage: false,
    error: null,
  },
  reducers: {
    setActiveChat: (state, action) => {
      state.activeChat = action.payload;
    },
    clearActiveChat: (state) => {
      state.activeChat = null;
      state.messages = [];
    },
    // Optimistic update - add user message immediately
    addOptimisticMessage: (state, action) => {
      state.messages.push({
        id: `temp-${Date.now()}`,
        chat_id: state.activeChat.id,
        content: action.payload.content,
        role: "user",
        created_at: new Date().toISOString(),
      });
      // Add a loading placeholder for AI response
      state.messages.push({
        id: `loading-${Date.now()}`,
        chat_id: state.activeChat.id,
        content: "",
        role: "assistant",
        loading: true,
        created_at: new Date().toISOString(),
      });
    },
    // Remove loading placeholder
    removeLoadingMessage: (state) => {
      state.messages = state.messages.filter((msg) => !msg.loading);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chats
      .addCase(fetchChats.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchChats.fulfilled, (state, action) => {
        state.loading = false;
        state.chats = action.payload;
      })
      .addCase(fetchChats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.messagesLoading = true;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.messagesLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.messagesLoading = false;
        state.error = action.payload;
      })
      // Create chat
      .addCase(createChat.fulfilled, (state, action) => {
        state.chats.unshift(action.payload);
        state.activeChat = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.sendingMessage = true;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.sendingMessage = false;
        if (action.payload) {
          // Remove temporary and loading messages
          state.messages = state.messages.filter(
            (msg) => !msg.id.toString().startsWith("temp-") && !msg.loading
          );
          // Add actual messages from server
          state.messages.push(action.payload.user_message);
          state.messages.push(action.payload.ai_message);

          // Update chat name if server returned a new one (auto-generated after first message)
          if (action.payload.chat_name) {
            // Update active chat name
            if (state.activeChat) {
              state.activeChat.name = action.payload.chat_name;
            }
            // Update in chats list
            const chatIndex = state.chats.findIndex(
              (c) => c.id === state.activeChat?.id
            );
            if (chatIndex !== -1) {
              state.chats[chatIndex].name = action.payload.chat_name;
            }
          }
        }
      })
      .addCase(sendMessage.rejected, (state) => {
        state.sendingMessage = false;
        // Remove temporary and loading messages on error
        state.messages = state.messages.filter(
          (msg) => !msg.id.toString().startsWith("temp-") && !msg.loading
        );
      })
      // Delete chat
      .addCase(deleteChat.fulfilled, (state, action) => {
        state.chats = state.chats.filter((chat) => chat.id !== action.payload);
        if (state.activeChat?.id === action.payload) {
          state.activeChat = null;
          state.messages = [];
        }
      });
  },
});

export const {
  setActiveChat,
  clearActiveChat,
  addOptimisticMessage,
  removeLoadingMessage,
} = chatSlice.actions;
export default chatSlice.reducer;
