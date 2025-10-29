/**
 * Backfill Predefined Roles
 * 
 * Creates Admin, Editor, and Viewer roles for organization modules
 * that don't have them yet (created before the auto-role feature).
 * 
 * Usage:
 *   npx tsx scripts/backfill-predefined-roles.ts
 */

import { prisma } from "../lib/prisma";
import { createPredefinedRoles } from "../lib/permissions/roles";

async function backfillPredefinedRoles() {
  console.log("🔄 Backfilling Predefined Roles\n");

  try {
    // Find all organization modules
    const orgModules = await prisma.organizationModule.findMany({
      include: {
        organization: {
          select: {
            name: true,
          },
        },
        module: {
          select: {
            name: true,
            slug: true,
          },
        },
        customRoles: {
          select: {
            name: true,
          },
        },
      },
    });

    console.log(`Found ${orgModules.length} organization module(s)\n`);

    if (orgModules.length === 0) {
      console.log("No organization modules found.");
      console.log("Assign modules to organizations first.\n");
      return;
    }

    let created = 0;
    let skipped = 0;
    let errors = 0;

    for (const orgModule of orgModules) {
      console.log(`\n📦 ${orgModule.organization.name} → ${orgModule.module.name}`);
      console.log(`   Module: ${orgModule.module.slug}`);
      console.log(`   Existing roles: ${orgModule.customRoles.length}`);

      // Check if predefined roles already exist
      const hasAdmin = orgModule.customRoles.some(r => r.name === "Admin");
      const hasEditor = orgModule.customRoles.some(r => r.name === "Editor");
      const hasViewer = orgModule.customRoles.some(r => r.name === "Viewer");

      if (hasAdmin && hasEditor && hasViewer) {
        console.log(`   ⊘ Skipped: Already has predefined roles`);
        skipped++;
        continue;
      }

      // Create predefined roles
      console.log(`   Creating roles...`);
      const result = await createPredefinedRoles({
        organizationModuleId: orgModule.id,
        moduleSlug: orgModule.module.slug,
        createdBy: orgModule.assignedBy,
      });

      if (result.success && result.roles) {
        console.log(`   ✓ Created ${result.roles.length} roles:`);
        result.roles.forEach(role => {
          console.log(`      • ${role.name}`);
        });
        created += result.roles.length;
      } else {
        console.log(`   ✗ Failed: ${result.error}`);
        errors++;
      }
    }

    console.log("\n\n📊 Summary:");
    console.log(`   Organization Modules: ${orgModules.length}`);
    console.log(`   Roles Created: ${created}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Errors: ${errors}`);

    if (errors === 0 && created > 0) {
      console.log("\n✅ Predefined roles backfilled successfully!\n");
    } else if (errors > 0) {
      console.log("\n⚠️  Some roles could not be created. Check the logs above.\n");
    } else {
      console.log("\n✓ All organization modules already have predefined roles.\n");
    }

  } catch (error) {
    console.error("\n❌ Error backfilling roles:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the backfill
backfillPredefinedRoles();
