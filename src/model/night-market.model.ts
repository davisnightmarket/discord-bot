export type NmDayNameType =
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';

export type NmPartOfDayNameType = 'morning' | 'afternoon' | 'evening' | 'night';

export type NmActiveStateType = 'active' | 'inactive';

export type NmRoleType = NmNightRoleType | NmAdminRoleType;

export type NmNightRoleType =
    | 'night-host'
    | 'night-host-shadow'
    | 'night-captain'
    | 'night-pickup'
    | 'night-pickup-shadow';
export type NmAdminRoleType =
    | 'community-coordinator'
    | 'community-treasurer'
    | 'community-foodie';

export type NmRolePeriodType = 'once' | 'every' | 'halt';
