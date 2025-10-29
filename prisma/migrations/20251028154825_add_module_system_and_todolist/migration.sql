-- CreateTable
CREATE TABLE "module" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "module_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizationModule" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "settings" JSONB,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "organizationModule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customRole" (
    "id" TEXT NOT NULL,
    "organizationModuleId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "modulePermission" (
    "id" TEXT NOT NULL,
    "moduleId" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "modulePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rolePermission" (
    "id" TEXT NOT NULL,
    "customRoleId" TEXT NOT NULL,
    "modulePermissionId" TEXT NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberModuleRole" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "customRoleId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assignedBy" TEXT NOT NULL,

    CONSTRAINT "memberModuleRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todoList" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todoList_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "todoItem" (
    "id" TEXT NOT NULL,
    "todoListId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "priority" TEXT NOT NULL DEFAULT 'medium',
    "dueDate" TIMESTAMP(3),
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "todoItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "module_name_key" ON "module"("name");

-- CreateIndex
CREATE UNIQUE INDEX "module_slug_key" ON "module"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "organizationModule_organizationId_moduleId_key" ON "organizationModule"("organizationId", "moduleId");

-- CreateIndex
CREATE UNIQUE INDEX "customRole_organizationModuleId_name_key" ON "customRole"("organizationModuleId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "modulePermission_moduleId_resource_action_key" ON "modulePermission"("moduleId", "resource", "action");

-- CreateIndex
CREATE UNIQUE INDEX "rolePermission_customRoleId_modulePermissionId_key" ON "rolePermission"("customRoleId", "modulePermissionId");

-- CreateIndex
CREATE UNIQUE INDEX "memberModuleRole_memberId_customRoleId_key" ON "memberModuleRole"("memberId", "customRoleId");

-- CreateIndex
CREATE INDEX "todoList_organizationId_idx" ON "todoList"("organizationId");

-- CreateIndex
CREATE INDEX "todoItem_todoListId_idx" ON "todoItem"("todoListId");

-- AddForeignKey
ALTER TABLE "organizationModule" ADD CONSTRAINT "organizationModule_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organizationModule" ADD CONSTRAINT "organizationModule_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customRole" ADD CONSTRAINT "customRole_organizationModuleId_fkey" FOREIGN KEY ("organizationModuleId") REFERENCES "organizationModule"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "modulePermission" ADD CONSTRAINT "modulePermission_moduleId_fkey" FOREIGN KEY ("moduleId") REFERENCES "module"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermission" ADD CONSTRAINT "rolePermission_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "customRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rolePermission" ADD CONSTRAINT "rolePermission_modulePermissionId_fkey" FOREIGN KEY ("modulePermissionId") REFERENCES "modulePermission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberModuleRole" ADD CONSTRAINT "memberModuleRole_customRoleId_fkey" FOREIGN KEY ("customRoleId") REFERENCES "customRole"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "todoItem" ADD CONSTRAINT "todoItem_todoListId_fkey" FOREIGN KEY ("todoListId") REFERENCES "todoList"("id") ON DELETE CASCADE ON UPDATE CASCADE;
