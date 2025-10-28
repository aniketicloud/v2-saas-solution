"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  listUserSessions,
  revokeSession,
  revokeUserSessions,
} from "../../_lib/actions";
import { LogOut, Laptop, RefreshCw } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Session {
  id: string;
  token: string;
  expiresAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

interface UserSessionsCardProps {
  userId: string;
}

export function UserSessionsCard({ userId }: UserSessionsCardProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRevoking, setIsRevoking] = useState<string | null>(null);

  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    const result = await listUserSessions(userId);
    if (result.success && result.data) {
      // Handle if data is an array or an object with sessions property
      const sessionsData = Array.isArray(result.data) 
        ? result.data 
        : (result.data as any)?.sessions || [];
      setSessions(sessionsData);
    } else {
      setSessions([]);
    }
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  async function handleRevokeSession(sessionToken: string) {
    setIsRevoking(sessionToken);
    try {
      const result = await revokeSession(sessionToken);
      if (result.success) {
        toast.success("Session revoked successfully");
        await loadSessions();
      } else {
        toast.error(result.error || "Failed to revoke session");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsRevoking(null);
    }
  }

  async function handleRevokeAllSessions() {
    setIsRevoking("all");
    try {
      const result = await revokeUserSessions(userId);
      if (result.success) {
        toast.success("All sessions revoked successfully");
        await loadSessions();
      } else {
        toast.error(result.error || "Failed to revoke sessions");
      }
    } catch (error) {
      toast.error("An error occurred");
      console.error(error);
    } finally {
      setIsRevoking(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Laptop className="h-5 w-5" />
          Active Sessions ({sessions.length})
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadSessions}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          {sessions.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <LogOut className="mr-2 h-4 w-4" />
                  Revoke All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Revoke All Sessions?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will log out the user from all devices. They will need to sign
                    in again.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleRevokeAllSessions}>
                    Revoke All Sessions
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner className="h-8 w-8" />
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Laptop className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm">No active sessions</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Device / Browser</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Expires</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sessions.map((session) => (
                  <TableRow key={session.id}>
                    <TableCell className="font-medium">
                      {session.userAgent || "Unknown Device"}
                    </TableCell>
                    <TableCell>{session.ipAddress || "N/A"}</TableCell>
                    <TableCell>
                      {new Date(session.expiresAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRevokeSession(session.token)}
                        disabled={isRevoking === session.token}
                      >
                        {isRevoking === session.token ? (
                          <Spinner className="h-4 w-4" />
                        ) : (
                          <>
                            <LogOut className="h-4 w-4 mr-1" />
                            Revoke
                          </>
                        )}
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
  );
}
