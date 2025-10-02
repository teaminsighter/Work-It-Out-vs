-- Additional tables for tracking setup functionality
-- Run these migrations after your existing schema

-- DataLayer Events Configuration
CREATE TABLE IF NOT EXISTS "DataLayerEvent" (
    "id" SERIAL PRIMARY KEY,
    "eventName" TEXT NOT NULL UNIQUE,
    "description" TEXT NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "triggerCondition" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'inactive', 'testing')),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Event Fires (tracking when events actually fire)
CREATE TABLE IF NOT EXISTS "EventFire" (
    "id" SERIAL PRIMARY KEY,
    "eventId" INTEGER NOT NULL REFERENCES "DataLayerEvent"("id") ON DELETE CASCADE,
    "userId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "parameters" JSONB NOT NULL DEFAULT '{}',
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GTM Containers
CREATE TABLE IF NOT EXISTS "GTMContainer" (
    "id" SERIAL PRIMARY KEY,
    "containerId" TEXT NOT NULL UNIQUE,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'inactive', 'draft')),
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastPublished" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GTM Tags
CREATE TABLE IF NOT EXISTS "GTMTag" (
    "id" SERIAL PRIMARY KEY,
    "containerId" INTEGER NOT NULL REFERENCES "GTMContainer"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'paused')),
    "triggers" JSONB NOT NULL DEFAULT '[]',
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "firingCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GTM Triggers
CREATE TABLE IF NOT EXISTS "GTMTrigger" (
    "id" SERIAL PRIMARY KEY,
    "containerId" INTEGER NOT NULL REFERENCES "GTMContainer"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- GTM Variables
CREATE TABLE IF NOT EXISTS "GTMVariable" (
    "id" SERIAL PRIMARY KEY,
    "containerId" INTEGER NOT NULL REFERENCES "GTMContainer"("id") ON DELETE CASCADE,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "configuration" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Platform Integrations
CREATE TABLE IF NOT EXISTS "PlatformIntegration" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL CHECK ("category" IN ('analytics', 'marketing', 'crm', 'communication', 'automation')),
    "platformId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'disconnected' CHECK ("status" IN ('connected', 'disconnected', 'error', 'pending')),
    "credentials" JSONB NOT NULL DEFAULT '{}',
    "endpoint" TEXT,
    "webhookUrl" TEXT,
    "features" JSONB NOT NULL DEFAULT '[]',
    "lastSync" TIMESTAMP(3),
    "dataPoints" INTEGER DEFAULT 0,
    "apiVersion" TEXT,
    "icon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Platform Integration Events
CREATE TABLE IF NOT EXISTS "PlatformEvent" (
    "id" SERIAL PRIMARY KEY,
    "platformId" INTEGER NOT NULL REFERENCES "PlatformIntegration"("id") ON DELETE CASCADE,
    "eventName" TEXT NOT NULL,
    "eventData" JSONB NOT NULL DEFAULT '{}',
    "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'success', 'failed')),
    "responseTime" INTEGER,
    "errorMessage" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Conversion API Endpoints
CREATE TABLE IF NOT EXISTS "ConversionEndpoint" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "method" TEXT NOT NULL DEFAULT 'POST' CHECK ("method" IN ('GET', 'POST', 'PUT', 'DELETE')),
    "authentication" TEXT NOT NULL CHECK ("authentication" IN ('api_key', 'oauth', 'webhook')),
    "credentials" JSONB NOT NULL DEFAULT '{}',
    "events" JSONB NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'active' CHECK ("status" IN ('active', 'inactive', 'error')),
    "lastUsed" TIMESTAMP(3),
    "avgResponseTime" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Conversion Events
CREATE TABLE IF NOT EXISTS "ConversionEvent" (
    "id" SERIAL PRIMARY KEY,
    "endpointId" INTEGER NOT NULL REFERENCES "ConversionEndpoint"("id") ON DELETE CASCADE,
    "eventName" TEXT NOT NULL,
    "eventData" JSONB NOT NULL DEFAULT '{}',
    "value" DECIMAL(10,2),
    "currency" TEXT DEFAULT 'EUR',
    "userId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending' CHECK ("status" IN ('pending', 'success', 'failed')),
    "responseTime" INTEGER,
    "errorMessage" TEXT,
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- API Configurations (for secure credential storage)
CREATE TABLE IF NOT EXISTS "APIConfiguration" (
    "id" SERIAL PRIMARY KEY,
    "platform" TEXT NOT NULL UNIQUE,
    "clientId" TEXT,
    "clientSecret" TEXT, -- Encrypted
    "accessToken" TEXT, -- Encrypted
    "refreshToken" TEXT, -- Encrypted
    "webhookSecret" TEXT, -- Encrypted
    "additionalSettings" JSONB NOT NULL DEFAULT '{}',
    "testMode" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastUsed" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_event_fires_event_id" ON "EventFire"("eventId");
CREATE INDEX IF NOT EXISTS "idx_event_fires_timestamp" ON "EventFire"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_event_fires_user_session" ON "EventFire"("userId", "sessionId");

CREATE INDEX IF NOT EXISTS "idx_gtm_tags_container" ON "GTMTag"("containerId");
CREATE INDEX IF NOT EXISTS "idx_gtm_triggers_container" ON "GTMTrigger"("containerId");
CREATE INDEX IF NOT EXISTS "idx_gtm_variables_container" ON "GTMVariable"("containerId");

CREATE INDEX IF NOT EXISTS "idx_platform_events_platform" ON "PlatformEvent"("platformId");
CREATE INDEX IF NOT EXISTS "idx_platform_events_timestamp" ON "PlatformEvent"("timestamp");

CREATE INDEX IF NOT EXISTS "idx_conversion_events_endpoint" ON "ConversionEvent"("endpointId");
CREATE INDEX IF NOT EXISTS "idx_conversion_events_timestamp" ON "ConversionEvent"("timestamp");
CREATE INDEX IF NOT EXISTS "idx_conversion_events_status" ON "ConversionEvent"("status");

-- Sample data for testing (optional)
INSERT INTO "DataLayerEvent" ("eventName", "description", "parameters", "triggerCondition", "status") VALUES
('page_view_insights', 'Tracks page views with user context and UTM parameters', '{"user_id": "string", "page_url": "string", "utm_source": "string", "utm_medium": "string", "utm_campaign": "string", "timestamp": "datetime"}', 'On every page load', 'active'),
('form_step_insights', 'Tracks form progression and step completion', '{"user_id": "string", "step_number": "integer", "step_name": "string", "step_data": "object", "time_spent": "integer", "drop_off_point": "boolean"}', 'When user completes form step', 'active'),
('form_submission_insights', 'Tracks form submissions with conversion value', '{"user_id": "string", "form_data": "object", "new_submission": "boolean", "conversion_value": "float", "quote_value": "float"}', 'On form submission success', 'active')
ON CONFLICT ("eventName") DO NOTHING;