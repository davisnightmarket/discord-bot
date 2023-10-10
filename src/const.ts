import {
    type NmActiveStateType,
    NmNightRoleType,
    NmAdminRoleType,
    NmDayNameType,
    NmPartOfDayNameType
} from './model/night-market.model';

/**
 * CORE DATA
 */

// across our data model, these strings are used to identify if a resource is active or not
export const ACTIVE_STATE_LIST: NmActiveStateType[] = ['active', 'inactive'];

export const DAYS_OF_WEEK: {
    [k in NmDayNameType]: {
        id: k;
        name: string;
        description: string;
    };
} = {
    sunday: {
        id: 'sunday',
        name: 'Sunday',
        description: 'Day for Sinners and Saints'
    },
    monday: {
        id: 'monday',
        name: 'Monday',
        description: 'Day of the Moon'
    },
    tuesday: {
        id: 'tuesday',
        name: 'Tuesday',
        description: 'That day before Wednesday'
    },
    wednesday: {
        id: 'wednesday',
        name: 'Wednesday',
        description: 'All weddings happen on this day'
    },
    thursday: {
        id: 'thursday',
        name: 'Thursday',
        description: 'By this day you are old'
    },
    friday: {
        id: 'friday',
        name: 'Friday',
        description: 'Sleeep'
    },
    saturday: {
        id: 'saturday',
        name: 'Saturday',
        description: 'Party party'
    }
};

export const PARTS_OF_DAY: {
    [k in NmPartOfDayNameType]: {
        id: k;
        name: string;
        description: string;
    };
} = {
    morning: {
        id: 'morning',
        name: 'Morning',
        description: 'Before 12am when crazy people are awake'
    },
    afternoon: {
        id: 'afternoon',
        name: 'Afternoon',
        description: 'The day starts to warm up'
    },
    evening: {
        id: 'evening',
        name: 'Evening',
        description: 'The world begins to make sense at this time'
    },
    night: { id: 'night', name: 'Night', description: 'All better now thanks' }
};

export const DAYS_OF_WEEK_CODES = Object.keys(DAYS_OF_WEEK) as NmDayNameType[];

export const NM_NIGHT_ROLES: {
    [k in NmNightRoleType]: {
        id: k;
        name: string;
        description: string;
    };
} = {
    'night-captain': {
        id: 'night-captain',
        name: 'Night Captain',
        description: ''
    },
    'night-host': {
        id: 'night-host',
        name: 'Night Host',
        description: 'Host Market with Friends'
    },
    'night-pickup': {
        id: 'night-pickup',
        name: 'Night Pickup',
        description: 'Pickup Food and Deliver to Market'
    },
    'night-pickup-shadow': {
        id: 'night-pickup-shadow',
        name: 'Night Pickup Shadow',
        description: 'Learn How to Food Pickup'
    }
};

export const NN_NIGHT_ROLE_CODES = Object.keys(
    NM_NIGHT_ROLES
) as NmNightRoleType[];

export const NM_ADMIN_ROLES: {
    [k in NmAdminRoleType]: {
        id: k;
        name: string;
        description: string;
    };
} = {
    'community-coordinator': {
        id: 'community-coordinator',
        name: 'Community Coordinator',
        description: ''
    },
    'community-treasurer': {
        id: 'community-treasurer',
        name: 'Community Treasurer',
        description: ''
    },
    'community-foodie': {
        id: 'community-foodie',
        name: 'Safe Foodie',
        description: ''
    }
};

export const NN_ADMIN_ROLE_CODES = Object.keys(NM_ADMIN_ROLES);
