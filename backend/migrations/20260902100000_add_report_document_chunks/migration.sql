-- CreateTable
CREATE TABLE "report_document_chunks" (
    "id" TEXT NOT NULL,
    "reportId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "embedding" JSONB NOT NULL,
    "tokenCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "report_document_chunks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "report_document_chunks_reportId_idx" ON "report_document_chunks"("reportId");

-- CreateIndex
CREATE INDEX "report_document_chunks_userId_idx" ON "report_document_chunks"("userId");

-- AddForeignKey
ALTER TABLE "report_document_chunks" ADD CONSTRAINT "report_document_chunks_reportId_fkey" FOREIGN KEY ("reportId") REFERENCES "medical_reports"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "report_document_chunks" ADD CONSTRAINT "report_document_chunks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
