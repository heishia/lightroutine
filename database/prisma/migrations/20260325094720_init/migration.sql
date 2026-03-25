-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routines" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "time_slot" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "repeat_days" TEXT NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "routines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "routine_logs" (
    "id" TEXT NOT NULL,
    "routine_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "log_date" DATE NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "routine_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "routines_user_id_idx" ON "routines"("user_id");

-- CreateIndex
CREATE INDEX "routine_logs_user_id_log_date_idx" ON "routine_logs"("user_id", "log_date");

-- CreateIndex
CREATE UNIQUE INDEX "routine_logs_routine_id_log_date_key" ON "routine_logs"("routine_id", "log_date");

-- AddForeignKey
ALTER TABLE "routines" ADD CONSTRAINT "routines_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_logs" ADD CONSTRAINT "routine_logs_routine_id_fkey" FOREIGN KEY ("routine_id") REFERENCES "routines"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "routine_logs" ADD CONSTRAINT "routine_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
