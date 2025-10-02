'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface PricingTier {
  id: string;
  name: string;
  min_kw: number;
  max_kw: number;
  price_per_watt: number;
  installation_cost: number;
  inverter_cost: number;
  battery_cost_per_kwh?: number;
  maintenance_yearly: number;
  warranty_years: number;
  efficiency_rating: number;
}

interface RegionalPricing {
  region: string;
  electricity_rate: number;
  feed_in_tariff: number;
  installation_rebate: number;
  sales_tax: number;
}

interface CalculatorSettings {
  default_system_size: number;
  average_daily_usage: number;
  roof_efficiency_factor: number;
  degradation_rate: number;
  financing_apr: number;
  loan_term_years: number;
  inflation_rate: number;
}

const SolarPricing = () => {
  const [activeTab, setActiveTab] = useState<'pricing' | 'regional' | 'calculator'>('pricing');
  
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [regionalPricing, setRegionalPricing] = useState<RegionalPricing[]>([]);

  const [calculatorSettings, setCalculatorSettings] = useState<CalculatorSettings>({
    default_system_size: 6.5,
    average_daily_usage: 25,
    roof_efficiency_factor: 0.85,
    degradation_rate: 0.005,
    financing_apr: 0.045,
    loan_term_years: 15,
    inflation_rate: 0.025
  });

  const [savedSettings, setSavedSettings] = useState<{[key: string]: boolean}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPricingData();
  }, []);

  const loadPricingData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/solar-pricing');
      const data = await response.json();
      
      if (data.success) {
        setPricingTiers(data.data.pricingTiers);
        setRegionalPricing(data.data.regionalPricing);
        setCalculatorSettings(data.data.calculatorSettings);
      } else {
        console.error('Failed to load solar pricing:', data.error);
      }
    } catch (error) {
      console.error('Error loading solar pricing:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (category: string) => {
    try {
      switch (category) {
        case 'pricing':
          // Save all pricing tiers
          for (const tier of pricingTiers) {
            await fetch('/api/admin/solar-pricing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'pricing_tier',
                data: tier,
                userId: 'admin'
              })
            });
          }
          break;
        case 'regional':
          // Save all regional pricing
          for (const region of regionalPricing) {
            await fetch('/api/admin/solar-pricing', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                type: 'regional_pricing',
                data: region,
                userId: 'admin'
              })
            });
          }
          break;
        case 'calculator':
          await fetch('/api/admin/solar-pricing', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              type: 'calculator_settings',
              data: calculatorSettings,
              userId: 'admin'
            })
          });
          break;
      }
      
      setSavedSettings(prev => ({ ...prev, [category]: true }));
      setTimeout(() => {
        setSavedSettings(prev => ({ ...prev, [category]: false }));
      }, 3000);
    } catch (error) {
      console.error('Failed to save pricing settings:', error);
      alert('Failed to save settings. Please try again.');
    }
  };

  const updatePricingTier = (id: string, field: keyof PricingTier, value: string | number) => {
    setPricingTiers(prev => prev.map(tier => 
      tier.id === id ? { ...tier, [field]: value } : tier
    ));
  };

  const updateRegionalPricing = (index: number, field: keyof RegionalPricing, value: string | number) => {
    setRegionalPricing(prev => prev.map((region, i) => 
      i === index ? { ...region, [field]: value } : region
    ));
  };

  const updateCalculatorSettings = (field: keyof CalculatorSettings, value: number) => {
    setCalculatorSettings(prev => ({ ...prev, [field]: value }));
  };

  const addPricingTier = () => {
    const newTier: PricingTier = {
      id: Date.now().toString(),
      name: 'New Tier',
      min_kw: 0,
      max_kw: 10,
      price_per_watt: 2.50,
      installation_cost: 2000,
      inverter_cost: 1000,
      battery_cost_per_kwh: 700,
      maintenance_yearly: 100,
      warranty_years: 20,
      efficiency_rating: 20.0
    };
    setPricingTiers(prev => [...prev, newTier]);
  };

  const removePricingTier = (id: string) => {
    setPricingTiers(prev => prev.filter(tier => tier.id !== id));
  };

  const tabs = [
    { id: 'pricing', name: 'Solar Pricing Tiers', icon: '💰' },
    { id: 'regional', name: 'Regional Pricing', icon: '🗺️' },
    { id: 'calculator', name: 'Calculator Settings', icon: '⚙️' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading solar pricing data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Solar Pricing Management</h1>
        <p className="text-gray-600">Configure pricing tiers, regional settings, and calculator parameters</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-white text-orange-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{tab.icon}</span>
            {tab.name}
          </motion.button>
        ))}
      </div>

      {/* Pricing Tiers Tab */}
      {activeTab === 'pricing' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Solar System Pricing Tiers</h3>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={addPricingTier}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
            >
              + Add Tier
            </motion.button>
          </div>

          <div className="space-y-4">
            {pricingTiers.map((tier) => (
              <div key={tier.id} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <input
                    type="text"
                    value={tier.name}
                    onChange={(e) => updatePricingTier(tier.id, 'name', e.target.value)}
                    className="text-lg font-medium bg-transparent border-none focus:outline-none focus:ring-2 focus:ring-orange-500 rounded px-2"
                  />
                  <button
                    onClick={() => removePricingTier(tier.id)}
                    className="text-red-600 hover:text-red-800 transition-colors"
                  >
                    🗑️ Remove
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Min kW</label>
                    <input
                      type="number"
                      value={tier.min_kw}
                      onChange={(e) => updatePricingTier(tier.id, 'min_kw', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max kW</label>
                    <input
                      type="number"
                      value={tier.max_kw}
                      onChange={(e) => updatePricingTier(tier.id, 'max_kw', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price/Watt (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={tier.price_per_watt}
                      onChange={(e) => updatePricingTier(tier.id, 'price_per_watt', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Installation Cost (€)</label>
                    <input
                      type="number"
                      value={tier.installation_cost}
                      onChange={(e) => updatePricingTier(tier.id, 'installation_cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Inverter Cost (€)</label>
                    <input
                      type="number"
                      value={tier.inverter_cost}
                      onChange={(e) => updatePricingTier(tier.id, 'inverter_cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Battery Cost/kWh (€)</label>
                    <input
                      type="number"
                      value={tier.battery_cost_per_kwh || 0}
                      onChange={(e) => updatePricingTier(tier.id, 'battery_cost_per_kwh', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Maintenance (€)</label>
                    <input
                      type="number"
                      value={tier.maintenance_yearly}
                      onChange={(e) => updatePricingTier(tier.id, 'maintenance_yearly', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Efficiency Rating (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={tier.efficiency_rating}
                      onChange={(e) => updatePricingTier(tier.id, 'efficiency_rating', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Regional Pricing Tab */}
      {activeTab === 'regional' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900">Regional Pricing & Incentives</h3>
          
          <div className="space-y-4">
            {regionalPricing.map((region, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region Name</label>
                    <input
                      type="text"
                      value={region.region}
                      onChange={(e) => updateRegionalPricing(index, 'region', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Electricity Rate (€/kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={region.electricity_rate}
                      onChange={(e) => updateRegionalPricing(index, 'electricity_rate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Feed-in Tariff (€/kWh)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={region.feed_in_tariff}
                      onChange={(e) => updateRegionalPricing(index, 'feed_in_tariff', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Installation Rebate (€)</label>
                    <input
                      type="number"
                      value={region.installation_rebate}
                      onChange={(e) => updateRegionalPricing(index, 'installation_rebate', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Sales Tax Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={region.sales_tax}
                      onChange={(e) => updateRegionalPricing(index, 'sales_tax', parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Calculator Settings Tab */}
      {activeTab === 'calculator' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-bold text-gray-900">Calculator Default Settings</h3>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Default System Size (kW)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calculatorSettings.default_system_size}
                  onChange={(e) => updateCalculatorSettings('default_system_size', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Average Daily Usage (kWh)</label>
                <input
                  type="number"
                  step="0.1"
                  value={calculatorSettings.average_daily_usage}
                  onChange={(e) => updateCalculatorSettings('average_daily_usage', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Roof Efficiency Factor</label>
                <input
                  type="number"
                  step="0.01"
                  value={calculatorSettings.roof_efficiency_factor}
                  onChange={(e) => updateCalculatorSettings('roof_efficiency_factor', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">0.85 = 85% efficiency due to shading, orientation, etc.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Annual Degradation Rate</label>
                <input
                  type="number"
                  step="0.001"
                  value={calculatorSettings.degradation_rate}
                  onChange={(e) => updateCalculatorSettings('degradation_rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">0.005 = 0.5% per year</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Financing APR</label>
                <input
                  type="number"
                  step="0.001"
                  value={calculatorSettings.financing_apr}
                  onChange={(e) => updateCalculatorSettings('financing_apr', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">0.045 = 4.5% annual interest rate</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Loan Term (years)</label>
                <input
                  type="number"
                  value={calculatorSettings.loan_term_years}
                  onChange={(e) => updateCalculatorSettings('loan_term_years', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Inflation Rate</label>
                <input
                  type="number"
                  step="0.001"
                  value={calculatorSettings.inflation_rate}
                  onChange={(e) => updateCalculatorSettings('inflation_rate', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">0.025 = 2.5% annual inflation for electricity prices</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Save Button */}
      <div className="flex gap-3 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => saveSettings(activeTab)}
          className={`px-6 py-2 rounded-lg transition-colors ${
            savedSettings[activeTab]
              ? 'bg-green-600 text-white'
              : 'bg-orange-600 text-white hover:bg-orange-700'
          }`}
        >
          {savedSettings[activeTab] ? '✅ Saved' : '💾 Save Settings'}
        </motion.button>
      </div>
    </div>
  );
};

export default SolarPricing;