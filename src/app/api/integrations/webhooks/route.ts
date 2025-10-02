import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    switch (type) {
      case 'webhooks':
        // Get all webhooks from database
        const webhooks = await prisma.webhook.findMany({
          orderBy: { createdAt: 'desc' }
        });
        
        // Parse JSON strings for client
        const parsedWebhooks = webhooks.map(webhook => ({
          ...webhook,
          events: JSON.parse(webhook.events),
          headers: JSON.parse(webhook.headers)
        }));
        
        return NextResponse.json(parsedWebhooks);

      case 'logs':
        const webhookId = searchParams.get('webhookId');
        const limit = parseInt(searchParams.get('limit') || '50');
        
        // Get webhook logs
        const logs = await prisma.webhookLog.findMany({
          where: webhookId ? { webhookId } : undefined,
          orderBy: { createdAt: 'desc' },
          take: limit
        });

        // Parse JSON strings for client
        const parsedLogs = logs.map(log => ({
          ...log,
          payload: JSON.parse(log.payload)
        }));

        return NextResponse.json(parsedLogs);

      case 'stats':
        // Get webhook statistics
        const totalWebhooks = await prisma.webhook.count();
        const activeWebhooks = await prisma.webhook.count({ where: { isActive: true } });
        
        const logStats = await prisma.webhookLog.groupBy({
          by: ['status'],
          _count: {
            status: true
          }
        });
        
        const totalRequests = logStats.reduce((sum, stat) => sum + stat._count.status, 0);
        const successCount = logStats.find(stat => stat.status === 'success')?._count.status || 0;
        const successRate = totalRequests > 0 ? (successCount / totalRequests) * 100 : 0;

        return NextResponse.json({
          total: totalWebhooks,
          active: activeWebhooks,
          totalRequests,
          successRate
        });

      default:
        return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
    }
  } catch (error) {
    console.error('Webhook API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type } = body;

    switch (type) {
      case 'create':
        const { name, url, events, headers, isActive } = body;
        
        // Create new webhook
        const newWebhook = await prisma.webhook.create({
          data: {
            name,
            url,
            method: 'POST',
            events: JSON.stringify(events || ['lead.created']),
            headers: JSON.stringify(headers || {}),
            isActive: isActive !== false,
            successCount: 0,
            failureCount: 0
          }
        });

        // Parse JSON for response
        const parsedWebhook = {
          ...newWebhook,
          events: JSON.parse(newWebhook.events),
          headers: JSON.parse(newWebhook.headers)
        };

        return NextResponse.json(parsedWebhook);

      case 'update':
        const { id, ...updateData } = body;
        
        // Prepare update data with JSON stringification
        const updateDataPrepared = { ...updateData };
        if (updateData.events) {
          updateDataPrepared.events = JSON.stringify(updateData.events);
        }
        if (updateData.headers) {
          updateDataPrepared.headers = JSON.stringify(updateData.headers);
        }
        
        // Update webhook
        const updatedWebhook = await prisma.webhook.update({
          where: { id },
          data: {
            ...updateDataPrepared,
            updatedAt: new Date()
          }
        });

        // Parse JSON for response
        const parsedUpdatedWebhook = {
          ...updatedWebhook,
          events: JSON.parse(updatedWebhook.events),
          headers: JSON.parse(updatedWebhook.headers)
        };

        return NextResponse.json(parsedUpdatedWebhook);

      case 'delete':
        const { id: deleteId } = body;
        
        // Delete webhook and its logs
        await prisma.webhookLog.deleteMany({ where: { webhookId: deleteId } });
        await prisma.webhook.delete({ where: { id: deleteId } });

        return NextResponse.json({ success: true });

      case 'test':
        const { webhookId, testUrl } = body;
        
        try {
          const testPayload = {
            leadId: 'test_lead_' + Date.now(),
            timestamp: new Date().toISOString(),
            source: 'webhook_test',
            contact: {
              firstName: 'Test',
              lastName: 'User',
              email: 'test@example.com',
              phone: '+64212345678'
            },
            quoteDetails: {
              insuranceType: 'Test Insurance',
              coverageAmount: 100000,
              annualPremium: 1200,
              ageGroup: '25-34',
              healthStatus: 'Non-smoker',
              address: 'Test Address, Auckland, New Zealand'
            }
          };

          const startTime = Date.now();
          const response = await fetch(testUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'WorkItOut-Webhook-Test/1.0'
            },
            body: JSON.stringify(testPayload),
            signal: AbortSignal.timeout(10000) // 10 second timeout
          });
          
          const responseTime = Date.now() - startTime;
          const success = response.ok;

          // Log the test result
          if (webhookId) {
            await prisma.webhookLog.create({
              data: {
                webhookId,
                event: 'webhook.test',
                status: success ? 'success' : 'failure',
                statusCode: response.status,
                responseTime,
                payload: JSON.stringify(testPayload),
                response: success ? await response.text() : undefined,
                error: success ? undefined : `HTTP ${response.status}: ${response.statusText}`
              }
            });
          }

          return NextResponse.json({
            success,
            statusCode: response.status,
            responseTime,
            message: success ? 'Test successful' : `Test failed: HTTP ${response.status}`
          });

        } catch (error: any) {
          // Log the test failure
          if (webhookId) {
            await prisma.webhookLog.create({
              data: {
                webhookId,
                event: 'webhook.test',
                status: 'failure',
                statusCode: 0,
                responseTime: 0,
                payload: JSON.stringify({}),
                error: error.message || 'Test failed'
              }
            });
          }

          return NextResponse.json({
            success: false,
            statusCode: 0,
            responseTime: 0,
            message: 'Connection failed: ' + (error.message || 'Unknown error')
          });
        }

      case 'trigger':
        const { eventType, payload } = body;
        
        // Get all active webhooks that listen to this event
        const activeWebhooks = await prisma.webhook.findMany({
          where: {
            isActive: true
          }
        });

        // Filter webhooks that have the event type
        const matchingWebhooks = activeWebhooks.filter(webhook => {
          const events = JSON.parse(webhook.events);
          return events.includes(eventType);
        });

        // Trigger all matching webhooks
        const results = await Promise.allSettled(
          matchingWebhooks.map(async (webhook) => {
            try {
              const startTime = Date.now();
              const response = await fetch(webhook.url, {
                method: webhook.method,
                headers: {
                  'Content-Type': 'application/json',
                  ...JSON.parse(webhook.headers),
                  'User-Agent': 'WorkItOut-Webhook/1.0'
                },
                body: JSON.stringify(payload),
                signal: AbortSignal.timeout(10000)
              });
              
              const responseTime = Date.now() - startTime;
              const success = response.ok;

              // Log the result
              await prisma.webhookLog.create({
                data: {
                  webhookId: webhook.id,
                  event: eventType,
                  status: success ? 'success' : 'failure',
                  statusCode: response.status,
                  responseTime,
                  payload: JSON.stringify(payload),
                  response: success ? await response.text() : undefined,
                  error: success ? undefined : `HTTP ${response.status}: ${response.statusText}`
                }
              });

              // Update webhook counters
              if (success) {
                await prisma.webhook.update({
                  where: { id: webhook.id },
                  data: {
                    successCount: { increment: 1 },
                    lastTriggered: new Date()
                  }
                });
              } else {
                await prisma.webhook.update({
                  where: { id: webhook.id },
                  data: { failureCount: { increment: 1 } }
                });
              }

              return { webhookId: webhook.id, success };
            } catch (error: any) {
              // Log the error
              await prisma.webhookLog.create({
                data: {
                  webhookId: webhook.id,
                  event: eventType,
                  status: 'failure',
                  statusCode: 0,
                  responseTime: 0,
                  payload: JSON.stringify(payload),
                  error: error.message || 'Connection failed'
                }
              });

              await prisma.webhook.update({
                where: { id: webhook.id },
                data: { failureCount: { increment: 1 } }
              });

              return { webhookId: webhook.id, success: false, error: error.message };
            }
          })
        );

        return NextResponse.json({ 
          triggered: results.length,
          results: results.map(r => r.status === 'fulfilled' ? r.value : { error: 'Promise rejected' })
        });

      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Webhook API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}