-- AlterTable
ALTER TABLE "analyses" ADD COLUMN     "website_analysis" JSONB,
ADD COLUMN     "website_visibility_score" DOUBLE PRECISION;
