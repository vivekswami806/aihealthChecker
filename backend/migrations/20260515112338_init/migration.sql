-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'DOCTOR');

-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE', 'GITHUB');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SeverityLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "DiseaseStatus" AS ENUM ('ACTIVE', 'IMPROVING', 'STABLE', 'RESOLVED', 'WORSENING');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('INFO', 'WARNING', 'ALERT', 'REMINDER');

-- CreateEnum
CREATE TYPE "SubscriptionPlan" AS ENUM ('FREE', 'PREMIUM', 'FAMILY');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "profileImage" TEXT,
    "authProvider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "refreshToken" TEXT,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "medical_reports" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reportName" TEXT NOT NULL,
    "reportType" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "extractedText" TEXT,
    "fileSize" INTEGER,
    "mimeType" TEXT,
    "reportStatus" "ReportStatus" NOT NULL DEFAULT 'PENDING',
    "uploadDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "medical_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ai_analyses" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "diseaseDetected" TEXT NOT NULL,
    "severity" "SeverityLevel" NOT NULL,
    "riskScore" DOUBLE PRECISION NOT NULL,
    "aiSummary" TEXT NOT NULL,
    "causes" TEXT NOT NULL,
    "precautions" TEXT NOT NULL,
    "dietSuggestions" TEXT NOT NULL,
    "exerciseSuggestions" TEXT NOT NULL,
    "medicationsWarning" TEXT,
    "doctorRecommendation" TEXT,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "disease_history" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "diseaseName" TEXT NOT NULL,
    "firstDetected" TIMESTAMP(3) NOT NULL,
    "lastDetected" TIMESTAMP(3) NOT NULL,
    "recurrenceCount" INTEGER NOT NULL DEFAULT 1,
    "currentStatus" "DiseaseStatus" NOT NULL,
    "progressionLevel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disease_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_comparisons" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "oldReportId" TEXT NOT NULL,
    "newReportId" TEXT NOT NULL,
    "comparisonSummary" TEXT NOT NULL,
    "healthImprovementScore" DOUBLE PRECISION NOT NULL,
    "detectedChanges" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_comparisons_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'INFO',
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "health_scores" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "bmi" DOUBLE PRECISION,
    "bloodPressure" TEXT,
    "sugarLevel" DOUBLE PRECISION,
    "cholesterolLevel" DOUBLE PRECISION,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "health_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" "SubscriptionPlan" NOT NULL DEFAULT 'FREE',
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_verifications" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otp_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "medical_reports_userId_idx" ON "medical_reports"("userId");

-- CreateIndex
CREATE INDEX "medical_reports_reportStatus_idx" ON "medical_reports"("reportStatus");

-- CreateIndex
CREATE UNIQUE INDEX "ai_analyses_reportId_key" ON "ai_analyses"("reportId");

-- CreateIndex
CREATE INDEX "ai_analyses_severity_idx" ON "ai_analyses"("severity");

-- CreateIndex
CREATE INDEX "disease_history_userId_idx" ON "disease_history"("userId");

-- CreateIndex
CREATE INDEX "disease_history_diseaseName_idx" ON "disease_history"("diseaseName");

-- CreateIndex
CREATE INDEX "report_comparisons_userId_idx" ON "report_comparisons"("userId");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "notifications_isRead_idx" ON "notifications"("isRead");

-- CreateIndex
CREATE INDEX "health_scores_userId_idx" ON "health_scores"("userId");

-- CreateIndex
CREATE INDEX "subscriptions_userId_idx" ON "subscriptions"("userId");

-- CreateIndex
CREATE INDEX "otp_verifications_email_idx" ON "otp_verifications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_refreshToken_key" ON "sessions"("refreshToken");

-- CreateIndex
CREATE INDEX "sessions_userId_idx" ON "sessions"("userId");

-- AddForeignKey
ALTER TABLE "medical_reports" ADD CONSTRAINT "medical_reports_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ai_analyses" ADD CONSTRAINT "ai_analyses_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "medical_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "disease_history" ADD CONSTRAINT "disease_history_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comparisons" ADD CONSTRAINT "report_comparisons_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comparisons" ADD CONSTRAINT "report_comparisons_oldReportId_fkey" FOREIGN KEY ("oldReportId") REFERENCES "medical_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_comparisons" ADD CONSTRAINT "report_comparisons_newReportId_fkey" FOREIGN KEY ("newReportId") REFERENCES "medical_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "health_scores" ADD CONSTRAINT "health_scores_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
