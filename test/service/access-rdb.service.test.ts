import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';
import { AccessDataModel, AllAccessDataModel } from '../../src/model';

jest.setTimeout(20000);

describe('accessRdbService', () => {
    test('can we crud a person access record', async () => {
        const { accessRdbService } = await WaitForGuildServices;
        const access: AllAccessDataModel = {
            id: '_new',
            idTo: 'some-id-to',
            idFrom: 'some-id-from',
            idType: 'access_person_friend',
            permissionList: ['PERMISSION_FRIEND_ACQUAINTENCE'],
            policyList: [],
            stampStart: new Date()
        };
        // const discordPerson = await personRdbService.getByDiscordId('1234');
        const accessCreate = await accessRdbService.accessCreate(access);

        expect(accessCreate).not.toBeNull();

        expect(accessCreate?.idTo).toBe('some-id-to');

        expect(accessCreate?.idFrom).toBe('some-id-from');

        expect(accessCreate?.permissionList).toContain(
            'PERMISSION_FRIEND_ACQUAINTENCE'
        );

        // const {  } = await personRdbService.getRdbTables();
        // console.log(await entityPersonTable.run());
        const didUpdate = await accessRdbService.accessUpdate({
            id: accessCreate?.id,
            permissionList: ['PERMISSION_FRIEND_WORST']
        });

        expect(didUpdate).toBe(true);

        const updatedAccess = await accessRdbService.getAccessById(
            accessCreate?.id as string
        );

        const accessList = await accessRdbService.getAccessListByType({
            idType: 'access_person_friend'
        });

        expect(accessList.length).toBeGreaterThan(0);

        expect(updatedAccess?.permissionList).toContain(
            'PERMISSION_FRIEND_WORST'
        );
        expect(updatedAccess?.permissionList).not.toContain(
            'PERMISSION_FRIEND_ACQUAINTENCE'
        );

        const { idTo, idFrom, idType } = accessCreate as AccessDataModel;
        const hasReadAccess = await accessRdbService.canRead({
            idTo,
            idFrom,
            idType
        });
        expect(hasReadAccess).toBe(true);

        const hasReadAccessNOT = await accessRdbService.canRead({
            idTo,
            idFrom,
            idType: 'access_group_nm'
        });

        expect(hasReadAccessNOT).toBe(false);

        const didDelete = await accessRdbService.accessDelete(
            updatedAccess?.id as string
        );

        expect(didDelete).toBe(true);

        const deletedPerson = await accessRdbService.getAccessById(
            updatedAccess?.id as string
        );

        expect(deletedPerson).toBe(null);

        const deleteList = await accessRdbService.getAccessListByType({
            idType: 'access_person_friend'
        });
    });
});
