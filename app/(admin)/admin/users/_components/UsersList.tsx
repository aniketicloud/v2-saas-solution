"use client";

import * as React from "react";
import { DataTable } from "./data-table";
import { columns, User } from "./columns";
import { listAllUsers } from "../action";
import { Spinner } from "@/components/ui/spinner";
import { useRouter, useSearchParams } from "next/navigation";

export function UsersList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers] = React.useState<User[]>([]);
  const [totalCount, setTotalCount] = React.useState(0);
  const [isLoading, setIsLoading] = React.useState(true);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  React.useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      const result = await listAllUsers(currentPage, pageSize);

      if (result.success && result.data) {
        setUsers(result.data.users as User[]);
        setTotalCount(result.data.total || 0);
      }

      setIsLoading(false);
    };

    fetchUsers();
  }, [currentPage]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner className="size-8" />
      </div>
    );
  }

  return (
    <DataTable
      columns={columns}
      data={users}
      totalCount={totalCount}
      pageSize={pageSize}
      currentPage={currentPage}
      onPageChange={handlePageChange}
    />
  );
}
