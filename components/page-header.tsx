import { ReactNode } from "react";

interface PageHeaderProps {
  /**
   * The main title of the page
   */
  title: string;
  /**
   * Optional description or subtitle for the page
   */
  description?: string;
  /**
   * Optional action button or element to display on the right
   */
  action?: ReactNode;
}

/**
 * Generic page header component for consistent page layouts
 *
 * @example
 * ```tsx
 * <PageHeader
 *   title="User Management"
 *   description="Manage users, roles, and permissions"
 *   action={<Button>Add User</Button>}
 * />
 * ```
 */
export function PageHeader({ title, description, action }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
