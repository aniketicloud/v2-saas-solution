import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2, Edit, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TodoItem {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  priority: string;
  dueDate?: Date | null;
  createdAt: Date;
}

interface TodoList {
  id: string;
  title: string;
  description?: string | null;
  items: TodoItem[];
  createdAt: Date;
  _count?: {
    items: number;
  };
}

interface TodoListCardProps {
  todoList: TodoList;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddItem?: (listId: string) => void;
  onToggleItem?: (itemId: string, completed: boolean) => void;
  onEditItem?: (itemId: string) => void;
  onDeleteItem?: (itemId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
  readOnly?: boolean;
}

const priorityColors = {
  low: "bg-blue-500/10 text-blue-500",
  medium: "bg-yellow-500/10 text-yellow-500",
  high: "bg-red-500/10 text-red-500",
};

export function TodoListCard({
  todoList,
  onEdit,
  onDelete,
  onAddItem,
  onToggleItem,
  onEditItem,
  onDeleteItem,
  canEdit = true,
  canDelete = true,
  readOnly = false,
}: TodoListCardProps) {
  const completedCount = todoList.items.filter((item) => item.completed).length;
  const totalCount = todoList.items.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl">{todoList.title}</CardTitle>
            {todoList.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {todoList.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline">
                {completedCount}/{totalCount} completed
              </Badge>
              <span className="text-xs text-muted-foreground">
                Created {formatDistanceToNow(new Date(todoList.createdAt))} ago
              </span>
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-2">
              {canEdit && onEdit && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(todoList.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              {canDelete && onDelete && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(todoList.id)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {todoList.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No items yet
            </p>
          ) : (
            todoList.items.map((item) => (
              <div
                key={item.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                {!readOnly && onToggleItem && (
                  <Checkbox
                    checked={item.completed}
                    onCheckedChange={(checked) =>
                      onToggleItem(item.id, checked as boolean)
                    }
                    className="mt-1"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p
                        className={`font-medium ${
                          item.completed
                            ? "line-through text-muted-foreground"
                            : ""
                        }`}
                      >
                        {item.title}
                      </p>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge
                          variant="secondary"
                          className={priorityColors[item.priority as keyof typeof priorityColors]}
                        >
                          {item.priority}
                        </Badge>
                        {item.dueDate && (
                          <span className="text-xs text-muted-foreground">
                            Due: {new Date(item.dueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                    {!readOnly && (
                      <div className="flex items-center gap-1">
                        {canEdit && onEditItem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEditItem(item.id)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                        {canDelete && onDeleteItem && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDeleteItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {!readOnly && canEdit && onAddItem && (
          <Button
            variant="outline"
            className="w-full mt-4"
            onClick={() => onAddItem(todoList.id)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
