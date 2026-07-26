-- Enable PostGIS for geography types and spatial indexing
CREATE EXTENSION IF NOT EXISTS postgis;

-- CreateEnum
CREATE TYPE "PlaceType" AS ENUM ('VET_CLINIC', 'VET_HOSPITAL', 'SHELTER');
CREATE TYPE "PlaceSource" AS ENUM ('CURATED', 'GOOGLE_PLACES');
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');

-- CreateTable
CREATE TABLE "Place" (
    "id" TEXT NOT NULL,
    "type" "PlaceType" NOT NULL,
    "name" TEXT NOT NULL,
    "location" geography(Point, 4326) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" TEXT,
    "website" TEXT,
    "hours" JSONB,
    "isEmergency" BOOLEAN NOT NULL DEFAULT false,
    "is24Hours" BOOLEAN NOT NULL DEFAULT false,
    "services" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "googlePlaceId" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "source" "PlaceSource" NOT NULL DEFAULT 'CURATED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Place_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Place_googlePlaceId_key" ON "Place"("googlePlaceId");
CREATE INDEX "Place_location_idx" ON "Place" USING GIST ("location");
CREATE INDEX "Place_type_idx" ON "Place"("type");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
