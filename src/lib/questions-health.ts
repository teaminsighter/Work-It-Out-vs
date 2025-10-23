
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
  Shield,
} from 'lucide-react';
import { ALL_LOCATION_QUESTIONS } from './questions-location';

export const TOTAL_STEPS_ESTIMATE = 7;

// Dynamic step estimation based on coverage type
export const getStepEstimate = (coverageType?: string) => {
  switch(coverageType) {
    case 'myself': return 6;
    case 'myself-and-partner': return 7; // Reduced from ~12 with combined steps, removed income step
    case 'my-family': return 7; // Family flow: smoking, gender, age+oldest child combined, dependants, medical, contact
    case 'someone-else': return 6;
    default: return 7;
  }
};

export const ALL_QUESTIONS: Questions = {
  'start': {
    id: 'start',
    question: "Let's tailor your quotes",
    description: "Answer a few quick questions for personalised NZ health insurance prices.",
    Icon: ShieldCheck,
    nextStepId: 'welcome-specialty',
    options: [
      { value: 'go', label: 'Get Started' },
    ],
  },
  'welcome-specialty': {
    id: 'welcome-specialty',
    title: "Let's tailor your quotes",
    description: "Answer a few quick questions for personalised NZ health insurance prices.",
    question: 'Do you currently have medical insurance?',
    Icon: ShieldQuestion,
    getNextStepId: (value: string) => value === 'yes' ? 'insurance-changes' : 'security-systems',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'insurance-changes': {
    id: 'insurance-changes',
    question: 'Has any thing change in your health?',
    Icon: ShieldQuestion,
    getNextStepId: (value: string) => value === 'yes' ? 'medical-condition-change-message' : 'change-cover-type',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'medical-condition-change-message': {
    id: 'medical-condition-change-message',
    question: 'Because your medical conditions have changed',
    description: 'Hi there, because your medical conditions have changed, we suggest reviewing with your current provider, as a new provider will likely exclude these conditions. If you would like one of our specialists to review your policy and overall insurance cover, please select the next button and complete the personal information.',
    Icon: Activity,
    nextStepId: 'coverage-level',
    options: [
      { value: 'next', label: 'Next' },
    ],
  },
  'change-cover-type': {
    id: 'change-cover-type',
    question: 'What are you looking to change in your cover?',
    Icon: ShieldQuestion,
    nextStepId: 'security-systems',
    options: [
      { value: 'better-cover', label: 'Better Cover' },
      { value: 'review-policy', label: 'Review Policy' },
      { value: 'all', label: 'All of the above' },
    ],
  },
  'insurance-type': {
    id: 'insurance-type',
    question: "What type of insurance do you need?",
    description: "Select the main type of cover you're looking for.",
    Icon: ShieldQuestion,
    multiSelect: true,
    nextStepId: 'previous-claims',
    options: [
      { value: 'life', label: 'Life Insurance', icon: Heart },
      { value: 'trauma', label: 'Trauma Insurance', icon: Activity },
      { value: 'income', label: 'Income Protection', icon: FileDigit },
      { value: 'mortgage', label: 'Mortgage Protection', icon: Home },
      { value: 'health', label: 'Health Insurance', icon: Shield },
    ],
  },
  'home-property-type': {
    id: 'home-property-type',
    question: 'What type of property is it?',
    Icon: Home,
    nextStepId: 'previous-claims',
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
    nextStepId: 'previous-claims',
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
    nextStepId: 'previous-claims',
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
    nextStepId: 'previous-claims',
    options: [
      { value: 'house', label: 'House', icon: Home },
      { value: 'apartment', label: 'Apartment', icon: Building },
      { value: 'multi-unit', label: 'Multi-unit Dwelling', icon: ChevronsUp },
    ],
  },
  'security-systems': {
    id: 'security-systems',
    question: 'Who is the cover for?',
    Icon: Users,
    getNextStepId: (value: string) => {
      const smokingMap: { [key: string]: string } = {
        'myself': 'smoking-myself',
        'my-partner': 'smoking-partner', 
        'myself-and-partner': 'smoking-myself-partner',
        'my-family': 'smoking-family',
        'someone-else': 'smoking-someone-else'
      };
      return smokingMap[value] || 'coverage-level';
    },
    options: [
      { value: 'myself', label: 'My self', icon: User },
      { value: 'myself-and-partner', label: 'My Self & Partner', icon: Users },
      { value: 'my-family', label: 'My Family', icon: Users },
      { value: 'someone-else', label: 'Someone Else', icon: User },
    ],
  },
  'previous-claims': {
    id: 'previous-claims',
    question: 'Do you have an existing policy?',
    Icon: FileText,
    nextStepId: 'security-systems',
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
  'smoking-myself': {
    id: 'smoking-myself',
    question: 'Do you smoke?',
    Icon: Cigarette,
    nextStepId: 'gender',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'smoking-partner': {
    id: 'smoking-partner',
    question: 'Do they smoke?',
    Icon: Cigarette,
    nextStepId: 'gender',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'smoking-myself-partner': {
    id: 'smoking-myself-partner',
    question: 'Smoking Information',
    description: 'Please answer for both you and your partner',
    Icon: Cigarette,
    nextStepId: 'gender-combined',
    fields: ['yourSmoking', 'partnerSmoking'],
    multipleQuestions: [
      {
        id: 'yourSmoking',
        question: 'Do you smoke?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'partnerSmoking',
        question: 'Does your partner smoke?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  },
  'smoking-family': {
    id: 'smoking-family',
    question: 'Smoking Information',
    description: 'Please answer both questions about smoking',
    Icon: Cigarette,
    nextStepId: 'gender',
    fields: ['yourSmoking', 'familyMemberSmoking'],
    multipleQuestions: [
      {
        id: 'yourSmoking',
        question: 'Do you smoke?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
      {
        id: 'familyMemberSmoking',
        question: 'Does anyone in your family smoke?',
        options: [
          { value: 'yes', label: 'Yes' },
          { value: 'no', label: 'No' },
        ],
      },
    ],
  },
  'smoking-someone-else': {
    id: 'smoking-someone-else',
    question: 'Do they smoke?',
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
    getNextStepId: (value: string, formData: any) => {
      // Route to family-specific age question for family coverage
      if (formData?.coverageType === 'my-family') {
        return 'age-family';
      }
      return 'age';
    },
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  'gender-combined': {
    id: 'gender-combined',
    question: 'Gender Information',
    description: 'Please select gender for both you and your partner',
    Icon: Users,
    nextStepId: 'age-combined',
    fields: ['yourGender', 'partnerGender'],
    multipleQuestions: [
      {
        id: 'yourGender',
        question: 'What is your gender?',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ],
      },
      {
        id: 'partnerGender',
        question: 'What is your partner\'s gender?',
        options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ],
      },
    ],
  },
  'gender-myself': {
    id: 'gender-myself',
    question: 'What is your gender?',
    Icon: Users,
    nextStepId: 'gender-partner',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  'gender-partner': {
    id: 'gender-partner',
    question: 'What is your partner\'s gender?',
    Icon: Users,
    nextStepId: 'age-myself',
    options: [
      { value: 'male', label: 'Male' },
      { value: 'female', label: 'Female' },
    ],
  },
  'age': {
    id: 'age',
    question: 'How old are you?',
    Icon: User,
    fields: ['age'],
    nextStepId: 'medical-condition',
  },
  'age-family': {
    id: 'age-family',
    question: 'Age Information',
    description: 'Please provide age details for you and your oldest child',
    Icon: User,
    fields: ['age', 'oldestChildAge'],
    nextStepId: 'number-of-dependants',
    multipleFields: [
      {
        id: 'age',
        label: 'How old are you?',
        type: 'number',
        placeholder: 'e.g. 35',
        required: true,
        min: 18,
        max: 80
      },
      {
        id: 'oldestChildAge',
        label: 'What is the age of your oldest child?',
        type: 'number',
        placeholder: 'e.g. 12',
        required: true,
        min: 0,
        max: 25
      }
    ]
  },
  'age-combined': {
    id: 'age-combined',
    question: 'Age Information',
    description: 'Please enter ages for both you and your partner',
    Icon: User,
    fields: ['yourAge', 'partnerAge'],
    nextStepId: 'medical-condition-myself',
    multipleFields: [
      {
        id: 'yourAge',
        label: 'Your age',
        type: 'number',
        placeholder: 'e.g. 35',
        required: true
      },
      {
        id: 'partnerAge',
        label: 'Your partner\'s age',
        type: 'number', 
        placeholder: 'e.g. 32',
        required: true
      }
    ]
  },
  'age-myself': {
    id: 'age-myself',
    question: 'How old are you?',
    Icon: User,
    fields: ['age'],
    nextStepId: 'age-partner',
  },
  'age-partner': {
    id: 'age-partner',
    question: 'How old is your partner?',
    Icon: User,
    fields: ['partnerAge'],
    nextStepId: 'medical-condition-myself',
  },
  'medical-condition': {
    id: 'medical-condition',
    question: 'Do you have any medical conditions?',
    Icon: Activity,
    getNextStepId: (value: string, formData: any) => {
      // Check if this is family coverage
      if (formData?.coverageType === 'my-family') {
        return value === 'yes' ? 'medical-condition-details-family' : 'contact-details';
      }
      return value === 'yes' ? 'medical-condition-details' : 'contact-details';
    },
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'medical-condition-details': {
    id: 'medical-condition-details',
    question: 'Do any of these medical conditions apply?',
    Icon: Activity,
    nextStepId: 'contact-details',
    multiSelect: true,
    options: [
      { value: 'diabetics', label: 'Diabetics' },
      { value: 'heart-diseases', label: 'Heart Diseases' },
      { value: 'skin-cancer', label: 'Skin Cancer' },
      { value: 'asthma', label: 'Asthma' },
      { value: 'none-of-the-above', label: 'None of the above' },
    ],
  },
  'medical-condition-details-family': {
    id: 'medical-condition-details-family',
    question: 'Do any of these medical conditions apply to you?',
    Icon: Activity,
    nextStepId: 'contact-details',
    multiSelect: true,
    options: [
      { value: 'diabetics', label: 'Diabetics' },
      { value: 'heart-diseases', label: 'Heart Diseases' },
      { value: 'skin-cancer', label: 'Skin Cancer' },
      { value: 'asthma', label: 'Asthma' },
      { value: 'none-of-the-above', label: 'None of the above' },
    ],
  },
  'medical-condition-myself': {
    id: 'medical-condition-myself',
    question: 'Do you have any medical conditions?',
    Icon: Activity,
    getNextStepId: (value: string) => value === 'yes' ? 'medical-condition-details-myself' : 'medical-condition-partner',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'medical-condition-details-myself': {
    id: 'medical-condition-details-myself',
    question: 'Do any of these medical conditions apply?',
    Icon: Activity,
    nextStepId: 'medical-condition-partner',
    multiSelect: true,
    options: [
      { value: 'diabetics', label: 'Diabetics' },
      { value: 'heart-diseases', label: 'Heart Diseases' },
      { value: 'skin-cancer', label: 'Skin Cancer' },
      { value: 'asthma', label: 'Asthma' },
      { value: 'none-of-the-above', label: 'None of the above' },
    ],
  },
  'medical-condition-partner': {
    id: 'medical-condition-partner',
    question: 'Does your partner have any medical conditions?',
    Icon: Activity,
    getNextStepId: (value: string) => value === 'yes' ? 'medical-condition-details-partner' : 'contact-details',
    options: [
      { value: 'yes', label: 'Yes' },
      { value: 'no', label: 'No' },
    ],
  },
  'medical-condition-details-partner': {
    id: 'medical-condition-details-partner',
    question: 'What type of medical condition does your partner have?',
    Icon: Activity,
    nextStepId: 'contact-details',
    multiSelect: true,
    options: [
      { value: 'diabetics', label: 'Diabetics' },
      { value: 'heart-diseases', label: 'Heart Diseases' },
      { value: 'skin-cancer', label: 'Skin Cancer' },
      { value: 'asthma', label: 'Asthma' },
      { value: 'none-of-the-above', label: 'None of the above' },
    ],
  },
  'household-income': {
    id: 'household-income',
    question: 'What is your annual household income?',
    Icon: CircleDollarSign,
    nextStepId: 'contact-details',
    options: [
      { value: 'less-than-49k', label: 'Less than $49,000' },
      { value: '50k-99k', label: '$50,000 - $99,000' },
      { value: '100k-149k', label: '$100,000 - $149,000' },
      { value: '150k-199k', label: '$150,000 - $199,000' },
      { value: '200k+', label: '$200,000+' },
    ],
  },
  'contact-details': {
    id: 'contact-details',
    question: 'How can we send your quote?',
    description: "Please provide your contact information to receive your personalized quote.",
    Icon: Contact,
    fields: ['name', 'email', 'phone'],
    nextStepId: 'sms-verification'
  },
  'sms-verification': {
    id: 'sms-verification',
    question: 'Verify your phone number',
    description: "We've sent a 6-digit verification code to your phone number. Please enter it below to continue.",
    Icon: Phone,
    fields: ['verificationCode'],
    nextStepId: 'results'
  },
  'number-of-dependants': {
    id: 'number-of-dependants',
    question: 'How many Dependants?',
    description: 'Enter the number of children or dependants to include in your family coverage',
    Icon: Users,
    fields: ['numberOfDependants'],
    nextStepId: 'medical-condition',
  },
  'results': {
    id: 'results',
    question: 'Your Quote Results',
    Icon: Gem,
  },
  ...ALL_LOCATION_QUESTIONS
};
