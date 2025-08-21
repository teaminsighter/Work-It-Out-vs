import type { Question, Questions } from '@/types';
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
      { value: 'home', label: 'Home & Contents', icon: Home },
      { value: 'vehicle', label: 'Vehicle', icon: Car },
      { value: 'business', label: 'Business', icon: Briefcase },
      { value: 'landlord', label: 'Landlord', icon: Building },
      { value: 'multiple', label: 'Multiple Types', icon: Blocks },
    ],
  },
  'home-own-rent': {
    id: 'home-own-rent',
    question: 'Do you own or rent your home?',
    Icon: Home,
    getNextStepId: (value) => (value === 'own' ? 'home-property-type' : 'security-systems'),
    options: [
      { value: 'own', label: 'Own' },
      { value: 'rent', label: 'Rent' },
    ],
  },
  'home-property-type': {
    id: 'home-property-type',
    question: 'What type of property is it?',
    Icon: BuildingIcon,
    nextStepId: 'security-systems',
    options: [
      { value: 'house', label: 'House' },
      { value: 'apartment', label: 'Apartment/Unit' },
      { value: 'townhouse', label: 'Townhouse' },
    ],
  },
  'vehicle-type': {
    id: 'vehicle-type',
    question: 'What type of vehicle do you need to insure?',
    Icon: Car,
    nextStepId: 'vehicle-year',
    options: [
      { value: 'car', label: 'Car', icon: CarFront },
      { value: 'motorcycle', label: 'Motorcycle', icon: Bike },
      { value: 'commercial', label: 'Commercial Vehicle', icon: Truck },
    ],
  },
  'vehicle-year': {
    id: 'vehicle-year',
    question: 'What year is your car?',
    Icon: Calendar,
    nextStepId: 'security-systems',
    options: [
      { value: '2020-newer', label: '2020 or newer' },
      { value: '2015-2019', label: '2015 - 2019' },
      { value: '2010-2014', label: '2010 - 2014' },
      { value: 'pre-2010', label: 'Pre-2010' },
    ],
  },
  'business-type': {
    id: 'business-type',
    question: 'What type of business do you operate?',
    Icon: Briefcase,
    nextStepId: 'location',
    options: [
      { value: 'retail', label: 'Retail', icon: Hotel },
      { value: 'professional', label: 'Professional Services', icon: User },
      { value: 'trades', label: 'Trades/Construction', icon: Wrench },
      { value: 'online', label: 'Online/Home Business', icon: Laptop },
    ],
  },
  'landlord-property-type': {
      id: 'landlord-property-type',
      question: 'What type of property do you rent out?',
      Icon: Building,
      nextStepId: 'security-systems',
      options: [
          { value: 'house', label: 'House' },
          { value: 'apartment', label: 'Apartment/Unit' },
          { value: 'multi-unit', label: 'Multi-unit building' },
      ]
  },
  'multi-product-selection': {
      id: 'multi-product-selection',
      question: 'Which products are you interested in?',
      description: 'Select all that apply (we\'ll start with one).',
      Icon: Blocks,
      nextStepId: 'home-own-rent', // Start with home flow for simplicity
      options: [
        { value: 'home_vehicle', label: 'Home & Vehicle' },
        { value: 'home_business', label: 'Home & Business' },
        { value: 'all', label: 'All of the above!' },
      ]
  },
  'security-systems': {
    id: 'security-systems',
    question: 'Do you have any security systems installed?',
    Icon: KeyRound,
    nextStepId: 'location',
    options: [
      { value: 'yes', label: 'Yes', icon: ShieldCheck },
      { value: 'no', label: 'No', icon: ShieldOff },
      { value: 'planning', label: 'Planning to install', icon: KeyRound },
    ],
  },
  'location': {
    id: 'location',
    question: "What's your suburb or postcode?",
    Icon: MapPin,
    fields: ['postcode'],
    nextStepId: 'previous-claims'
  },
  'previous-claims': {
    id: 'previous-claims',
    question: 'Have you made any claims in the last 5 years?',
    Icon: FileText,
    nextStepId: 'coverage-level',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'coverage-level': {
    id: 'coverage-level',
    question: 'What level of coverage do you prefer?',
    Icon: HeartHandshake,
    getNextStepId: (value) => (value === 'not-sure' ? 'coverage-recommendation' : 'excess-amount'),
    options: [
      { value: 'basic', label: 'Basic/Third Party' },
      { value: 'comprehensive', label: 'Comprehensive' },
      { value: 'premium', label: 'Premium/Full Cover' },
      { value: 'not-sure', label: 'Not Sure?', icon: ShieldQuestion },
    ],
  },
  'coverage-recommendation': {
    id: 'coverage-recommendation',
    question: 'Getting your recommendation...',
    Icon: ShieldQuestion,
    nextStepId: 'excess-amount'
  },
  'excess-amount': {
    id: 'excess-amount',
    question: "What's your preferred excess amount?",
    Icon: CircleDollarSign,
    nextStepId: 'age-group',
    options: [
      { value: '250-500', label: '$250 - $500' },
      { value: '500-1000', label: '$500 - $1000' },
      { value: '1000+', label: '$1000+' },
      { value: 'as-low-as-possible', label: 'As low as possible' },
    ],
  },
  'age-group': {
    id: 'age-group',
    question: "What's your age group?",
    Icon: User,
    nextStepId: 'coverage-start-date',
    options: [
      { value: '18-25', label: '18 - 25' },
      { value: '26-40', label: '26 - 40' },
      { value: '41-60', label: '41 - 60' },
      { value: '60+', label: '60+' },
    ],
  },
  'coverage-start-date': {
    id: 'coverage-start-date',
    question: 'When do you need coverage to start?',
    Icon: CalendarClock,
    nextStepId: 'contact-details',
    options: [
      { value: 'immediately', label: 'Immediately' },
      { value: 'within-1-month', label: 'Within 1 month' },
      { value: '1-3-months', label: '1 - 3 months' },
      { value: 'researching', label: 'Just researching' },
    ],
  },
  'contact-details': {
    id: 'contact-details',
    question: 'How can we send your quote?',
    description: "Please provide your contact information to receive your personalized quote.",
    Icon: Contact,
    fields: ['name', 'email', 'phone'],
    nextStepId: 'preferred-contact'
  },
  'preferred-contact': {
    id: 'preferred-contact',
    question: 'How would you prefer to be contacted?',
    Icon: ShieldQuestion,
    nextStepId: 'results',
    options: [
      { value: 'phone', label: 'Phone', icon: Phone },
      { value: 'email', label: 'Email', icon: Mail },
      { value: 'sms', label: 'Text/SMS', icon: MessageSquare },
      { value: 'no-contact', label: 'No contact, just show my quote' },
    ],
  },
  'results': {
    id: 'results',
    question: 'Your Quote Results',
    Icon: Gem,
  },
};
