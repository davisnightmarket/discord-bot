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
// todo: move this whole file to coreDataService

// CONTACT

export type PermissionType =
    | 'CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER'
    | 'CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER'
    | 'CONTACT_TEXT_ON_AVAILABILITY_REQUEST'
    | 'CONTACT_EMAIL_ON_AVAILABILITY_REQUEST'
    | 'SHARE_PHONE_WITH_NIGHT_CAP'
    | 'SHARE_PHONE_WITH_COMMUNITY_COORDINATOR'
    | 'SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR';

export const PERMISSION_MAP: {
    [k in PermissionType]: {
        id: k;
        name: string;
        description: string;
    };
} = {
    CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER: {
        id: 'CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER',
        name: 'Contact By Text Message about a Pickup',
        description:
            'ie: with details about a pickup that you have volunteered for.'
    },
    CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER: {
        id: 'CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER',
        name: 'Contact By Text Message on day of Night Hosting',
        description: 'ie: if you are hosting or doing a pick-up that day.'
    },
    CONTACT_TEXT_ON_AVAILABILITY_REQUEST: {
        id: 'CONTACT_TEXT_ON_AVAILABILITY_REQUEST',
        name: 'Contact By Text Message about Availability',
        description:
            'ie: you have Tuesday afternoon availability and we need someone that week.'
    },
    CONTACT_EMAIL_ON_AVAILABILITY_REQUEST: {
        id: 'CONTACT_EMAIL_ON_AVAILABILITY_REQUEST',
        name: 'Contact by Email about Availability',
        description:
            'ie: you have Tuesday afternoon availability and someone is leaving.'
    },
    SHARE_PHONE_WITH_NIGHT_CAP: {
        id: 'SHARE_PHONE_WITH_NIGHT_CAP',
        name: 'Share Phone Number with Night Cap',
        description: 'ie: if you are hosting or doing a pick-up that day.'
    },
    SHARE_PHONE_WITH_COMMUNITY_COORDINATOR: {
        id: 'SHARE_PHONE_WITH_COMMUNITY_COORDINATOR',
        name: 'Share Phone Number with Community Coordinator',
        description: 'ie: if you have interest in bike building.'
    },
    SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR: {
        id: 'SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR',
        name: 'Share Email Address with Community Coordinators',
        description: 'ie: when you have availabilty that matches need.'
    }
};

export const PERMISSION_CODE_LIST = Object.keys(PERMISSION_MAP);

export const YES_NO_STATE_LIST = ['yes', 'no'];

// across our data model, these strings are used to identify if a resource is active or not
export const ACTIVE_STATE_LIST: NmActiveStateType[] = ['active', 'inactive'];

export const DAYS_OF_WEEK: {
    [k in NmDayNameType]: {
        id: k;
        name: string;
        description: string;
    };
} = {
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
    },
    sunday: {
        id: 'sunday',
        name: 'Sunday',
        description: 'Day for Sinners and Saints'
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
    'night-distro': {
        id: 'night-distro',
        name: 'Night Host',
        description: 'Host Market with Friends'
    },
    'night-distro-shadow': {
        id: 'night-distro-shadow',
        name: 'Night Host Shadow',
        description: 'Learn to Host Market'
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
