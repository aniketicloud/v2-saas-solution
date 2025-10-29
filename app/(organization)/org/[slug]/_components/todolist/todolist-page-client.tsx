"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TodoListCard } from "./todo-list-card";
import { CreateTodoListDialog } from "./create-todolist-dialog";
import { CreateTodoItemDialog } from "./create-todoitem-dialog";
import {
  listTodoLists,
  deleteTodoList,
  deleteTodoItem,
  updateTodoItem,
} from "@/lib/actions/todolist";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface TodoListPageClientProps {
  organizationId: string;
  organizationSlug: string;
  permissions: {
    canView: boolean;
    canCreate: boolean;
    canUpdate: boolean;
    canDelete: boolean;
  };
}

export default function TodoListPageClient({
  organizationId,
  organizationSlug,
  permissions,
}: TodoListPageClientProps) {
  const [todoLists, setTodoLists] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createItemDialogOpen, setCreateItemDialogOpen] = useState(false);
  const [editDialogData, setEditDialogData] = useState<any>(null);
  const [editItemData, setEditItemData] = useState<any>(null);
  const [selectedListId, setSelectedListId] = useState<string>("");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: "list" | "item";
    id: string;
  } | null>(null);

  const loadTodoLists = async () => {
    setLoading(true);
    const result = await listTodoLists(organizationId);
    if ("error" in result) {
      toast.error(result.error);
      setTodoLists([]);
    } else if ("data" in result) {
      setTodoLists(result.data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (permissions.canView) {
      loadTodoLists();
    }
  }, [organizationId, permissions.canView]);

  const handleDeleteList = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "list") return;

    const result = await deleteTodoList(deleteConfirm.id, organizationId);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Todo list deleted successfully");
      loadTodoLists();
    }
    setDeleteConfirm(null);
  };

  const handleDeleteItem = async () => {
    if (!deleteConfirm || deleteConfirm.type !== "item") return;

    const result = await deleteTodoItem(deleteConfirm.id, organizationId);
    if ("error" in result) {
      toast.error(result.error);
    } else {
      toast.success("Todo item deleted successfully");
      loadTodoLists();
    }
    setDeleteConfirm(null);
  };

  const handleToggleItem = async (itemId: string, completed: boolean) => {
    const result = await updateTodoItem({
      itemId,
      organizationId,
      completed,
    });

    if ("error" in result) {
      toast.error(result.error);
    } else {
      loadTodoLists();
    }
  };

  const handleAddItem = (listId: string) => {
    setSelectedListId(listId);
    setEditItemData(null);
    setCreateItemDialogOpen(true);
  };

  const handleEditItem = (item: any) => {
    setEditItemData(item);
    setSelectedListId(item.todoListId);
    setCreateItemDialogOpen(true);
  };

  if (!permissions.canView) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-muted-foreground">
          You don't have permission to view todo lists
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Todo Lists</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization's tasks and projects
          </p>
        </div>
        {permissions.canCreate && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Todo List
          </Button>
        )}
      </div>

      {todoLists.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-lg">
          <p className="text-muted-foreground mb-4">No todo lists yet</p>
          {permissions.canCreate && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Todo List
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {todoLists.map((list) => (
            <TodoListCard
              key={list.id}
              todoList={list}
              onEdit={
                permissions.canUpdate
                  ? (id) => {
                      const list = todoLists.find((l) => l.id === id);
                      setEditDialogData(list);
                      setCreateDialogOpen(true);
                    }
                  : undefined
              }
              onDelete={
                permissions.canDelete
                  ? (id) => setDeleteConfirm({ type: "list", id })
                  : undefined
              }
              onAddItem={permissions.canCreate ? handleAddItem : undefined}
              onToggleItem={
                permissions.canUpdate ? handleToggleItem : undefined
              }
              onEditItem={
                permissions.canUpdate
                  ? (itemId) => {
                      const item = list.items.find((i: any) => i.id === itemId);
                      handleEditItem({ ...item, todoListId: list.id });
                    }
                  : undefined
              }
              onDeleteItem={
                permissions.canDelete
                  ? (itemId) => setDeleteConfirm({ type: "item", id: itemId })
                  : undefined
              }
              canEdit={permissions.canUpdate}
              canDelete={permissions.canDelete}
            />
          ))}
        </div>
      )}

      <CreateTodoListDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditDialogData(null);
        }}
        organizationId={organizationId}
        onSuccess={loadTodoLists}
        editData={editDialogData}
      />

      <CreateTodoItemDialog
        open={createItemDialogOpen}
        onOpenChange={(open) => {
          setCreateItemDialogOpen(open);
          if (!open) {
            setEditItemData(null);
            setSelectedListId("");
          }
        }}
        organizationId={organizationId}
        todoListId={selectedListId}
        onSuccess={loadTodoLists}
        editData={editItemData}
      />

      <AlertDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the{" "}
              {deleteConfirm?.type === "list" ? "todo list and all its items" : "todo item"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={
                deleteConfirm?.type === "list"
                  ? handleDeleteList
                  : handleDeleteItem
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
