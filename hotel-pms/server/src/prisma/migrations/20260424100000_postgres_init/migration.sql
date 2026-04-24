-- CreateTable
CREATE TABLE "Property" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "totalRooms" INTEGER NOT NULL DEFAULT 0,
    "timezone" TEXT NOT NULL DEFAULT 'America/Los_Angeles',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "propertyId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baseRate" DECIMAL(65,30) NOT NULL,
    "maxOccupancy" INTEGER NOT NULL DEFAULT 2,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "RoomType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Room" (
    "id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "floor" INTEGER NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'VACANT',
    "currentGuestId" TEXT,

    CONSTRAINT "Room_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Guest" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "nationality" TEXT,
    "idType" TEXT,
    "idNumber" TEXT,
    "loyaltyTier" TEXT NOT NULL DEFAULT 'NONE',
    "loyaltyPoints" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Guest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reservation" (
    "id" TEXT NOT NULL,
    "confirmationNumber" TEXT NOT NULL,
    "guestId" TEXT NOT NULL,
    "roomId" TEXT,
    "roomTypeId" TEXT NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL,
    "checkOut" TIMESTAMP(3) NOT NULL,
    "adults" INTEGER NOT NULL DEFAULT 1,
    "children" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
    "source" TEXT NOT NULL DEFAULT 'DIRECT',
    "ratePlanId" TEXT,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "depositPaid" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "specialRequests" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RatePlan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "baseRate" DECIMAL(65,30) NOT NULL,
    "isRefundable" BOOLEAN NOT NULL DEFAULT true,
    "breakfastIncluded" BOOLEAN NOT NULL DEFAULT false,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "RatePlan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DailyRate" (
    "id" TEXT NOT NULL,
    "roomTypeId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "rate" DECIMAL(65,30) NOT NULL,
    "minLOS" INTEGER NOT NULL DEFAULT 1,
    "maxLOS" INTEGER NOT NULL DEFAULT 30,
    "closedToArrival" BOOLEAN NOT NULL DEFAULT false,
    "closedToDeparture" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "DailyRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolioItem" (
    "id" TEXT NOT NULL,
    "reservationId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "type" TEXT NOT NULL,
    "postedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "postedById" TEXT,

    CONSTRAINT "FolioItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HousekeepingTask" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "assignedToId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "taskType" TEXT NOT NULL DEFAULT 'CHECKOUT',
    "priority" INTEGER NOT NULL DEFAULT 3,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "HousekeepingTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MaintenanceRequest" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "reportedById" TEXT NOT NULL,
    "reportedBy" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'LOW',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "images" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "resolvedBy" TEXT,

    CONSTRAINT "MaintenanceRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "taskType" TEXT NOT NULL DEFAULT 'CHECKOUT',
    "roomType" TEXT,
    "propertyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChecklistTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomChecklist" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "completedAt" TIMESTAMP(3),
    "inspectedById" TEXT,
    "inspectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RoomChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoomChecklistItem" (
    "id" TEXT NOT NULL,
    "checklistId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "isChecked" BOOLEAN NOT NULL DEFAULT false,
    "checkedAt" TIMESTAMP(3),

    CONSTRAINT "RoomChecklistItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LostAndFound" (
    "id" TEXT NOT NULL,
    "roomId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "foundBy" TEXT NOT NULL,
    "foundAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'UNCLAIMED',
    "guestName" TEXT,
    "claimedAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "LostAndFound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupplyRequest" (
    "id" TEXT NOT NULL,
    "requestedBy" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "quantity" TEXT NOT NULL,
    "urgency" TEXT NOT NULL DEFAULT 'NORMAL',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "SupplyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_propertyId_idx" ON "User"("propertyId");

-- CreateIndex
CREATE INDEX "RoomType_propertyId_idx" ON "RoomType"("propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_number_key" ON "Room"("number");

-- CreateIndex
CREATE INDEX "Room_roomTypeId_idx" ON "Room"("roomTypeId");

-- CreateIndex
CREATE INDEX "Room_status_idx" ON "Room"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Guest_email_key" ON "Guest"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Reservation_confirmationNumber_key" ON "Reservation"("confirmationNumber");

-- CreateIndex
CREATE INDEX "Reservation_guestId_idx" ON "Reservation"("guestId");

-- CreateIndex
CREATE INDEX "Reservation_roomId_idx" ON "Reservation"("roomId");

-- CreateIndex
CREATE INDEX "Reservation_status_idx" ON "Reservation"("status");

-- CreateIndex
CREATE INDEX "Reservation_checkIn_idx" ON "Reservation"("checkIn");

-- CreateIndex
CREATE INDEX "RatePlan_propertyId_idx" ON "RatePlan"("propertyId");

-- CreateIndex
CREATE INDEX "DailyRate_date_idx" ON "DailyRate"("date");

-- CreateIndex
CREATE UNIQUE INDEX "DailyRate_roomTypeId_date_key" ON "DailyRate"("roomTypeId", "date");

-- CreateIndex
CREATE INDEX "FolioItem_reservationId_idx" ON "FolioItem"("reservationId");

-- CreateIndex
CREATE INDEX "HousekeepingTask_roomId_idx" ON "HousekeepingTask"("roomId");

-- CreateIndex
CREATE INDEX "HousekeepingTask_assignedToId_idx" ON "HousekeepingTask"("assignedToId");

-- CreateIndex
CREATE INDEX "HousekeepingTask_status_idx" ON "HousekeepingTask"("status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_roomId_idx" ON "MaintenanceRequest"("roomId");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_status_idx" ON "MaintenanceRequest"("status");

-- CreateIndex
CREATE INDEX "MaintenanceRequest_severity_idx" ON "MaintenanceRequest"("severity");

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

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomType" ADD CONSTRAINT "RoomType_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Room" ADD CONSTRAINT "Room_currentGuestId_fkey" FOREIGN KEY ("currentGuestId") REFERENCES "Guest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_guestId_fkey" FOREIGN KEY ("guestId") REFERENCES "Guest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reservation" ADD CONSTRAINT "Reservation_ratePlanId_fkey" FOREIGN KEY ("ratePlanId") REFERENCES "RatePlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RatePlan" ADD CONSTRAINT "RatePlan_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyRate" ADD CONSTRAINT "DailyRate_roomTypeId_fkey" FOREIGN KEY ("roomTypeId") REFERENCES "RoomType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolioItem" ADD CONSTRAINT "FolioItem_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolioItem" ADD CONSTRAINT "FolioItem_postedById_fkey" FOREIGN KEY ("postedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HousekeepingTask" ADD CONSTRAINT "HousekeepingTask_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HousekeepingTask" ADD CONSTRAINT "HousekeepingTask_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MaintenanceRequest" ADD CONSTRAINT "MaintenanceRequest_reportedById_fkey" FOREIGN KEY ("reportedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChecklistTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomChecklist" ADD CONSTRAINT "RoomChecklist_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "HousekeepingTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomChecklistItem" ADD CONSTRAINT "RoomChecklistItem_checklistId_fkey" FOREIGN KEY ("checklistId") REFERENCES "RoomChecklist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LostAndFound" ADD CONSTRAINT "LostAndFound_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

