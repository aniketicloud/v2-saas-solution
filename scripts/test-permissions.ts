/**
 * Test Permission System
 * 
 * Quick test script to verify the permission system is working correctly.
 * 
 * Usage:
 *   npx tsx scripts/test-permissions.ts
 */

import { prisma } from "../lib/prisma";
import { checkPermission, getMemberPermissions } from "../lib/permissions";

async function testPermissions() {
  console.log("🧪 Testing Permission System\n");

  try {
    // 1. Find an organization with TodoList module
    const orgModule = await prisma.organizationModule.findFirst({
      where: {
        module: {
          slug: "todolist",
        },
        isEnabled: true,
      },
      include: {
        organization: true,
        module: true,
        customRoles: {
          include: {
            permissions: {
              include: {
                modulePermission: true,
              },
            },
            _count: {
              select: {
                memberRoles: true,
              },
            },
          },
        },
      },
    });

    if (!orgModule) {
      console.log("❌ No organization has TodoList module assigned.");
      console.log("\nPlease assign TodoList module to an organization first:");
      console.log("  1. Go to /admin/modules");
      console.log("  2. Assign TodoList to an organization\n");
      return;
    }

    console.log(`✓ Found organization: ${orgModule.organization.name}`);
    console.log(`  Module: ${orgModule.module.name}`);
    console.log(`  Custom Roles: ${orgModule.customRoles.length}\n`);

    // 2. Display custom roles
    console.log("📋 Custom Roles:");
    console.log("─────────────────────────────────────");
    for (const role of orgModule.customRoles) {
      console.log(`\n  ${role.name}`);
      console.log(`  Description: ${role.description}`);
      console.log(`  Permissions: ${role.permissions.length}`);
      console.log(`  Members: ${role._count.memberRoles}`);
      
      if (role.permissions.length > 0) {
        console.log(`  Granted permissions:`);
        role.permissions.forEach(p => {
          const perm = p.modulePermission;
          console.log(`    • ${perm.resource}.${perm.action}`);
        });
      }
    }

    // 3. Find a member in the organization
    const member = await prisma.member.findFirst({
      where: {
        organizationId: orgModule.organizationId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    if (!member) {
      console.log("\n❌ No members found in this organization.");
      return;
    }

    console.log(`\n\n👤 Testing with member: ${member.user.name}`);
    console.log(`  Email: ${member.user.email}`);
    console.log(`  User Role: ${member.user.role || "user"}`);
    console.log(`  Member Role: ${member.role}\n`);

    // 4. Test permission checks
    console.log("🔍 Permission Checks:");
    console.log("─────────────────────────────────────");

    const testPermissions = [
      { resource: "todolist", action: "view" },
      { resource: "todolist", action: "create" },
      { resource: "todolist", action: "update" },
      { resource: "todolist", action: "delete" },
      { resource: "todolist", action: "manage" },
    ];

    for (const perm of testPermissions) {
      const result = await checkPermission({
        memberId: member.id,
        organizationId: orgModule.organizationId,
        moduleSlug: "todolist",
        resource: perm.resource,
        action: perm.action,
      });

      const icon = result.allowed ? "✓" : "✗";
      const status = result.allowed ? "ALLOWED" : "DENIED";
      console.log(`  ${icon} ${perm.resource}.${perm.action.padEnd(10)} - ${status}`);
      if (result.source) {
        console.log(`      Source: ${result.source}`);
      }
      if (result.reason) {
        console.log(`      Reason: ${result.reason}`);
      }
    }

    // 5. Get all member permissions
    console.log("\n\n📊 Member's Effective Permissions:");
    console.log("─────────────────────────────────────");

    const memberPerms = await getMemberPermissions({
      memberId: member.id,
      organizationId: orgModule.organizationId,
      moduleSlug: "todolist",
    });

    console.log(`  Global Admin: ${memberPerms.isGlobalAdmin}`);
    console.log(`  Org Owner: ${memberPerms.isOrgOwner}`);
    console.log(`  Org Admin: ${memberPerms.isOrgAdmin}`);
    console.log(`  Custom Roles: ${memberPerms.customRoles.length}`);
    console.log(`  Effective Permissions: ${memberPerms.effectivePermissions.length}`);

    if (memberPerms.customRoles.length > 0) {
      console.log("\n  Assigned Roles:");
      memberPerms.customRoles.forEach(role => {
        console.log(`    • ${role.roleName} (${role.permissions.length} permissions)`);
      });
    }

    if (memberPerms.effectivePermissions.length > 0) {
      console.log("\n  Granted Permissions:");
      memberPerms.effectivePermissions.forEach(perm => {
        console.log(`    • ${perm.resource}.${perm.action}`);
      });
    }

    console.log("\n\n✅ Permission system is working correctly!\n");

  } catch (error) {
    console.error("\n❌ Error testing permissions:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testPermissions();
