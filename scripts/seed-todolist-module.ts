import { prisma } from "../lib/prisma";

async function seedTodoListModule() {
  console.log("🌱 Seeding TodoList module...");

  // Create or update TodoList module
  const todolistModule = await prisma.module.upsert({
    where: { slug: "todolist" },
    update: {
      name: "TodoList",
      description: "Manage tasks and projects with customizable todo lists",
      icon: "CheckSquare",
      isActive: true,
    },
    create: {
      slug: "todolist",
      name: "TodoList",
      description: "Manage tasks and projects with customizable todo lists",
      icon: "CheckSquare",
      isActive: true,
    },
  });

  console.log("✅ TodoList module created:", todolistModule.id);

  // Define default permissions for TodoList module
  const permissions = [
    {
      resource: "todolist",
      action: "view",
      description: "View todo lists and items",
    },
    {
      resource: "todolist",
      action: "create",
      description: "Create new todo lists",
    },
    {
      resource: "todolist",
      action: "update",
      description: "Update todo lists and items",
    },
    {
      resource: "todolist",
      action: "delete",
      description: "Delete todo lists",
    },
    {
      resource: "todoitem",
      action: "create",
      description: "Create todo items",
    },
    {
      resource: "todoitem",
      action: "update",
      description: "Update todo items",
    },
    {
      resource: "todoitem",
      action: "delete",
      description: "Delete todo items",
    },
  ];

  // Create permissions
  for (const perm of permissions) {
    await prisma.modulePermission.upsert({
      where: {
        moduleId_resource_action: {
          moduleId: todolistModule.id,
          resource: perm.resource,
          action: perm.action,
        },
      },
      update: {
        description: perm.description,
      },
      create: {
        moduleId: todolistModule.id,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
    });
  }

  console.log("✅ Created", permissions.length, "permissions");
  console.log("🎉 TodoList module seeded successfully!");
}

seedTodoListModule()
  .catch((error) => {
    console.error("❌ Error seeding TodoList module:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
