export type NmDayNameType =
    | 'sunday'
    | 'monday'
    | 'tuesday'
    | 'wednesday'
    | 'thursday'
    | 'friday'
    | 'saturday';

export type NmPartOfDayNameType = 'morning' | 'afternoon' | 'evening' | 'night';

export type NmStatusType = 'active' | 'inactive' | 'shadow';

export type NmRoleType = NmNightRoleType | NmAdminRoleType;

export type NmNightTeamType =
    | 'team-build'
    | 'team-social-media'
    | 'team-onboarding'
    | 'team-outreach';

export type NmNightRoleType = 'night-distro' | 'night-captain' | 'night-pickup';
export type NmAdminRoleType =
    | 'community-coordinator'
    | 'food-safety'
    | 'director'
    | 'treasurer';

export type NmRolePeriodType = 'once' | 'every' | 'halt';
