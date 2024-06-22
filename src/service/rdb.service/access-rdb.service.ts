import type { RTable } from 'rethinkdb-ts';
import type { RdbService } from './rdb.service';
import type {
    AccessDataModel,
    AccessType,
    AllAccessDataModel,
    AllPermissionType,
    EntityModel,
    PermissionMapType
} from '../../model';
const accessTypeList: AccessType[] = [
    'access_group',
    'access_group',
    'access_group_nm',
    'access_person',
    'access_person_friend'
];

const permissionEntityMap: {
    [k in AllPermissionType]: Partial<EntityModel<AccessType>> & { id: k };
} = {
    PERMISSION_FRIEND_ACQUAINTENCE: {
        id: 'PERMISSION_FRIEND_ACQUAINTENCE',
        type: 'access_person_friend',
        name: 'Acquaintence',
        description: 'Acquaintence'
    },

    PERMISSION_ADMIN: {
        id: 'PERMISSION_ADMIN',
        name: 'Admin',
        description: 'Admin'
    },
    PERMISSION_FRIEND_BEST: {
        id: 'PERMISSION_FRIEND_BEST'
    },
    PERMISSION_FRIEND_ENEMY: {
        id: 'PERMISSION_FRIEND_ENEMY'
    },
    PERMISSION_FRIEND_NEUTRAL: {
        id: 'PERMISSION_FRIEND_NEUTRAL'
    },
    PERMISSION_FRIEND_WORST: {
        id: 'PERMISSION_FRIEND_WORST'
    },
    PERMISSION_READ: {
        id: 'PERMISSION_READ'
    },
    PERMISSION_SUPER: {
        id: 'PERMISSION_SUPER'
    },
    PERMISSION_WRITE: {
        id: 'PERMISSION_WRITE'
    }
};

// const permissionEntityList = Object.values(permissionEntityMap);
// const permissionIdList = Object.values(permissionEntityMap).map((a) => a.id);

interface AccessParamsModel {
    idTo: string;
    idFrom: string;
    idType: AccessType;
}

type CreateDataModel = Partial<AllAccessDataModel> &
    Pick<
        AllAccessDataModel,
        'idType' | 'idTo' | 'idFrom' | 'permissionList' | 'stampStart'
    >;

type UpdateDataModel = Partial<
    Pick<
        AllAccessDataModel,
        'id' | 'permissionList' | 'stampStart' | 'stampEnd' | 'policyList'
    >
>;

export class AccessRdbService {
    readonly accessTable: RTable<Partial<AccessDataModel>>;
    private readonly waitingForAccessTypes: Promise<string[]>;
    constructor(private readonly rdbService: RdbService) {
        this.accessTable = this.rdbService.getTable('access');
        // we might want to get this from the db
        this.waitingForAccessTypes = Promise.resolve(accessTypeList);
    }

    async getAccessListByType(
        a: Partial<AccessParamsModel> & Pick<AccessParamsModel, 'idType'>
    ): Promise<AccessDataModel[]> {
        try {
            return (
                (await this.accessTable
                    .filter(a)
                    .run()
                    .then((a) => a.map(this.toData))) || []
            );
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getAccessById(id: string) {
        try {
            return await this.accessTable
                .get(id)
                .run()
                .then((a) => (a ? this.toData(a) : a));
        } catch (e) {
            console.error(e);
            return null;
        }
    }

    async accessCreate(
        accessData: CreateDataModel
    ): Promise<AccessDataModel | null> {
        // todo: check if account ownership exists and add SUPER permission
        if (!accessData.idTo) {
            console.error('Must include a "to" entity id');
            return null;
        }
        if (!accessData.idFrom) {
            console.error('Must include a "from" entity id');
            return null;
        }

        const accessTypes = await this.waitingForAccessTypes;
        if (!accessTypes.includes(accessData.idType)) {
            console.error('Invalid access type!');
            return null;
        }

        let data = this.toCreateData(accessData);
        try {
            data = await this.accessTable
                .insert(data)
                .run()
                .then((a) => {
                    if (accessData.id === '_new' && !a.generated_keys) {
                        throw new Error('No generated keys!');
                    }
                    const id = a.generated_keys
                        ? a.generated_keys[0]
                        : accessData.id;

                    return {
                        ...data,
                        id
                    };
                });
        } catch (e) {
            console.error(e);
            return null;
        }
        return this.toData(data);
    }

    toCreateData({
        id = '_new',
        idTo,
        idFrom,
        idType,
        permissionList,
        policyList,
        stampStart = new Date()
    }: CreateDataModel): Partial<AccessDataModel> {
        return {
            id: !id || id === '_new' ? undefined : id,
            idTo,
            idFrom,
            idType,
            permissionList,
            policyList,
            stampStart
        };
    }

    async accessUpdate(accessData: UpdateDataModel): Promise<boolean> {
        try {
            await this.accessTable
                .get(accessData.id)
                .update(this.toUpdateData(accessData))
                .run();
            return true;
        } catch (e) {
            return false;
        }
    }

    toUpdateData({
        stampEnd,
        permissionList = [],
        policyList = []
    }: UpdateDataModel): Partial<AccessDataModel> {
        return { stampEnd, permissionList, policyList };
    }

    async accessDelete(id: string): Promise<boolean> {
        try {
            await this.accessTable.get(id).delete().run();
            return true;
        } catch (e) {
            return false;
        }
    }

    toData({
        id = '',
        idType = 'access_group',
        idTo = '',
        idFrom = '',
        permissionList = [],
        policyList = [],
        stampStart = new Date()
    }: Partial<AccessDataModel>): AccessDataModel {
        return {
            id,
            stampStart,
            idType,
            idTo,
            idFrom,
            permissionList,
            policyList
        };
    }

    // read simply tests if there are any records with the type, since READ is assumed
    // if a record exists with the type, then the user has READ access
    async canRead(a: AccessParamsModel) {
        return await this.accessTable
            .filter(a)
            .run()
            .then((a) => !!a.length);
    }

    async canWrite(a: AccessParamsModel) {
        return await this.accessTable
            .filter(a)
            .run()
            .then(
                (a) =>
                    !!a.find((b) =>
                        b.permissionList?.includes('PERMISSION_WRITE')
                    )
            );
    }

    // TODO: add super access to the access record if accountid match since these are immutable
    // // super is a permission that only exists when an accountID matches
    // async hasSuperAccessTo(a: AccessParamsModel) {
    //     // todo: include entityservice and check accountId
    //     return false;
    // }

    // async entityHasSuperAccessTo(
    //     from: Partial<EntityModel>,
    //     to: Partial<EntityModel>
    // ) {
    //     // todo: include entityservice and check accountId
    //     return false;
    // }

    async hasAccessPermission(
        permissionIdList: AllPermissionType[],
        a: AccessParamsModel
    ) {
        return await this.accessTable
            .filter(a)
            .run()
            .then((b) =>
                this.existsPermissionOnAccessRecordList(
                    permissionIdList,
                    b as AccessDataModel[]
                )
            );
    }

    existsPermissionOnAccessRecordList<T extends AccessType = AccessType>(
        permissionIdList: Array<PermissionMapType[T]>,
        a: Array<AccessDataModel<T>>
    ): boolean {
        return !!a.find((b) =>
            permissionIdList.find((c) => b.permissionList.includes(c))
        );
    }
}
