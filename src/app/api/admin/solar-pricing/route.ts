import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Get all pricing tiers
    const pricingTiers = await prisma.pricingTier.findMany({
      orderBy: { minKw: 'asc' }
    });

    // Get regional pricing
    const regionalPricing = await prisma.regionalPricing.findMany({
      orderBy: { region: 'asc' }
    });

    // Get calculator settings
    let calculatorSettings = await prisma.solarCalculatorSettings.findFirst();
    
    // If no calculator settings exist, create default ones
    if (!calculatorSettings) {
      calculatorSettings = await prisma.solarCalculatorSettings.create({
        data: {
          defaultSystemSize: 5.0,
          averageDailyUsage: 25.0,
          roofEfficiencyFactor: 0.85,
          degradationRate: 0.005,
          financingApr: 0.06,
          loanTermYears: 20,
          inflationRate: 0.03
        }
      });
    }

    // Transform data to match component interface
    const transformedPricingTiers = pricingTiers.map(tier => ({
      id: tier.id,
      name: tier.name,
      min_kw: tier.minKw,
      max_kw: tier.maxKw,
      price_per_watt: tier.pricePerWatt,
      installation_cost: tier.installationCost,
      inverter_cost: tier.inverterCost,
      battery_cost_per_kwh: tier.batteryCostPerKwh,
      maintenance_yearly: tier.maintenanceYearly,
      warranty_years: tier.warrantyYears,
      efficiency_rating: tier.efficiencyRating
    }));

    const transformedRegionalPricing = regionalPricing.map(region => ({
      region: region.region,
      electricity_rate: region.electricityRate,
      feed_in_tariff: region.feedInTariff,
      installation_rebate: region.installationRebate,
      sales_tax: region.salesTax
    }));

    const transformedCalculatorSettings = {
      default_system_size: calculatorSettings.defaultSystemSize,
      average_daily_usage: calculatorSettings.averageDailyUsage,
      roof_efficiency_factor: calculatorSettings.roofEfficiencyFactor,
      degradation_rate: calculatorSettings.degradationRate,
      financing_apr: calculatorSettings.financingApr,
      loan_term_years: calculatorSettings.loanTermYears,
      inflation_rate: calculatorSettings.inflationRate
    };

    return NextResponse.json({
      success: true,
      data: {
        pricingTiers: transformedPricingTiers,
        regionalPricing: transformedRegionalPricing,
        calculatorSettings: transformedCalculatorSettings
      }
    });
  } catch (error) {
    console.error('Get solar pricing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch solar pricing data'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, data, userId } = body;

    let result;

    switch (type) {
      case 'pricing_tier':
        if (data.id === 'new') {
          // Create new pricing tier
          result = await prisma.pricingTier.create({
            data: {
              name: data.name,
              minKw: data.min_kw,
              maxKw: data.max_kw,
              pricePerWatt: data.price_per_watt,
              installationCost: data.installation_cost,
              inverterCost: data.inverter_cost,
              batteryCostPerKwh: data.battery_cost_per_kwh,
              maintenanceYearly: data.maintenance_yearly,
              warrantyYears: data.warranty_years,
              efficiencyRating: data.efficiency_rating
            }
          });
        } else {
          // Update existing pricing tier
          result = await prisma.pricingTier.update({
            where: { id: data.id },
            data: {
              name: data.name,
              minKw: data.min_kw,
              maxKw: data.max_kw,
              pricePerWatt: data.price_per_watt,
              installationCost: data.installation_cost,
              inverterCost: data.inverter_cost,
              batteryCostPerKwh: data.battery_cost_per_kwh,
              maintenanceYearly: data.maintenance_yearly,
              warrantyYears: data.warranty_years,
              efficiencyRating: data.efficiency_rating
            }
          });
        }
        break;

      case 'regional_pricing':
        // Upsert regional pricing
        result = await prisma.regionalPricing.upsert({
          where: { region: data.region },
          update: {
            electricityRate: data.electricity_rate,
            feedInTariff: data.feed_in_tariff,
            installationRebate: data.installation_rebate,
            salesTax: data.sales_tax
          },
          create: {
            region: data.region,
            electricityRate: data.electricity_rate,
            feedInTariff: data.feed_in_tariff,
            installationRebate: data.installation_rebate,
            salesTax: data.sales_tax
          }
        });
        break;

      case 'calculator_settings':
        // Update calculator settings
        const existingSettings = await prisma.solarCalculatorSettings.findFirst();
        if (existingSettings) {
          result = await prisma.solarCalculatorSettings.update({
            where: { id: existingSettings.id },
            data: {
              defaultSystemSize: data.default_system_size,
              averageDailyUsage: data.average_daily_usage,
              roofEfficiencyFactor: data.roof_efficiency_factor,
              degradationRate: data.degradation_rate,
              financingApr: data.financing_apr,
              loanTermYears: data.loan_term_years,
              inflationRate: data.inflation_rate
            }
          });
        } else {
          result = await prisma.solarCalculatorSettings.create({
            data: {
              defaultSystemSize: data.default_system_size,
              averageDailyUsage: data.average_daily_usage,
              roofEfficiencyFactor: data.roof_efficiency_factor,
              degradationRate: data.degradation_rate,
              financingApr: data.financing_apr,
              loanTermYears: data.loan_term_years,
              inflationRate: data.inflation_rate
            }
          });
        }
        break;

      default:
        throw new Error(`Unknown update type: ${type}`);
    }

    // Log the activity
    if (userId) {
      await prisma.userActivity.create({
        data: {
          userId,
          action: 'update_solar_pricing',
          category: 'system',
          description: `Updated solar pricing: ${type}`,
          metadata: JSON.stringify({
            type,
            data,
            timestamp: new Date().toISOString()
          })
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `${type} updated successfully`,
      data: result
    });
  } catch (error) {
    console.error('Update solar pricing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to update solar pricing data'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const type = url.searchParams.get('type');

    if (!id || !type) {
      return NextResponse.json({
        success: false,
        error: 'Missing id or type parameter'
      }, { status: 400 });
    }

    let result;

    switch (type) {
      case 'pricing_tier':
        result = await prisma.pricingTier.delete({
          where: { id }
        });
        break;

      case 'regional_pricing':
        result = await prisma.regionalPricing.delete({
          where: { region: id }
        });
        break;

      default:
        throw new Error(`Unknown delete type: ${type}`);
    }

    return NextResponse.json({
      success: true,
      message: `${type} deleted successfully`,
      data: result
    });
  } catch (error) {
    console.error('Delete solar pricing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to delete solar pricing data'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}