import {
    type NmActiveStateType,
    NmNightRoleType,
    NmAdminRoleType
} from './model/night-market.model';

/**
 * CORE DATA
 */

// across our data model, these strings are used to identify if a resource is active or not
export const GSPREAD_CORE_ACTIVE_STATE_LIST: NmActiveStateType[] = [
    'active',
    'inactive'
];

export const DAYS_OF_WEEK = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
] as const;

export const NM_NIGHT_ROLES: {
    [k in NmNightRoleType]: {
        name: string;
        description: string;
    };
} = {
    'night-captain': {
        name: 'Night Captain',
        description: ''
    },
    'night-host': {
        name: 'Night Host',
        description: 'Host Market with Friends'
    },
    'night-pickup': {
        name: 'Night Pickup',
        description: 'Pickup Food and Deliver to Market'
    },
    'night-pickup-shadow': {
        name: 'Night Pickup Shadow',
        description: 'Learn How to Food Pickup'
    }
};

export const NN_NIGHT_ROLE_CODES = Object.keys(NM_NIGHT_ROLES);

export const NM_ADMIN_ROLES: {
    [k in NmAdminRoleType]: {
        name: string;
        description: string;
    };
} = {
    'community-coordinator': {
        name: 'Night Captain',
        description: ''
    },
    'community-treasurer': {
        name: 'Community Treasurer',
        description: ''
    },
    'community-foodie': {
        name: 'Food Safety',
        description: ''
    }
};

export const NN_ADMIN_ROLE_CODES = Object.keys(NM_ADMIN_ROLES);
