-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('NEW', 'ANALYZING', 'APPLY_NOW', 'HIDDEN', 'MAYBE', 'SKIP', 'APPLIED', 'INTERVIEW', 'HIRED', 'REJECTED', 'CLOSED');

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "url" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "jobType" TEXT,
    "budgetMin" DOUBLE PRECISION,
    "budgetMax" DOUBLE PRECISION,
    "hourlyMin" DOUBLE PRECISION,
    "hourlyMax" DOUBLE PRECISION,
    "currency" TEXT,
    "skills" JSONB,
    "proposalsLabel" TEXT,
    "proposalsMin" INTEGER,
    "proposalsMax" INTEGER,
    "hires" INTEGER,
    "interviewing" INTEGER,
    "clientCountry" TEXT,
    "clientRating" DOUBLE PRECISION,
    "clientSpent" DOUBLE PRECISION,
    "clientHires" INTEGER,
    "paymentVerified" BOOLEAN,
    "locationRequirement" TEXT,
    "locationAllowed" BOOLEAN,
    "postedAt" TIMESTAMP(3),
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicalMatch" INTEGER,
    "portfolioMatch" INTEGER,
    "freshnessScore" INTEGER,
    "competitionScore" INTEGER,
    "clientScore" INTEGER,
    "locationScore" INTEGER,
    "opportunityScore" INTEGER,
    "canDo" BOOLEAN,
    "hardBlocker" BOOLEAN NOT NULL DEFAULT false,
    "category" TEXT,
    "bestProject" TEXT,
    "matchReasons" JSONB,
    "missingSkills" JSONB,
    "risks" JSONB,
    "status" "JobStatus" NOT NULL DEFAULT 'NEW',
    "proposal" TEXT,
    "proposalProject" TEXT,
    "descriptionHash" TEXT,
    "appliedAt" TIMESTAMP(3),
    "clientViewed" BOOLEAN NOT NULL DEFAULT false,
    "interview" BOOLEAN NOT NULL DEFAULT false,
    "hired" BOOLEAN NOT NULL DEFAULT false,
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppSettings" (
    "id" TEXT NOT NULL,
    "minimumMatch" INTEGER NOT NULL DEFAULT 70,
    "fastMatchMinimum" INTEGER NOT NULL DEFAULT 80,
    "hiddenMatchMinimum" INTEGER NOT NULL DEFAULT 75,
    "maximumFastAgeMinutes" INTEGER NOT NULL DEFAULT 60,
    "maximumHiddenAgeMinutes" INTEGER NOT NULL DEFAULT 180,
    "maximumFastProposals" INTEGER NOT NULL DEFAULT 10,
    "maximumHiddenProposals" INTEGER NOT NULL DEFAULT 5,
    "minimumHourly" DOUBLE PRECISION,
    "minimumFixedBudget" DOUBLE PRECISION,
    "telegramEnabled" BOOLEAN NOT NULL DEFAULT false,
    "aiProvider" TEXT NOT NULL DEFAULT 'anthropic',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Job_externalId_key" ON "Job"("externalId");

-- CreateIndex
CREATE UNIQUE INDEX "Job_url_key" ON "Job"("url");

-- CreateIndex
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- CreateIndex
CREATE INDEX "Job_createdAt_idx" ON "Job"("createdAt");
