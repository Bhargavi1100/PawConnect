-- Per-place IANA timezone for open-now computation in the place's local time
ALTER TABLE "Place" ADD COLUMN "timezone" TEXT;
