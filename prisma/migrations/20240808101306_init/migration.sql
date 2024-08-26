-- CreateTable
CREATE TABLE "ReportBug" (
    "bug_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReportBug_pkey" PRIMARY KEY ("bug_id")
);

-- CreateTable
CREATE TABLE "RequestFeature" (
    "feature_id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RequestFeature_pkey" PRIMARY KEY ("feature_id")
);

-- AddForeignKey
ALTER TABLE "ReportBug" ADD CONSTRAINT "ReportBug_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RequestFeature" ADD CONSTRAINT "RequestFeature_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
