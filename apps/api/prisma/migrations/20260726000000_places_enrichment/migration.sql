-- CreateTable
CREATE TABLE "EnrichmentArea" (
    "id" TEXT NOT NULL,
    "cellKey" TEXT NOT NULL,
    "enrichedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EnrichmentArea_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EnrichmentArea_cellKey_key" ON "EnrichmentArea"("cellKey");
