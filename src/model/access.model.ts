import type { EntityModel } from './entity.model';

export type AccessType = keyof PermissionMapType;

export type PermissionType<T extends string = string> =
    | `PERMISSION_${T}`
    // note: super permission can exist on any record
    // and it means that the accountId of the to and from entity id match
    | `PERMISSION_SUPER`;

export type CorePermissionType = PermissionType<
    'READ' | 'WRITE' | 'ADMIN' | 'SUPER'
>;

export type FriendPermissionType = PermissionType<
    | 'FRIEND_BEST'
    | 'FRIEND_ACQUAINTENCE'
    | 'FRIEND_ENEMY'
    | 'FRIEND_NEUTRAL'
    | 'FRIEND_WORST'
>;

export type AllPermissionType = CorePermissionType | FriendPermissionType;

export interface PermissionMapType {
    ['access_person_friend']: FriendPermissionType;
    ['access_group_nm']: CorePermissionType;
    ['access_person']: CorePermissionType;
    ['access_group']: CorePermissionType;
}

export interface AccessModel extends AccessDataModel {
    entityTo: EntityModel;
    entityFrom: EntityModel;
    entityType: EntityModel;
    permissionEntityList: EntityModel[];
}

export interface AccessDataModel<
    T extends AccessType = AccessType,
    U extends PermissionType = PermissionType,
    V extends Record<string, unknown> = Record<string, unknown>
> {
    id: string;
    idType: T;
    idTo: string;
    idFrom: string;
    permissionList: U[];
    policyList: V[];
    stampStart: Date;
    stampEnd?: Date;
}

export interface PersonAccessDataModel
    extends AccessDataModel<'access_person'> {}

export interface PersonFriendAccessDataModel
    extends AccessDataModel<
        'access_person_friend',
        PermissionMapType['access_person_friend']
    > {}

export interface GroupAccessDataModel extends AccessDataModel<'access_group'> {}

export interface NmGroupAccessDataModel
    extends AccessDataModel<'access_group_nm'> {}

export type AllAccessDataModel =
    | PersonAccessDataModel
    | PersonFriendAccessDataModel
    | GroupAccessDataModel
    | NmGroupAccessDataModel;
