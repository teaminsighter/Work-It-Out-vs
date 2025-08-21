import type { Questions } from '@/types';
import {
  Home,
  Car,
  Building2,
  ShieldQuestion,
  KeyRound,
  ShieldCheck,
  ShieldOff,
  MapPin,
  FileText,
  HeartHandshake,
  CircleDollarSign,
  User,
  Calendar,
  Contact,
  Landmark,
  Blocks,
  Phone,
  Mail,
  MessageSquare,
  Building,
  Wrench,
  Laptop,
  Hotel,
  BedDouble,
  Building as BuildingIcon,
  ChevronsUp,
  CarFront,
  Bike,
  Truck,
  Gem,
  CalendarClock,
  Briefcase
} from 'lucide-react';
import ContactForm from '@/components/quote/ContactForm';
import CoverageRecommendationStep from '@/components/quote/CoverageRecommendationStep';

export const TOTAL_STEPS_ESTIMATE = 12;

export const ALL_QUESTIONS: Questions = {
  'start': {
    id: 'start',
    question: "Welcome to QuoteFlow",
    Icon: Home,
    component: () => null, // Special case handled by WelcomeStep
  },
  'insurance-type': {
    id: 'insurance-type',
    question: "What type of insurance do you need?",
    description: "Select the primary type of coverage you're looking for.",
    Icon: ShieldQuestion,
    getNextStepId: (value) => {
      switch (value) {
        case 'home':
          return 'home-own-rent';
        case 'vehicle':
          return 'vehicle-type';
        case 'business':
            return 'business-type';
        case 'landlord':
            return 'landlord-property-type';
        case 'multiple':
            return 'multi-product-selection';
        default:
          return 'contact-details';
      }
    },
    options: [
      { value: 'home', label: 'Home & Contents', icon: Home, nextStepId: '' },
      { value: 'vehicle', label: 'Vehicle', icon: Car, nextStepId: '' },
      { value: 'business', label: 'Business', icon: Briefcase, nextStepId: '' },
      { value: 'landlord', label: 'Landlord', icon: Building, nextStepId: '' },
      { value: 'multiple', label: 'Multiple Types', icon: Blocks, nextStepId: '' },
    ],
  },
  'home-own-rent': {
    id: 'home-own-rent',
    question: 'Do you own or rent your home?',
    Icon: Home,
    getNextStepId: (value) => (value === 'own' ? 'home-property-type' : 'security-systems'),
    options: [
      { value: 'own', label: 'Own', nextStepId: '' },
      { value: 'rent', label: 'Rent', nextStepId: '' },
    ],
  },
  'home-property-type': {
    id: 'home-property-type',
    question: 'What type of property is it?',
    Icon: BuildingIcon,
    getNextStepId: () => 'security-systems', // Simplified flow
    options: [
      { value: 'house', label: 'House', nextStepId: '' },
      { value: 'apartment', label: 'Apartment/Unit', nextStepId: '' },
      { value: 'townhouse', label: 'Townhouse', nextStepId: '' },
    ],
  },
  'vehicle-type': {
    id: 'vehicle-type',
    question: 'What type of vehicle do you need to insure?',
    Icon: Car,
    getNextStepId: () => 'vehicle-year',
    options: [
      { value: 'car', label: 'Car', icon: CarFront, nextStepId: '' },
      { value: 'motorcycle', label: 'Motorcycle', icon: Bike, nextStepId: '' },
      { value: 'commercial', label: 'Commercial Vehicle', icon: Truck, nextStepId: '' },
    ],
  },
  'vehicle-year': {
    id: 'vehicle-year',
    question: 'What year is your car?',
    Icon: Calendar,
    getNextStepId: () => 'security-systems',
    options: [
      { value: '2020-newer', label: '2020 or newer', nextStepId: '' },
      { value: '2015-2019', label: '2015 - 2019', nextStepId: '' },
      { value: '2010-2014', label: '2010 - 2014', nextStepId: '' },
      { value: 'pre-2010', label: 'Pre-2010', nextStepId: '' },
    ],
  },
  'business-type': {
    id: 'business-type',
    question: 'What type of business do you operate?',
    Icon: Briefcase,
    getNextStepId: () => 'location',
    options: [
      { value: 'retail', label: 'Retail', icon: Hotel, nextStepId: '' },
      { value: 'professional', label: 'Professional Services', icon: User, nextStepId: '' },
      { value: 'trades', label: 'Trades/Construction', icon: Wrench, nextStepId: '' },
      { value: 'online', label: 'Online/Home Business', icon: Laptop, nextStepId: '' },
    ],
  },
  'landlord-property-type': {
      id: 'landlord-property-type',
      question: 'What type of property do you rent out?',
      Icon: Building,
      getNextStepId: () => 'security-systems',
      options: [
          { value: 'house', label: 'House', nextStepId: '' },
          { value: 'apartment', label: 'Apartment/Unit', nextStepId: '' },
          { value: 'multi-unit', label: 'Multi-unit building', nextStepId: '' },
      ]
  },
  'multi-product-selection': {
      id: 'multi-product-selection',
      question: 'Which products are you interested in?',
      description: 'Select all that apply (we\'ll start with one).',
      Icon: Blocks,
      getNextStepId: () => 'home-own-rent', // Start with home flow for simplicity
      options: [
        { value: 'home_vehicle', label: 'Home & Vehicle', nextStepId: '' },
        { value: 'home_business', label: 'Home & Business', nextStepId: '' },
        { value: 'all', label: 'All of the above!', nextStepId: '' },
      ]
  },
  'security-systems': {
    id: 'security-systems',
    question: 'Do you have any security systems installed?',
    Icon: KeyRound,
    getNextStepId: () => 'location',
    options: [
      { value: 'yes', label: 'Yes', icon: ShieldCheck, nextStepId: '' },
      { value: 'no', label: 'No', icon: ShieldOff, nextStepId: '' },
      { value: 'planning', label: 'Planning to install', icon: KeyRound, nextStepId: '' },
    ],
  },
  'location': {
    id: 'location',
    question: "What's your suburb or postcode?",
    Icon: MapPin,
    component: ContactForm, // Use a form for this
    fields: ['postcode'],
    nextStepId: 'previous-claims'
  },
  'previous-claims': {
    id: 'previous-claims',
    question: 'Have you made any claims in the last 5 years?',
    Icon: FileText,
    getNextStepId: () => 'coverage-level',
    options: [
      { value: 'yes', label: 'Yes', nextStepId: '' },
      { value: 'no', label: 'No', nextStepId: '' },
    ],
  },
  'coverage-level': {
    id: 'coverage-level',
    question: 'What level of coverage do you prefer?',
    Icon: HeartHandshake,
    getNextStepId: (value) => (value === 'not-sure' ? 'coverage-recommendation' : 'excess-amount'),
    options: [
      { value: 'basic', label: 'Basic/Third Party', nextStepId: '' },
      { value: 'comprehensive', label: 'Comprehensive', nextStepId: '' },
      { value: 'premium', label: 'Premium/Full Cover', nextStepId: '' },
      { value: 'not-sure', label: 'Not Sure?', icon: ShieldQuestion, nextStepId: '' },
    ],
  },
  'coverage-recommendation': {
    id: 'coverage-recommendation',
    question: 'Getting your recommendation...',
    Icon: ShieldQuestion,
    component: CoverageRecommendationStep,
    nextStepId: 'excess-amount'
  },
  'excess-amount': {
    id: 'excess-amount',
    question: "What's your preferred excess amount?",
    Icon: CircleDollarSign,
    getNextStepId: () => 'age-group',
    options: [
      { value: '250-500', label: '$250 - $500', nextStepId: '' },
      { value: '500-1000', label: '$500 - $1000', nextStepId: '' },
      { value: '1000+', label: '$1000+', nextStepId: '' },
      { value: 'as-low-as-possible', label: 'As low as possible', nextStepId: '' },
    ],
  },
  'age-group': {
    id: 'age-group',
    question: "What's your age group?",
    Icon: User,
    getNextStepId: () => 'coverage-start-date',
    options: [
      { value: '18-25', label: '18 - 25', nextStepId: '' },
      { value: '26-40', label: '26 - 40', nextStepId: '' },
      { value: '41-60', label: '41 - 60', nextStepId: '' },
      { value: '60+', label: '60+', nextStepId: '' },
    ],
  },
  'coverage-start-date': {
    id: 'coverage-start-date',
    question: 'When do you need coverage to start?',
    Icon: CalendarClock,
    getNextStepId: () => 'contact-details',
    options: [
      { value: 'immediately', label: 'Immediately', nextStepId: '' },
      { value: 'within-1-month', label: 'Within 1 month', nextStepId: '' },
      { value: '1-3-months', label: '1 - 3 months', nextStepId: '' },
      { value: 'researching', label: 'Just researching', nextStepId: '' },
    ],
  },
  'contact-details': {
    id: 'contact-details',
    question: 'How can we send your quote?',
    description: "Please provide your contact information to receive your personalized quote.",
    Icon: Contact,
    component: ContactForm,
    fields: ['name', 'email', 'phone'],
    nextStepId: 'preferred-contact'
  },
  'preferred-contact': {
    id: 'preferred-contact',
    question: 'How would you prefer to be contacted?',
    Icon: ShieldQuestion,
    getNextStepId: () => 'results',
    options: [
      { value: 'phone', label: 'Phone', icon: Phone, nextStepId: '' },
      { value: 'email', label: 'Email', icon: Mail, nextStepId: '' },
      { value: 'sms', label: 'Text/SMS', icon: MessageSquare, nextStepId: '' },
      { value: 'no-contact', label: 'No contact, just show my quote', nextStepId: '' },
    ],
  },
  'results': {
    id: 'results',
    question: 'Your Quote Results',
    Icon: Gem,
    component: () => null, // Special case for ResultsPage
  },
};
