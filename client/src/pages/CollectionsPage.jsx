import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchCollections,
  createCollection,
  deleteCollection,
} from "../store/slices/collectionsSlice";
import Navbar from "../components/Navbar";
import {
  FolderOpen,
  Plus,
  Trash2,
  FileText,
  ArrowRight,
  Sparkles,
  Loader2,
} from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { Skeleton } from "../components/ui/skeleton";

const CardSkeleton = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader className="pb-3">
      <div className="flex items-start gap-4">
        <Skeleton className="h-14 w-14 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

const CollectionsPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { collections, loading } = useSelector((state) => state.collections);
  const [showModal, setShowModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    dispatch(fetchCollections());
  }, [dispatch]);

  const handleCreate = async () => {
    if (!newCollectionName.trim()) {
      return;
    }

    setCreating(true);
    await dispatch(createCollection(newCollectionName));
    setCreating(false);
    setShowModal(false);
    setNewCollectionName("");
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (
      !confirm(
        "Are you sure? This will delete all documents in this collection."
      )
    ) {
      return;
    }

    await dispatch(deleteCollection(id));
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Collections</h1>
            <p className="text-muted-foreground mt-1">
              Organize and manage your document collections
            </p>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="gap-2 shadow-lg shadow-primary/25"
          >
            <Plus className="h-5 w-5" />
            New Collection
          </Button>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <div className="relative inline-block mb-6">
              <div className="h-24 w-24 rounded-3xl bg-primary/20 flex items-center justify-center">
                <FolderOpen className="h-12 w-12 text-primary" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
            </div>
            <h3 className="text-xl font-semibold mb-2">No collections yet</h3>
            <p className="text-muted-foreground max-w-sm mx-auto mb-8">
              Create your first collection to organize documents and chat with
              AI about their contents
            </p>
            <Button
              onClick={() => setShowModal(true)}
              className="gap-2 shadow-lg shadow-primary/25"
              size="lg"
            >
              <Plus className="h-5 w-5" />
              Create Collection
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {collections.map((collection, index) => (
              <Card
                key={collection.id}
                onClick={() => navigate(`/collections/${collection.id}`)}
                style={{ animationDelay: `${index * 50}ms` }}
                className="group border-0 shadow-lg cursor-pointer hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 animate-fade-in"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/25 group-hover:shadow-primary/40 transition-shadow">
                        <FolderOpen className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <div>
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {collection.name}
                        </CardTitle>
                        <CardDescription>
                          {new Date(collection.created_at).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDelete(collection.id, e)}
                      className="opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>View documents</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Collection Dialog */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <FolderOpen className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <DialogTitle>New Collection</DialogTitle>
                <DialogDescription>
                  Create a folder for your documents
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="collectionName">Collection Name</Label>
            <Input
              id="collectionName"
              placeholder="e.g., Research Papers"
              className="mt-2"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowModal(false);
                setNewCollectionName("");
              }}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !newCollectionName.trim()}
              className="gap-2"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CollectionsPage;
