import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { collectionsAPI } from "../../utils/api";
import toast from "react-hot-toast";

// Async thunks
export const fetchCollections = createAsyncThunk(
  "collections/fetchCollections",
  async (_, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.listCollections();
      return response.data;
    } catch (error) {
      toast.error("Failed to load collections");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const createCollection = createAsyncThunk(
  "collections/createCollection",
  async (name, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.createCollection({ name });
      toast.success("Collection created");
      return response.data;
    } catch (error) {
      toast.error("Failed to create collection");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteCollection = createAsyncThunk(
  "collections/deleteCollection",
  async (id, { rejectWithValue }) => {
    try {
      await collectionsAPI.deleteCollection(id);
      toast.success("Collection deleted");
      return id;
    } catch (error) {
      toast.error("Failed to delete collection");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const fetchDocuments = createAsyncThunk(
  "collections/fetchDocuments",
  async (collectionId, { rejectWithValue }) => {
    try {
      const response = await collectionsAPI.listDocuments(collectionId);
      return response.data;
    } catch (error) {
      toast.error("Failed to load documents");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const uploadDocuments = createAsyncThunk(
  "collections/uploadDocuments",
  async ({ collectionId, files }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      files.forEach((file) => formData.append("files", file));

      const response = await collectionsAPI.uploadDocuments(
        collectionId,
        formData
      );
      toast.success(`${files.length} file(s) uploaded`);
      return response.data.documents;
    } catch (error) {
      toast.error("Failed to upload documents");
      return rejectWithValue(error.response?.data);
    }
  }
);

export const deleteDocument = createAsyncThunk(
  "collections/deleteDocument",
  async (docId, { rejectWithValue }) => {
    try {
      await collectionsAPI.deleteDocument(docId);
      toast.success("Document deleted");
      return docId;
    } catch (error) {
      toast.error("Failed to delete document");
      return rejectWithValue(error.response?.data);
    }
  }
);

const collectionsSlice = createSlice({
  name: "collections",
  initialState: {
    collections: [],
    documents: [],
    loading: false,
    documentsLoading: false,
    uploadProgress: 0,
    error: null,
  },
  reducers: {
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch collections
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.collections = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Create collection
      .addCase(createCollection.fulfilled, (state, action) => {
        state.collections.push(action.payload);
      })
      // Delete collection
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.collections = state.collections.filter(
          (c) => c.id !== action.payload
        );
      })
      // Fetch documents
      .addCase(fetchDocuments.pending, (state) => {
        state.documentsLoading = true;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.documentsLoading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.documentsLoading = false;
        state.error = action.payload;
      })
      // Upload documents
      .addCase(uploadDocuments.pending, (state) => {
        state.uploadProgress = 0;
      })
      .addCase(uploadDocuments.fulfilled, (state, action) => {
        state.uploadProgress = 100;
        state.documents.push(...action.payload);
      })
      .addCase(uploadDocuments.rejected, (state) => {
        state.uploadProgress = 0;
      })
      // Delete document
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter(
          (d) => d.id !== action.payload
        );
      });
  },
});

export const { setUploadProgress } = collectionsSlice.actions;
export default collectionsSlice.reducer;
