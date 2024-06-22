import { describe, expect, test, jest } from '@jest/globals';
import { WaitForGuildServices } from '../guild-services';

jest.setTimeout(20000);

describe('personRdbService', () => {
    test('can we crud a person entity', async () => {
        const { personRdbService } = await WaitForGuildServices;
        // const discordPerson = await personRdbService.getByDiscordId('1234');
        const person = await personRdbService.createDiscordPersonEntity({
            discordId: '1234',
            name: 'Marty McFly'
        });
        expect(person.id).toBe('discordId-1234');
        expect(person.name).toBe('Marty McFly');
        // const {  } = await personRdbService.getRdbTables();
        // console.log(await entityPersonTable.run());
        const didUpdate = await personRdbService.updatePersonEntity({
            id: 'discordId-1234',
            name: 'Bob Dylan'
        });
        expect(didUpdate).toBe(true);
        const updatedPerson = await personRdbService.getPersonEntityByDiscordId(
            '1234'
        );
        const personEntityList = await personRdbService.getPersonEntityList();
        expect(personEntityList.length).toBeGreaterThan(0);

        expect(updatedPerson?.id).toBe('discordId-1234');
        expect(updatedPerson?.name).toBe('Bob Dylan');

        const didDelete = await personRdbService.deletePersonEntityByDiscordId(
            '1234'
        );
        expect(didDelete).toBe(true);
        const deletedPerson = await personRdbService.getPersonEntityByDiscordId(
            '1234'
        );
        expect(deletedPerson).toBe(null);
    });

    test('can we crud a person with extended data', async () => {
        const { personRdbService } = await WaitForGuildServices;
        // const discordPerson = await personRdbService.getByDiscordId('1234');
        const person = await personRdbService.createPerson({
            id: 'discordId-1234',
            idAccount: 'test',
            email: 'c@d.com',
            phone: '4300000000',
            contactList: [],
            discordId: '1234',
            name: 'Marty McFly',
            description: 'A time traveler',
            stampCreate: new Date(),
            pronounList: ['he', 'him', 'his']
        });

        expect(person?.id).toBe('discordId-1234');
        expect(person?.name).toBe('Marty McFly');
        expect(person?.pronounList).toContain('him');
        // const { entityPersonTable } = await personRdbService.getRdbTables();
        // console.log(await entityPersonTable.run());
        const didUpdate = await personRdbService.updatePerson({
            id: 'discordId-1234',
            name: 'Bob Dylan',
            pronounList: ['be', 'bae', 'boo', 'bum']
        });
        expect(didUpdate).toBe(true);
        const updatedPerson = await personRdbService.getByDiscordId('1234');

        expect(updatedPerson?.id).toBe('discordId-1234');
        expect(updatedPerson?.name).toBe('Bob Dylan');
        expect(updatedPerson?.pronounList).toContain('bae');

        const didDelete = await personRdbService.deletePersonByDiscordId(
            '1234'
        );
        expect(didDelete).toBe(true);
        const deletedPerson = await personRdbService.getPersonEntityByDiscordId(
            '1234'
        );
        expect(deletedPerson).toBe(null);
    });
});
