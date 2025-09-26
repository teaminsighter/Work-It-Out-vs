
import type { Questions } from '@/types';
import { MapPin } from 'lucide-react';
import { NZ_TOWNS } from './nz-towns';

export const ALL_LOCATION_QUESTIONS: Questions = {
    'location': {
        id: 'location',
        question: 'Where are you located?',
        description: "Your location helps us find local advisor.",
        Icon: MapPin,
        field: 'location',
        nextStepId: 'age-group',
        options: NZ_TOWNS.map(town => ({ value: town.toLowerCase().replace(/ /g, '-'), label: town })),
    },
};
