/**
 * Update existing predefined roles to set isPredefined = true
 * 
 * This script updates the Admin, Editor, and Viewer roles that were created
 * before the isPredefined field was added to the schema.
 */

import { prisma } from "../lib/prisma";

async function updatePredefinedRolesFlags() {
  console.log("🔄 Updating predefined roles flags...\n");

  try {
    // Get all custom roles
    const allRoles = await prisma.customRole.findMany({
      include: {
        organizationModule: {
          include: {
            module: {
              select: {
                name: true,
              },
            },
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(`Found ${allRoles.length} total roles\n`);

    // Predefined role names
    const predefinedNames = ["Admin", "Editor", "Viewer"];

    let updatedCount = 0;

    for (const role of allRoles) {
      if (predefinedNames.includes(role.name) && !role.isPredefined) {
        await prisma.customRole.update({
          where: { id: role.id },
          data: { isPredefined: true },
        });

        console.log(
          `✅ Updated "${role.name}" role for ${role.organizationModule.organization.name} - ${role.organizationModule.module.name}`
        );
        updatedCount++;
      }
    }

    console.log(
      `\n✨ Updated ${updatedCount} predefined roles with isPredefined flag`
    );

    // Summary
    const predefinedRoles = await prisma.customRole.findMany({
      where: {
        isPredefined: true,
      },
      include: {
        organizationModule: {
          include: {
            module: {
              select: {
                name: true,
              },
            },
            organization: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    console.log(`\n📊 Summary:`);
    console.log(`Total predefined roles: ${predefinedRoles.length}`);

    if (predefinedRoles.length > 0) {
      console.log("\nPredefined roles:");
      for (const role of predefinedRoles) {
        console.log(
          `  - ${role.name} (${role.organizationModule.organization.name} - ${role.organizationModule.module.name})`
        );
      }
    }
  } catch (error) {
    console.error("❌ Error updating predefined roles:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

updatePredefinedRolesFlags()
  .then(() => {
    console.log("\n✅ Script completed successfully");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Script failed:", error);
    process.exit(1);
  });
