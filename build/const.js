"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NN_ADMIN_ROLE_CODES = exports.NM_ADMIN_ROLES = exports.NN_NIGHT_ROLE_CODES = exports.NM_NIGHT_ROLES = exports.NM_ROLE_STATUS = exports.DAYS_OF_WEEK_CODES = exports.PARTS_OF_DAY = exports.DAYS_OF_WEEK = exports.ROLE_STATUS_LIST = exports.YES_NO_STATE_LIST = exports.PERMISSION_CODE_LIST = exports.PERMISSION_MAP = void 0;
exports.PERMISSION_MAP = {
    PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER: {
        id: 'PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER',
        name: 'Contact By Text Message about a Pickup',
        description: 'ie: with details about a pickup that you have volunteered for.'
    },
    PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER: {
        id: 'PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER',
        name: 'Contact By Text Message on day of Night Hosting',
        description: 'ie: if you are hosting or doing a pick-up that day.'
    },
    PERMISSION_CONTACT_TEXT_ON_AVAILABILITY_REQUEST: {
        id: 'PERMISSION_CONTACT_TEXT_ON_AVAILABILITY_REQUEST',
        name: 'Contact By Text Message about Availability',
        description: 'ie: you have Tuesday afternoon availability and we need someone that week.'
    },
    PERMISSION_CONTACT_EMAIL_ON_AVAILABILITY: {
        id: 'PERMISSION_CONTACT_EMAIL_ON_AVAILABILITY',
        name: 'Contact by Email about Availability',
        description: 'ie: you have Tuesday afternoon availability and someone is leaving.'
    },
    PERMISSION_SHARE_PHONE_WITH_NIGHT_CAP: {
        id: 'PERMISSION_SHARE_PHONE_WITH_NIGHT_CAP',
        name: 'Share Phone Number with Night Cap',
        description: 'ie: if you are hosting or doing a pick-up that day.'
    },
    PERMISSION_SHARE_PHONE_WITH_COMMUNITY_COORDINATOR: {
        id: 'PERMISSION_SHARE_PHONE_WITH_COMMUNITY_COORDINATOR',
        name: 'Share Phone Number with Community Coordinator',
        description: 'ie: if you have interest in bike building.'
    },
    PERMISSION_SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR: {
        id: 'PERMISSION_SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR',
        name: 'Share Email Address with Community Coordinators',
        description: 'ie: when you have availabilty that matches need.'
    }
};
exports.PERMISSION_CODE_LIST = Object.keys(exports.PERMISSION_MAP);
exports.YES_NO_STATE_LIST = ['yes', 'no'];
// across our data model, these strings are used to identify if a resource is active or not
exports.ROLE_STATUS_LIST = [
    'active',
    'inactive',
    'shadow'
];
exports.DAYS_OF_WEEK = {
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
exports.PARTS_OF_DAY = {
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
exports.DAYS_OF_WEEK_CODES = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday'
];
exports.NM_ROLE_STATUS = {
    active: {
        id: 'active',
        name: 'Active Status',
        description: 'This role is active.'
    },
    inactive: {
        id: 'inactive',
        name: 'Inactive Status',
        description: 'This role persists in the record but will be ignored.'
    },
    shadow: {
        id: 'shadow',
        name: 'Shadow Status',
        description: 'Shadow status is training mode.'
    }
};
exports.NM_NIGHT_ROLES = {
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
    // 'night-distro-shadow': {
    //     id: 'night-distro-shadow',
    //     name: 'Night Host Shadow',
    //     description: 'Learn to Host Market'
    // },
    'night-pickup': {
        id: 'night-pickup',
        name: 'Night Pickup',
        description: 'Pickup Food and Deliver to Market'
    }
    // 'night-pickup-shadow': {
    //     id: 'night-pickup-shadow',
    //     name: 'Night Pickup Shadow',
    //     description: 'Learn How to Food Pickup'
    // }
};
exports.NN_NIGHT_ROLE_CODES = Object.keys(exports.NM_NIGHT_ROLES);
exports.NM_ADMIN_ROLES = {
    'community-coordinator': {
        id: 'community-coordinator',
        name: 'Community Coordinator',
        description: ''
    },
    treasurer: {
        id: 'treasurer',
        name: 'Safe Foodie',
        description: ''
    },
    'food-safety': {
        id: 'food-safety',
        name: 'Safe Foodie',
        description: ''
    },
    director: {
        id: 'director',
        name: 'Safe Foodie',
        description: ''
    }
};
exports.NN_ADMIN_ROLE_CODES = Object.keys(exports.NM_ADMIN_ROLES);
