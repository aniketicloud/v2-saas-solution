/**
 * Seed TodoList Module Permissions
 * 
 * This script populates the ModulePermission table with permissions for the TodoList module.
 * Run this after creating the TodoList module.
 * 
 * Usage:
 *   npx tsx scripts/seed-todolist-permissions.ts
 */

import { prisma } from "../lib/prisma";

const TODOLIST_PERMISSIONS = [
  // TodoList resource permissions
  {
    resource: "todolist",
    action: "view",
    description: "View todo lists",
  },
  {
    resource: "todolist",
    action: "create",
    description: "Create new todo lists",
  },
  {
    resource: "todolist",
    action: "update",
    description: "Edit todo list details (name, description)",
  },
  {
    resource: "todolist",
    action: "delete",
    description: "Delete todo lists",
  },
  {
    resource: "todolist",
    action: "manage",
    description: "Full control including settings and sharing",
  },

  // TodoItem resource permissions
  {
    resource: "todoitem",
    action: "view",
    description: "View todo items in lists",
  },
  {
    resource: "todoitem",
    action: "create",
    description: "Add new todo items to lists",
  },
  {
    resource: "todoitem",
    action: "update",
    description: "Edit todo item details",
  },
  {
    resource: "todoitem",
    action: "delete",
    description: "Delete todo items",
  },
  {
    resource: "todoitem",
    action: "complete",
    description: "Mark todo items as complete or incomplete",
  },
];

async function seedTodoListPermissions() {
  console.log("🌱 Seeding TodoList module permissions...\n");

  try {
    // 1. Find the TodoList module
    const todolistModule = await prisma.module.findUnique({
      where: { slug: "todolist" },
    });

    if (!todolistModule) {
      console.error("❌ TodoList module not found!");
      console.log("\nPlease run the todolist module seed script first:");
      console.log("  npx tsx scripts/seed-todolist-module.ts\n");
      process.exit(1);
    }

    console.log(`✓ Found TodoList module: ${todolistModule.name}`);
    console.log(`  ID: ${todolistModule.id}`);
    console.log(`  Slug: ${todolistModule.slug}\n`);

    // 2. Check existing permissions
    const existingPermissions = await prisma.modulePermission.findMany({
      where: {
        moduleId: todolistModule.id,
      },
    });

    console.log(`📋 Existing permissions: ${existingPermissions.length}`);

    // 3. Create or update permissions
    let created = 0;
    let updated = 0;
    let skipped = 0;

    for (const perm of TODOLIST_PERMISSIONS) {
      const existing = existingPermissions.find(
        (ep) => ep.resource === perm.resource && ep.action === perm.action
      );

      if (existing) {
        // Update description if changed
        if (existing.description !== perm.description) {
          await prisma.modulePermission.update({
            where: { id: existing.id },
            data: { description: perm.description },
          });
          console.log(`  ↻ Updated: ${perm.resource}.${perm.action}`);
          updated++;
        } else {
          console.log(`  ⊘ Skipped: ${perm.resource}.${perm.action} (no changes)`);
          skipped++;
        }
      } else {
        // Create new permission
        await prisma.modulePermission.create({
          data: {
            moduleId: todolistModule.id,
            resource: perm.resource,
            action: perm.action,
            description: perm.description,
          },
        });
        console.log(`  ✓ Created: ${perm.resource}.${perm.action}`);
        created++;
      }
    }

    console.log("\n📊 Summary:");
    console.log(`  Created: ${created}`);
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Total: ${TODOLIST_PERMISSIONS.length}`);

    // 4. Display all permissions
    const allPermissions = await prisma.modulePermission.findMany({
      where: {
        moduleId: todolistModule.id,
      },
      orderBy: [
        { resource: "asc" },
        { action: "asc" },
      ],
    });

    console.log("\n📝 TodoList Module Permissions:");
    console.log("─────────────────────────────────────────────");
    
    let currentResource = "";
    for (const perm of allPermissions) {
      if (perm.resource !== currentResource) {
        if (currentResource) console.log("");
        console.log(`\n  📦 ${perm.resource.toUpperCase()}`);
        currentResource = perm.resource;
      }
      console.log(`     • ${perm.action.padEnd(10)} - ${perm.description}`);
    }

    console.log("\n✅ TodoList permissions seeded successfully!\n");

    // 5. Show next steps
    console.log("🚀 Next Steps:");
    console.log("  1. Assign TodoList module to an organization");
    console.log("  2. Predefined roles (Admin, Editor, Viewer) will be created automatically");
    console.log("  3. Assign roles to members in the organization\n");

  } catch (error) {
    console.error("\n❌ Error seeding permissions:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedTodoListPermissions();
