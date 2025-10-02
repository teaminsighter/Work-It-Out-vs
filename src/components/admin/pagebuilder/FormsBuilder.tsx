'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface FormField {
  id: string;
  type: 'text' | 'email' | 'phone' | 'select' | 'textarea' | 'checkbox' | 'radio' | 'number';
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  validation?: {
    min_length?: number;
    max_length?: number;
    pattern?: string;
  };
}

interface FormStep {
  id: string;
  name: string;
  description: string;
  fields: FormField[];
  conditional_logic?: {
    show_if: string;
    field_id: string;
    value: string;
  };
}

interface Form {
  id: string;
  name: string;
  description: string;
  steps: FormStep[];
  settings: {
    multi_step: boolean;
    progress_bar: boolean;
    auto_save: boolean;
    redirect_url?: string;
    email_notifications: boolean;
  };
  analytics: {
    views: number;
    starts: number;
    completions: number;
    abandonment_rate: number;
  };
  created_at: string;
  status: 'draft' | 'published' | 'archived';
}

const FormsBuilder = () => {
  const [activeView, setActiveView] = useState<'list' | 'builder' | 'analytics'>('list');
  const [selectedForm, setSelectedForm] = useState<Form | null>(null);
  const [draggedField, setDraggedField] = useState<string | null>(null);

  // Mock data for existing forms
  const [forms] = useState<Form[]>([
    {
      id: '1',
      name: 'Solar Calculator Form',
      description: 'Multi-step solar quote request form with real-time calculations',
      steps: [
        {
          id: 'step1',
          name: 'Address Information',
          description: 'Capture user location for solar analysis',
          fields: [
            {
              id: 'address',
              type: 'text',
              label: 'Home Address',
              placeholder: 'Enter your full address',
              required: true
            }
          ]
        },
        {
          id: 'step2',
          name: 'Energy Usage',
          description: 'Understand energy consumption patterns',
          fields: [
            {
              id: 'monthly_bill',
              type: 'number',
              label: 'Monthly Electricity Bill',
              placeholder: '€150',
              required: true
            },
            {
              id: 'home_size',
              type: 'select',
              label: 'Home Size',
              required: true,
              options: ['1-2 Bedrooms', '3-4 Bedrooms', '5+ Bedrooms']
            }
          ]
        }
      ],
      settings: {
        multi_step: true,
        progress_bar: true,
        auto_save: true,
        redirect_url: '/thank-you',
        email_notifications: true
      },
      analytics: {
        views: 15420,
        starts: 12567,
        completions: 5234,
        abandonment_rate: 18.4
      },
      created_at: '2024-09-20T10:00:00Z',
      status: 'published'
    },
    {
      id: '2',
      name: 'Contact Form',
      description: 'Simple contact form for general inquiries',
      steps: [
        {
          id: 'step1',
          name: 'Contact Details',
          description: 'Basic contact information',
          fields: [
            {
              id: 'name',
              type: 'text',
              label: 'Full Name',
              required: true
            },
            {
              id: 'email',
              type: 'email',
              label: 'Email Address',
              required: true
            },
            {
              id: 'phone',
              type: 'phone',
              label: 'Phone Number',
              required: false
            },
            {
              id: 'message',
              type: 'textarea',
              label: 'Message',
              placeholder: 'How can we help you?',
              required: true
            }
          ]
        }
      ],
      settings: {
        multi_step: false,
        progress_bar: false,
        auto_save: false,
        email_notifications: true
      },
      analytics: {
        views: 8934,
        starts: 7234,
        completions: 6789,
        abandonment_rate: 6.2
      },
      created_at: '2024-09-18T09:15:00Z',
      status: 'published'
    }
  ]);

  const availableFields = [
    { type: 'text', label: '📝 Text Input', icon: '📝' },
    { type: 'email', label: '✉️ Email', icon: '✉️' },
    { type: 'phone', label: '📞 Phone', icon: '📞' },
    { type: 'number', label: '🔢 Number', icon: '🔢' },
    { type: 'select', label: '📋 Dropdown', icon: '📋' },
    { type: 'textarea', label: '📄 Text Area', icon: '📄' },
    { type: 'checkbox', label: '☑️ Checkbox', icon: '☑️' },
    { type: 'radio', label: '🔘 Radio Button', icon: '🔘' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const handleFormEdit = (form: Form) => {
    setSelectedForm(form);
    setActiveView('builder');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms Builder</h1>
          <p className="text-gray-600">Create multi-step forms with advanced logic and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            📊 Form Analytics
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveView('builder')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            + Create New Form
          </motion.button>
        </div>
      </div>

      {/* View Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        {[
          { id: 'list', name: 'My Forms', icon: '📝' },
          { id: 'builder', name: 'Form Builder', icon: '🔧' },
          { id: 'analytics', name: 'Analytics', icon: '📊' }
        ].map((view) => (
          <motion.button
            key={view.id}
            onClick={() => setActiveView(view.id as any)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
              activeView === view.id
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span>{view.icon}</span>
            {view.name}
          </motion.button>
        ))}
      </div>

      {/* Forms List View */}
      {activeView === 'list' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {forms.map((form, index) => (
              <motion.div
                key={form.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                {/* Form Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{form.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(form.status)}`}>
                        {form.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{form.description}</p>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-1 text-gray-400 hover:text-blue-600"
                      title="Preview Form"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleFormEdit(form)}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Edit Form"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </motion.button>
                  </div>
                </div>

                {/* Form Stats */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="text-center">
                    <div className="text-lg font-bold text-gray-900">{form.analytics.views.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Views</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">{form.analytics.starts.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Starts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-600">{form.analytics.completions.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Completions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-red-600">{form.analytics.abandonment_rate}%</div>
                    <div className="text-xs text-gray-500">Drop-off</div>
                  </div>
                </div>

                {/* Form Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.settings.multi_step && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      Multi-step ({form.steps.length} steps)
                    </span>
                  )}
                  {form.settings.progress_bar && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                      Progress Bar
                    </span>
                  )}
                  {form.settings.auto_save && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                      Auto-save
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleFormEdit(form)}
                    className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  >
                    Edit Form
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="View Analytics"
                  >
                    📊
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                    title="Duplicate"
                  >
                    📄
                  </motion.button>
                </div>

                <div className="mt-3 text-xs text-gray-400">
                  Created: {formatDate(form.created_at)}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Form Builder View */}
      {activeView === 'builder' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          {/* Builder Header */}
          <div className="border-b border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedForm ? `Edit: ${selectedForm.name}` : 'Create New Form'}
                </h2>
                <p className="text-gray-600">Drag and drop fields to build your form</p>
              </div>
              
              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  👀 Preview
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  💾 Save Form
                </motion.button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 p-6">
            {/* Field Library */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Form Fields</h3>
              <div className="space-y-2">
                {availableFields.map((field, index) => (
                  <motion.div
                    key={field.type}
                    draggable
                    onDragStart={() => setDraggedField(field.type)}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 cursor-grab active:cursor-grabbing hover:border-green-300 hover:bg-green-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{field.icon}</span>
                      <span className="text-sm font-medium text-gray-700">{field.label.replace(/^.* /, '')}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Form Builder Canvas */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">Form Structure</h3>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  + Add Step
                </motion.button>
              </div>
              
              {/* Form Steps */}
              <div className="space-y-4">
                {selectedForm ? selectedForm.steps.map((step, stepIndex) => (
                  <div key={step.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium text-gray-900">Step {stepIndex + 1}: {step.name}</h4>
                        <p className="text-sm text-gray-600">{step.description}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-gray-400 hover:text-blue-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </motion.button>
                      </div>
                    </div>
                    
                    {/* Fields in Step */}
                    <div className="space-y-2">
                      {step.fields.map((field, fieldIndex) => (
                        <motion.div
                          key={field.id}
                          className="p-3 bg-gray-50 rounded border border-gray-200 hover:border-green-300 transition-colors"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium text-gray-700">{field.label}</div>
                              <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                                {field.type}
                              </span>
                              {field.required && (
                                <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">
                                  Required
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="p-1 text-gray-400 hover:text-blue-600"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                              </motion.button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                      
                      {/* Drop Zone */}
                      <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-green-300 hover:bg-green-50 transition-colors">
                        <div className="text-gray-400">
                          Drop fields here or click to add
                        </div>
                      </div>
                    </div>
                  </div>
                )) : (
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-12 text-center">
                    <div className="text-6xl text-gray-300 mb-4">📝</div>
                    <div className="text-lg font-medium text-gray-600 mb-2">Start Building Your Form</div>
                    <div className="text-sm text-gray-500">
                      Drag fields from the left panel or click "Add Step" to get started
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Settings Panel */}
            <div className="space-y-4">
              <h3 className="font-medium text-gray-900">Form Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Form Name</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="Enter form name"
                    defaultValue={selectedForm?.name}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    rows={3}
                    placeholder="Form description"
                    defaultValue={selectedForm?.description}
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Multi-step Form</label>
                    <input type="checkbox" className="rounded" defaultChecked={selectedForm?.settings.multi_step} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Progress Bar</label>
                    <input type="checkbox" className="rounded" defaultChecked={selectedForm?.settings.progress_bar} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Auto-save Progress</label>
                    <input type="checkbox" className="rounded" defaultChecked={selectedForm?.settings.auto_save} />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700">Email Notifications</label>
                    <input type="checkbox" className="rounded" defaultChecked={selectedForm?.settings.email_notifications} />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Redirect URL</label>
                  <input 
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500" 
                    placeholder="/thank-you"
                    defaultValue={selectedForm?.settings.redirect_url}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Analytics View */}
      {activeView === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Total Forms', value: '12', change: '+2 this month', color: 'blue' },
              { title: 'Total Submissions', value: '15.2K', change: '+18.2% vs last month', color: 'green' },
              { title: 'Avg Completion Rate', value: '74.3%', change: '+3.1% improvement', color: 'purple' },
              { title: 'Best Performer', value: 'Solar Calc', change: '81.6% completion', color: 'yellow' }
            ].map((metric, index) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className={`w-12 h-12 bg-${metric.color}-500 rounded-lg flex items-center justify-center mb-4`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700 mb-1">{metric.title}</div>
                <div className="text-xs text-gray-500">{metric.change}</div>
              </motion.div>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Form Performance Analytics</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl text-gray-400 mb-2">📊</div>
                <div className="text-gray-600">Analytics Chart Placeholder</div>
                <div className="text-sm text-gray-500 mt-1">
                  Form completion rates, abandonment points, and conversion funnels
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FormsBuilder;