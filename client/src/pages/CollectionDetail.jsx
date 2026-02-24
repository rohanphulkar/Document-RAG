import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDocuments,
  uploadDocuments,
  deleteDocument,
} from "../store/slices/collectionsSlice";
import { collectionsAPI } from "../utils/api";
import Navbar from "../components/Navbar";
import {
  ArrowLeft,
  Upload,
  FileText,
  Trash2,
  FolderOpen,
  CloudUpload,
  File,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import { Skeleton } from "../components/ui/skeleton";
import { Progress } from "../components/ui/progress";
import toast from "react-hot-toast";

const TableSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <div key={i} className="flex items-center gap-4 py-4">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
    ))}
  </div>
);

const CollectionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { documents, documentsLoading, uploadProgress } = useSelector(
    (state) => state.collections
  );
  const [collection, setCollection] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    loadCollection();
    dispatch(fetchDocuments(id));
  }, [id, dispatch]);

  const loadCollection = async () => {
    try {
      const response = await collectionsAPI.getCollection(id);
      setCollection(response.data);
    } catch (error) {
      toast.error("Collection not found");
      navigate("/collections");
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      toast.error("Please select files to upload");
      return;
    }

    setUploading(true);
    await dispatch(uploadDocuments({ collectionId: id, files: selectedFiles }));
    setUploading(false);
    setSelectedFiles([]);
  };

  const handleDelete = async (docId) => {
    if (!confirm("Are you sure you want to delete this document?")) return;
    await dispatch(deleteDocument(docId));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((file) =>
      file.name.endsWith(".pdf")
    );
    if (files.length > 0) {
      setSelectedFiles([...selectedFiles, ...files]);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return "—";
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    return `${(kb / 1024).toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/collections")}
            className="gap-2 mb-4 -ml-2 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Back to Collections
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25">
              <FolderOpen className="h-7 w-7 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                {collection?.name}
              </h1>
              <p className="text-muted-foreground">
                {documents.length} document{documents.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CloudUpload className="h-5 w-5 text-primary" />
              Upload Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Drop Zone */}
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50 bg-muted/30"
              }`}
            >
              <input
                type="file"
                accept=".pdf"
                multiple
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) =>
                  setSelectedFiles([
                    ...selectedFiles,
                    ...Array.from(e.target.files),
                  ])
                }
              />
              <Upload
                className={`h-10 w-10 mx-auto mb-3 ${
                  dragActive ? "text-primary" : "text-muted-foreground"
                }`}
              />
              <p className="font-medium">
                Drop PDF files here or click to browse
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Supports multiple PDF files
              </p>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="mt-4 space-y-2 animate-fade-in">
                {selectedFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 px-4 py-3 bg-muted rounded-xl"
                  >
                    <File className="h-5 w-5 text-destructive" />
                    <span className="flex-1 text-sm font-medium truncate">
                      {file.name}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                      onClick={() =>
                        setSelectedFiles((files) =>
                          files.filter((_, i) => i !== index)
                        )
                      }
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {uploading && uploadProgress > 0 && (
                  <div className="pt-2">
                    <Progress value={uploadProgress} className="h-2" />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      Uploading... {uploadProgress}%
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleUpload}
                  className="w-full gap-2 mt-4"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-5 w-5" />
                      Upload {selectedFiles.length} file
                      {selectedFiles.length !== 1 ? "s" : ""}
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Documents List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              Documents
            </CardTitle>
          </CardHeader>
          <CardContent>
            {documentsLoading ? (
              <TableSkeleton />
            ) : documents.length === 0 ? (
              <div className="text-center py-12">
                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">No documents yet</h3>
                <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                  Upload PDF files to this collection to get started
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {documents.map((doc, index) => (
                      <TableRow
                        key={doc.id}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="animate-fade-in group"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-destructive" />
                            </div>
                            <span className="font-medium">{doc.filename}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {doc.file_size || "—"}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(doc.created_at).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => handleDelete(doc.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CollectionDetail;
