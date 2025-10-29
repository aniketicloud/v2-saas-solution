"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTodoList, updateTodoList } from "@/lib/actions/todolist";
import { toast } from "sonner";

interface CreateTodoListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizationId: string;
  onSuccess?: () => void;
  editData?: {
    id: string;
    title: string;
    description?: string | null;
  };
}

export function CreateTodoListDialog({
  open,
  onOpenChange,
  organizationId,
  onSuccess,
  editData,
}: CreateTodoListDialogProps) {
  const [title, setTitle] = useState(editData?.title || "");
  const [description, setDescription] = useState(editData?.description || "");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = editData
      ? await updateTodoList({
          todoListId: editData.id,
          organizationId,
          title,
          description,
        })
      : await createTodoList({
          organizationId,
          title,
          description,
        });

    setLoading(false);

    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success(
        editData ? "Todo list updated successfully" : "Todo list created successfully"
      );
      setTitle("");
      setDescription("");
      onOpenChange(false);
      onSuccess?.();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editData ? "Edit Todo List" : "Create New Todo List"}
          </DialogTitle>
          <DialogDescription>
            {editData
              ? "Update your todo list details"
              : "Create a new todo list for your organization"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Product Development Tasks"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add a description..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading
                ? "Saving..."
                : editData
                ? "Update"
                : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
