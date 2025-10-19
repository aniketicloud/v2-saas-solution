#!/usr/bin/env tsx

/**
 * Make Admin Script
 * 
 * This script promotes an existing user to admin role.
 * 
 * Usage:
 *   pnpm admin:make <email>
 *   npx tsx scripts/make-admin.ts <email>
 * 
 * Example:
 *   pnpm admin:make newadmin@company.com
 * 
 * Security:
 * - This script should only be run by system administrators
 * - Requires direct database access
 * - User must already exist in the database
 */

import { PrismaClient } from "../generated/prisma";

const prisma = new PrismaClient();

async function makeAdmin(email: string) {
  try {
    console.log(`\n🔍 Looking for user: ${email}...`);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!existingUser) {
      console.error(`\n❌ Error: User with email "${email}" not found.`);
      console.log(`\n💡 Tip: Make sure the user has signed up first, then run this script.`);
      process.exit(1);
    }

    // Check if user is already an admin
    if (existingUser.role === "admin") {
      console.log(`\n✓ User "${email}" is already an admin.`);
      console.log(`\nUser Details:`);
      console.log(`  Name: ${existingUser.name}`);
      console.log(`  Email: ${existingUser.email}`);
      console.log(`  Role: ${existingUser.role}`);
      process.exit(0);
    }

    // Update user role to admin
    const updatedUser = await prisma.user.update({
      where: { email },
      data: { role: "admin" },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    console.log(`\n✅ Success! User "${email}" is now an admin.`);
    console.log(`\nUpdated User Details:`);
    console.log(`  Name: ${updatedUser.name}`);
    console.log(`  Email: ${updatedUser.email}`);
    console.log(`  Role: ${updatedUser.role}`);
    console.log(`\n🎉 The user can now access admin routes at /admin/dashboard\n`);
  } catch (error) {
    console.error("\n❌ Error updating user role:");
    console.error(error);
    process.exit(1);
  }
}

async function main() {
  // Get email from command line arguments
  const email = process.argv[2];

  if (!email) {
    console.error("\n❌ Error: Email address is required.");
    console.log("\nUsage:");
    console.log("  pnpm admin:make <email>");
    console.log("  npx tsx scripts/make-admin.ts <email>");
    console.log("\nExample:");
    console.log("  pnpm admin:make admin@company.com\n");
    process.exit(1);
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.error(`\n❌ Error: "${email}" is not a valid email address.\n`);
    process.exit(1);
  }

  await makeAdmin(email);
}

main()
  .catch((error) => {
    console.error("\n❌ Unexpected error:");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
