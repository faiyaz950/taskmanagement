-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "startedAt" TIMESTAMP(3),
ALTER COLUMN "dueDate" DROP NOT NULL;
