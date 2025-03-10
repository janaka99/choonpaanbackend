-- CreateTable
CREATE TABLE "CurrentLocation" (
    "id" SERIAL NOT NULL,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "userid" INTEGER NOT NULL,

    CONSTRAINT "CurrentLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CurrentLocation" ADD CONSTRAINT "CurrentLocation_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
