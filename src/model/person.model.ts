import type {
    NmAdminRoleType,
    NmDayNameType,
    NmNightRoleType,
    NmNightTeamType,
    PersonEntityModel
} from './';

// PersonAttrPermissionType,
//     PersonAttrAvailabilityType,
//     PersonAttrAdminRoleInterestType,
//     PersonAttrBikeType,
//     PersonAttrRoleInterestType,
//     PersonAttrSkillType,
//     PersonAttrTeamInterestType

export interface PersonDataModel {
    id: string;
    idAccount: string;
    contactList: Array<{
        type: string;
        contact: string;
    }>;

    discordId: string;
    pronounList: string[];

    attrRoleInterestList: PersonAttrRoleInterestType[];
    attrAdminRoleInterestList: PersonAttrAdminRoleInterestType[];
    attrTeamInterestList: PersonAttrTeamInterestType[];
    attrBikeAttributeList: PersonAttrBikeType[];
    attrContactPermissionList: PersonAttrPermissionType[];

    // this is  a map because the values is a set of times ie 1-2px,3-5pm
    attrAvailabilityHostMap: Array<{
        [k in PersonAttrAvailabilityType]: string;
    }>;

    attrAvailabilityPickupMap: Array<{
        [k in PersonAttrAvailabilityType]: string;
    }>;

    idNm: string;
    stampCreate: Date;
}

export type PersonModel = PersonEntityModel & PersonDataModel;

export type PersonAttrAdminRoleInterestType =
    `INTEREST_${Uppercase<NmAdminRoleType>}`;

export type PersonAttrRoleInterestType =
    `INTEREST_${Uppercase<NmNightRoleType>}`;

export type PersonAttrTeamInterestType =
    | `INTEREST_${Uppercase<NmNightTeamType>}`
    | 'INTEREST_OTHER';

export type PersonAttrAvailabilityType =
    `AVAILABLE_${Uppercase<NmDayNameType>}`;

export type PersonAttrBikeType =
    | 'BIKE_OWNER'
    | 'BIKE_CART_OWNER'
    | 'BIKE_OPERATE_AT_NIGHT'
    | 'BIKE_CART_OPERATE_AT_NIGHT';

export type PersonAttrSkillType =
    | 'SKILL_WOODWORKING'
    | 'SKILL_ELECTRONICS'
    | 'SKILL_SOCIAl_MEDIA'
    | 'SKILL_LEADERSHIP';

export type PersonAttrPermissionType =
    | 'PERMISSION_CONTACT_EMAIL_ON_AVAILABILITY'
    | 'PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_PICKUP_REMINDER'
    | 'PERMISSION_CONTACT_TEXT_ON_VOLUNTEER_HOST_REMINDER'
    | 'PERMISSION_CONTACT_TEXT_ON_AVAILABILITY_REQUEST'
    | 'PERMISSION_SHARE_EMAIL_WITH_COMMUNITY_COORDINATOR'
    | 'PERMISSION_SHARE_PHONE_WITH_COMMUNITY_COORDINATOR'
    | 'PERMISSION_SHARE_PHONE_WITH_NIGHT_CAP';
