export type NmDayNameType =
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';

export type NmActiveStateType = 'active' | 'inactive';

export type NmRoleType = NmNightRoleType | NmAdminRoleType;

export type NmNightRoleType =
    | 'night-host'
    | 'night-captain'
    | 'night-pickup'
    | 'night-pickup-shadow';
export type NmAdminRoleType =
    | 'community-coordinator'
    | 'community-treasurer'
    | 'community-foodie';

export type NmRolePeriodType = 'once' | 'every' | 'halt';
