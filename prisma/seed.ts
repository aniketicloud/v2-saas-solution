import { PrismaClient } from "../generated/prisma";
import { auth } from "../lib/auth";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  // Create admin user
  const adminEmail = "admin@email.com";
  const adminPassword = "11111111"; // Change this in production!

  // Check if admin already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (existingAdmin) {
    console.log("✓ Admin user already exists");
  } else {
    // Use Better Auth's signUpEmail to create user with proper password hashing
    const result = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Admin User",
      },
    });

    if (result) {
      // Update user to set admin role and email verified
      await prisma.user.update({
        where: { email: adminEmail },
        data: {
          role: "admin",
          emailVerified: true,
        },
      });

      console.log("✓ Created admin user:");
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Password: ${adminPassword}`);
      console.log(`  Role: admin`);
    }
  }

  // Create a test regular user
  const userEmail = "user@email.com";
  const userPassword = "11111111";

  const existingUser = await prisma.user.findUnique({
    where: { email: userEmail },
  });

  if (existingUser) {
    console.log("✓ Test user already exists");
  } else {
    // Use Better Auth's signUpEmail to create user with proper password hashing
    const result = await auth.api.signUpEmail({
      body: {
        email: userEmail,
        password: userPassword,
        name: "Test User",
      },
    });

    if (result) {
      // Update user to set email verified
      await prisma.user.update({
        where: { email: userEmail },
        data: {
          emailVerified: true,
        },
      });

      console.log("✓ Created test user:");
      console.log(`  Email: ${userEmail}`);
      console.log(`  Password: ${userPassword}`);
      console.log(`  Role: user`);
    }
  }

  console.log("\n🎉 Seeding completed successfully!");
  console.log("\n📝 Test Accounts:");
  console.log("   Admin: admin@email.com / 11111111");
  console.log("   User:  user@email.com / 11111111");
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
