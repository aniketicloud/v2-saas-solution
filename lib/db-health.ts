import { prisma } from "./prisma";

/**
 * Check if the database is accessible and has the required tables
 */
export async function checkDatabaseHealth(): Promise<boolean> {
  try {
    // Simple query to check if the user table exists and is accessible
    await prisma.user.findFirst({ take: 1 });
    return true;
  } catch (error) {
    console.error("Database health check failed:", error);
    return false;
  }
}

/**
 * Verify if a session exists in the database
 */
export async function verifySessionExists(
  sessionToken: string
): Promise<boolean> {
  try {
    const session = await prisma.session.findUnique({
      where: { id: sessionToken },
    });
    return !!session;
  } catch (error) {
    console.error("Session verification failed:", error);
    return false;
  }
}
