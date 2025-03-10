-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Bakery" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "managerId" INTEGER NOT NULL,

    CONSTRAINT "Bakery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Manager" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Manager_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "bakeryId" INTEGER,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Bakery_managerId_key" ON "Bakery"("managerId");

-- AddForeignKey
ALTER TABLE "Bakery" ADD CONSTRAINT "Bakery_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "Manager"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Manager" ADD CONSTRAINT "Manager_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_bakeryId_fkey" FOREIGN KEY ("bakeryId") REFERENCES "Bakery"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Employee" ADD CONSTRAINT "Employee_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
