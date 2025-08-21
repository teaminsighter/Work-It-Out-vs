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
  Briefcase,
  Heart,
  Activity,
  UserCheck
} from 'lucide-react';
import ContactForm from '@/components/quote/ContactForm';
import CoverageRecommendationStep from '@/components/quote/CoverageRecommendationStep';

export const TOTAL_STEPS_ESTIMATE = 8;

export const ALL_QUESTIONS: Questions = {
  'start': {
    id: 'start',
    question: "Welcome to QuoteFlow",
    Icon: Home,
    nextStepId: 'insurance-type',
  },
  'insurance-type': {
    id: 'insurance-type',
    question: "What insurance do you need?",
    description: "Select the primary type of coverage you're looking for.",
    Icon: ShieldQuestion,
    nextStepId: 'previous-claims',
    options: [
      { value: 'life-insurance', label: 'Life Insurance', icon: Heart },
      { value: 'trauma-insurance', label: 'Trauma Insurance', icon: Activity },
      { value: 'income-protection', label: 'Income Protection', icon: UserCheck },
      { value: 'mortgage-protection', label: 'Mortgage Protection', icon: Home },
    ],
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
    nextStepId: 'results'
  },
  'results': {
    id: 'results',
    question: 'Your Quote Results',
    Icon: Gem,
  },
};
