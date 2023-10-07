"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NN_ADMIN_ROLE_CODES = exports.NM_ADMIN_ROLES = exports.NN_NIGHT_ROLE_CODES = exports.NM_NIGHT_ROLES = exports.DAYS_OF_WEEK = exports.GSPREAD_CORE_ACTIVE_STATE_LIST = void 0;
/**
 * CORE DATA
 */
// across our data model, these strings are used to identify if a resource is active or not
exports.GSPREAD_CORE_ACTIVE_STATE_LIST = [
    'active',
    'inactive'
];
exports.DAYS_OF_WEEK = [
    'sunday',
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday'
];
exports.NM_NIGHT_ROLES = {
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
    }
};
exports.NN_NIGHT_ROLE_CODES = Object.keys(exports.NM_NIGHT_ROLES);
exports.NM_ADMIN_ROLES = {
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
exports.NN_ADMIN_ROLE_CODES = Object.keys(exports.NM_ADMIN_ROLES);
