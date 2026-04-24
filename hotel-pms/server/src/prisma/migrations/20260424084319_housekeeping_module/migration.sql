-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "taskType" TEXT NOT NULL DEFAULT 'CHECKOUT',
    "roomType" TEXT,
    "propertyId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "templateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "ChecklistItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoomChecklist" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "taskId" TEXT NOT NULL,
    "completedAt" DATETIME,
    "inspectedById" TEXT,
    "inspectedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RoomChecklist_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "HousekeepingTask" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "RoomChecklistItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "checklistId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" DATETIME,
    CONSTRAINT "RoomChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "RoomChecklist" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LostAndFound" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "foundBy" TEXT NOT NULL,
    "foundAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'UNCLAIMED',
    "guestName" TEXT,
    "claimedAt" DATETIME,
    "notes" TEXT,
    CONSTRAINT "LostAndFound_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SupplyRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestedBy" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" DATETIME
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_HousekeepingTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "taskType" TEXT NOT NULL DEFAULT 'CHECKOUT',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" DATETIME,
    "completedAt" DATETIME,
    CONSTRAINT "HousekeepingTask_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "HousekeepingTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_HousekeepingTask" ("assignedToId", "completedAt", "createdAt", "id", "notes", "priority", "roomId", "status") SELECT "assignedToId", "completedAt", "createdAt", "id", "notes", "priority", "roomId", "status" FROM "HousekeepingTask";
DROP TABLE "HousekeepingTask";
ALTER TABLE "new_HousekeepingTask" RENAME TO "HousekeepingTask";
CREATE INDEX "HousekeepingTask_roomId_idx" ON "HousekeepingTask"("roomId");
CREATE INDEX "HousekeepingTask_assignedToId_idx" ON "HousekeepingTask"("assignedToId");
CREATE INDEX "HousekeepingTask_status_idx" ON "HousekeepingTask"("status");
CREATE TABLE "new_MaintenanceRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "roomId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "images" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" DATETIME,
    "resolvedBy" TEXT,
    CONSTRAINT "MaintenanceRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "MaintenanceRequest_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MaintenanceRequest" ("createdAt", "description", "id", "reportedById", "roomId", "status") SELECT "createdAt", "description", "id", "reportedById", "roomId", "status" FROM "MaintenanceRequest";
DROP TABLE "MaintenanceRequest";
ALTER TABLE "new_MaintenanceRequest" RENAME TO "MaintenanceRequest";
CREATE INDEX "MaintenanceRequest_roomId_idx" ON "MaintenanceRequest"("roomId");
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");
CREATE INDEX "MaintenanceRequest_severity_idx" ON "MaintenanceRequest"("severity");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "ChecklistTemplate_propertyId_idx" ON "ChecklistTemplate"("propertyId");

-- CreateIndex
CREATE INDEX "ChecklistTemplate_taskType_idx" ON "ChecklistTemplate"("taskType");

-- CreateIndex
CREATE INDEX "ChecklistItem_templateId_idx" ON "ChecklistItem"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "RoomChecklist_taskId_key" ON "RoomChecklist"("taskId");

-- CreateIndex
CREATE INDEX "RoomChecklist_taskId_idx" ON "RoomChecklist"("taskId");

-- CreateIndex
CREATE INDEX "RoomChecklistItem_checklistId_idx" ON "RoomChecklistItem"("checklistId");

-- CreateIndex
CREATE INDEX "LostAndFound_roomId_idx" ON "LostAndFound"("roomId");

-- CreateIndex
CREATE INDEX "LostAndFound_status_idx" ON "LostAndFound"("status");

-- CreateIndex
CREATE INDEX "SupplyRequest_status_idx" ON "SupplyRequest"("status");

-- CreateIndex
CREATE INDEX "SupplyRequest_urgency_idx" ON "SupplyRequest"("urgency");
