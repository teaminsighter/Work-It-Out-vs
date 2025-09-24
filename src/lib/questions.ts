
import type { Question, Questions, Option } from '@/types';
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
  Heart,
  Activity,
  FileDigit,
  Users,
  Cigarette,
  HeartPulse,
} from 'lucide-react';
import { NZ_TOWNS } from './nz-towns';

export const TOTAL_STEPS_ESTIMATE = 9;

export const ALL_QUESTIONS: Questions = {
  'start': {
    id: 'start',
    question: "Welcome to QuoteFlow",
    Icon: ShieldCheck,
    nextStepId: 'insurance-type',
  },
  'insurance-type': {
    id: 'insurance-type',
    question: "What type of insurance do you need?",
    description: "Select the main type of cover you're looking for.",
    Icon: ShieldQuestion,
    options: [
      { value: 'life', label: 'Life Insurance', icon: Heart, nextStepId: 'security-systems' },
      { value: 'trauma', label: 'Trauma Insurance', icon: Activity, nextStepId: 'security-systems' },
      { value: 'income', label: 'Income Protection', icon: FileDigit, nextStepId: 'security-systems' },
      { value: 'mortgage', label: 'Mortgage Protection', icon: Home, nextStepId: 'security-systems' },
    ],
  },
  'home-property-type': {
    id: 'home-property-type',
    question: 'What type of property is it?',
    Icon: Home,
    nextStepId: 'security-systems',
    options: [
      { value: 'house', label: 'House', icon: Home },
      { value: 'apartment', label: 'Apartment', icon: Building },
      { value: 'townhouse', label: 'Townhouse', icon: Hotel },
      { value: 'unit', label: 'Unit/Flat', icon: BedDouble },
    ],
  },
  'vehicle-type': {
    id: 'vehicle-type',
    question: 'What type of vehicle do you want to insure?',
    Icon: Car,
    nextStepId: 'vehicle-year',
     options: [
      { value: 'car', label: 'Car', icon: CarFront },
      { value: 'motorcycle', label: 'Motorcycle', icon: Bike },
      { value: 'truck', label: 'Truck/Ute', icon: Truck },
      { value: 'other', label: 'Other', icon: ShieldQuestion },
    ],
  },
   'vehicle-year': {
    id: 'vehicle-year',
    question: 'How old is the vehicle?',
    Icon: Calendar,
    nextStepId: 'security-systems',
     options: [
      { value: 'newer-3', label: '0-3 years old' },
      { value: '3-10', label: '3-10 years old' },
      { value: 'older-10', label: '10+ years old' },
    ],
  },
  'business-type': {
    id: 'business-type',
    question: 'What is your business type?',
    Icon: Building2,
    nextStepId: 'security-systems',
    options: [
        { value: 'trades', label: 'Trades & Services', icon: Wrench },
        { value: 'professional', label: 'Professional Services', icon: Laptop },
        { value: 'retail', label: 'Retail', icon: BuildingIcon },
        { value: 'other', label: 'Other' }
    ]
  },
  'landlord-property-type': {
    id: 'landlord-property-type',
    question: 'What type of property do you rent out?',
    Icon: KeyRound,
    nextStepId: 'security-systems',
    options: [
      { value: 'house', label: 'House', icon: Home },
      { value: 'apartment', label: 'Apartment', icon: Building },
      { value: 'multi-unit', label: 'Multi-unit Dwelling', icon: ChevronsUp },
    ],
  },
  'security-systems': {
    id: 'security-systems',
    question: 'Who do you want to cover?',
    Icon: Users,
    nextStepId: 'previous-claims',
    options: [
      { value: 'myself', label: 'Myself', icon: User },
      { value: 'my-partner', label: 'My Partner', icon: User },
      { value: 'myself-and-partner', label: 'Myself & partner', icon: Users },
    ],
  },
  'previous-claims': {
    id: 'previous-claims',
    question: 'Do you have an existing policy?',
    Icon: FileText,
    nextStepId: 'coverage-level',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'coverage-level': {
    id: 'coverage-level',
    question: 'Have you smoked in the past 12 months?',
    Icon: Cigarette,
    nextStepId: 'gender',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'gender': {
    id: 'gender',
    question: 'What is your gender?',
    Icon: Users,
    nextStepId: 'age',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  'coverage-recommendation': {
    id: 'coverage-recommendation',
    question: 'Getting your recommendation...',
    Icon: ShieldQuestion,
    nextStepId: 'age'
  },
  'age': {
    id: 'age',
    question: 'How old are you?',
    Icon: User,
    fields: ['age'],
    nextStepId: 'medical-condition',
  },
  'medical-condition': {
    id: 'medical-condition',
    question: 'Do you have any medical conditions?',
    Icon: Activity,
    getNextStepId: (value: string) => value === 'yes' ? 'medical-condition-details' : 'household-income',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'medical-condition-details': {
    id: 'medical-condition-details',
    question: 'What kind of medical condition do you have?',
    Icon: HeartPulse,
    nextStepId: 'household-income',
    options: [
      { value: 'diabetics', label: 'Diabetics' },
      { value: 'asthma', label: 'Asthma' },
      { value: 'cancer', label: 'Cancer' },
      { value: 'heart-condition', label: 'Heart Condition' },
    ],
  },
  'household-income': {
    id: 'household-income',
    question: 'What is your annual household income?',
    Icon: CircleDollarSign,
    nextStepId: 'location',
    options: [
      { value: 'less-than-49k', label: 'Less than $49,000' },
      { value: '50k-99k', label: '$50,000 - $99,000' },
      { value: '100k-149k', label: '$100,000 - $149,000' },
      { value: '150k-199k', label: '$150,000 - $199,000' },
      { value: '200k+', label: '$200,000+' },
    ],
  },
  'location': {
    id: 'location',
    question: "You're almost there! Where do you live?",
    description: 'Select your town from the list below.',
    Icon: MapPin,
    field: 'location', // This will be the key in formData
    options: NZ_TOWNS.map(town => ({ value: town, label: town })),
    nextStepId: 'contact-details',
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
