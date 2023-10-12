"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NN_ADMIN_ROLE_CODES = exports.NM_ADMIN_ROLES = exports.NN_NIGHT_ROLE_CODES = exports.NM_NIGHT_ROLES = exports.DAYS_OF_WEEK_CODES = exports.PARTS_OF_DAY = exports.DAYS_OF_WEEK = exports.ACTIVE_STATE_LIST = exports.YES_NO_STATE_LIST = exports.PERMISSION_TO_SHARE_EMAIL_LIST = exports.PERMISSION_TO_SHARE_EMAIL_MAP = exports.PERMISSION_TO_SHARE_PHONE_LIST = exports.PERMISSION_TO_SHARE_PHONE_MAP = exports.PERMISSION_TO_CONTACT_EMAIL_LIST = exports.PERMISSION_TO_CONTACT_EMAIL_MAP = exports.PERMISSION_TO_CONTACT_TEXT_LIST = exports.PERMISSION_TO_CONTACT_TEXT_MAP = void 0;
exports.PERMISSION_TO_CONTACT_TEXT_MAP = {
    VOLUNTEER_PICKUP_REMINDER: {
        id: 'VOLUNTEER_PICKUP_REMINDER',
        name: 'Contact By Text Message about a Pickup',
        description: 'ie: with details about a pickup that you have volunteered for.'
    },
    VOLUNTEER_HOST_REMINDER: {
        id: 'VOLUNTEER_HOST_REMINDER',
        name: 'Contact By Text Message on day of Night Hosting',
        description: 'ie: if you are hosting or doing a pick-up that day.'
    },
    AVAILABILITY_REQUEST: {
        id: 'AVAILABILITY_REQUEST',
        name: 'Contact By Text Message about Availability',
        description: 'ie: you have Tuesday afternoon availability and we need someone that week.'
    }
};
exports.PERMISSION_TO_CONTACT_TEXT_LIST = Object.keys(exports.PERMISSION_TO_CONTACT_TEXT_MAP);
// contactTextOn	contactEmailOn
exports.PERMISSION_TO_CONTACT_EMAIL_MAP = {
    AVAILABILITY_REQUEST: {
        id: 'AVAILABILITY_REQUEST',
        name: 'Contact by Email about Availability',
        description: 'ie: you have Tuesday afternoon availability and someone is leaving.'
    }
};
exports.PERMISSION_TO_CONTACT_EMAIL_LIST = Object.keys(exports.PERMISSION_TO_CONTACT_EMAIL_MAP);
exports.PERMISSION_TO_SHARE_PHONE_MAP = {
    NIGHT_CAP: {
        id: 'NIGHT_CAP',
        name: 'Share Phone Number with Night Cap',
        description: 'ie: if you are hosting or doing a pick-up that day.'
    },
    COMMUNITY_COORDINATOR: {
        id: 'COMMUNITY_COORDINATOR',
        name: 'Share Phone Number with Community Coordinator',
        description: 'ie: if you have interest in bike building.'
    }
};
exports.PERMISSION_TO_SHARE_PHONE_LIST = Object.keys(exports.PERMISSION_TO_SHARE_PHONE_MAP);
// contactTextOn	contactEmailOn
exports.PERMISSION_TO_SHARE_EMAIL_MAP = {
    COMMUNITY_COORDINATOR: {
        id: 'COMMUNITY_COORDINATOR',
        name: 'Share Email Address with Community Coordinators',
        description: 'ie: when you have availabilty that matches need.'
    }
};
exports.PERMISSION_TO_SHARE_EMAIL_LIST = Object.keys(exports.PERMISSION_TO_SHARE_EMAIL_MAP);
exports.YES_NO_STATE_LIST = ['yes', 'no'];
// across our data model, these strings are used to identify if a resource is active or not
exports.ACTIVE_STATE_LIST = ['active', 'inactive'];
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
exports.DAYS_OF_WEEK_CODES = Object.keys(exports.DAYS_OF_WEEK);
exports.NM_NIGHT_ROLES = {
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
exports.NN_NIGHT_ROLE_CODES = Object.keys(exports.NM_NIGHT_ROLES);
exports.NM_ADMIN_ROLES = {
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
exports.NN_ADMIN_ROLE_CODES = Object.keys(exports.NM_ADMIN_ROLES);
