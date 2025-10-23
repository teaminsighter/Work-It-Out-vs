-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "ContactPreference" AS ENUM ('PHONE', 'EMAIL', 'BOTH');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL_SENT', 'CONVERTED', 'NOT_INTERESTED');

-- CreateEnum
CREATE TYPE "PageStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "TestStatus" AS ENUM ('DRAFT', 'RUNNING', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'TESTING');

-- CreateEnum
CREATE TYPE "GTMStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'DRAFT');

-- CreateEnum
CREATE TYPE "GTMTagStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "PlatformCategory" AS ENUM ('ANALYTICS', 'MARKETING', 'CRM', 'COMMUNICATION', 'AUTOMATION');

-- CreateEnum
CREATE TYPE "PlatformStatus" AS ENUM ('CONNECTED', 'DISCONNECTED', 'ERROR', 'PENDING');

-- CreateEnum
CREATE TYPE "EventProcessStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED');

-- CreateEnum
CREATE TYPE "HTTPMethod" AS ENUM ('GET', 'POST', 'PUT', 'DELETE');

-- CreateEnum
CREATE TYPE "AuthType" AS ENUM ('API_KEY', 'OAUTH', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "EndpointStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ERROR');

-- CreateEnum
CREATE TYPE "ABTestStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AssignmentType" AS ENUM ('FIFTY_FIFTY', 'ALTERNATING', 'CUSTOM_SPLIT');

-- CreateEnum
CREATE TYPE "URLMatchType" AS ENUM ('EXACT', 'PATTERN', 'REGEX');

-- CreateEnum
CREATE TYPE "ABVariant" AS ENUM ('A', 'B');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "username" TEXT,
    "avatar" TEXT,
    "phone_number" TEXT,
    "department" TEXT,
    "job_title" TEXT,
    "bio" TEXT,
    "timezone" TEXT DEFAULT 'UTC',
    "language" TEXT DEFAULT 'en',
    "role" "Role" NOT NULL DEFAULT 'VIEWER',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "last_login_at" TIMESTAMP(3),
    "last_active_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" TEXT,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "contact_preference" "ContactPreference" NOT NULL DEFAULT 'EMAIL',
    "best_time_to_call" TEXT,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "source" TEXT NOT NULL DEFAULT 'website',
    "score" INTEGER NOT NULL DEFAULT 0,
    "tags" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "date_created" TIMESTAMP(3),
    "date_modified" TIMESTAMP(3),
    "utm_campaign" TEXT,
    "utm_source" TEXT,
    "utm_medium" TEXT,
    "utm_content" TEXT,
    "utm_keyword" TEXT,
    "utm_placement" TEXT,
    "gclid" TEXT,
    "fbclid" TEXT,
    "visitor_user_id" TEXT,
    "ip_address" TEXT,
    "device" TEXT,
    "display_aspect_ratio" TEXT,
    "default_location" TEXT,
    "form_id" TEXT,
    "form_class" TEXT,
    "form_name" TEXT,
    "ab_test_id" TEXT,
    "ab_variant" "ABVariant",
    "first_visit_url" TEXT,
    "last_visit_url" TEXT,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "leads_visitor_user_id_key" ON "leads"("visitor_user_id");

-- Add foreign key constraint
ALTER TABLE "users" ADD CONSTRAINT "users_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;