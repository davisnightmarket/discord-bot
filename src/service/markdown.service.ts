import {
    PersonModel,
    type CoreDataService,
    ParseContentService,
    NightModel
} from '.';
import { DAYS_OF_WEEK, PARTS_OF_DAY } from '../const';
import { NmDayNameType, NmPartOfDayNameType } from '../model';
import { CreateMdMessage } from '../utility';

import { roleMention, bold, userMention } from 'discord.js';

import { NightPickupModel } from '../service';

// TODO: make this simple to user from events

const messageMap = {
    START_HOWTO: CreateMdMessage('START_HOWTO', {
        coreDocsList: '',
        marketDocsList: '',
        communityCoordinatorList: '',
        nightCaptainList: '',
        corePhoneNumber: '',
        marketPhoneNumber: ''
    }),
    GENERIC_OK: CreateMdMessage('GENERIC_OK', {}),
    GENERIC_SORRY: CreateMdMessage('GENERIC_SORRY', {
        techPhone: ''
    }),
    GENERIC_NO_PERSON: CreateMdMessage('GENERIC_NO_PERSON', {
        techPhone: ''
    }),
    PERMISSION_LIST: CreateMdMessage('PERMISSION_LIST', {
        permissionList: ''
    }),
    PERMISSION_EDIT: CreateMdMessage('PERMISSION_EDIT', {}),
    AVAILABILITY_LIST: CreateMdMessage('AVAILABILITY_LIST', {
        availabilityHostList: '',
        availabilityPickupList: ''
    }),
    AVAILABILITY_TO_PICKUP: CreateMdMessage('AVAILABILITY_TO_PICKUP', {
        dayName: ''
    }),
    AVAILABILITY_TO_HOST: CreateMdMessage('AVAILABILITY_TO_HOST', {}),

    VOLUNTEER_LIST: CreateMdMessage('VOLUNTEER_LIST', {
        dayName: '',
        dayChannelNameList: '',
        nightCapList: '',
        hostList: '',
        pickupList: '',
        myPickupList: ''
    }),
    VOLUNTEER_EDIT_ROLE: CreateMdMessage('VOLUNTEER_EDIT_ROLE', {
        roleName: '',
        roleDescription: '',
        hostList: ''
    }),
    // VOLUNTEER_EDIT_ROLE: CreateMdMessage('VOLUNTEER_EDIT_ROLE', {
    //     roleName: '',
    //     roleDescription: '',
    //     hostNames: ''
    // }),
    FOODCOUNT_INSERT: CreateMdMessage('FOODCOUNT_INSERT', {
        lbs: '',
        note: '',
        org: '',
        date: ''
    }),
    FOODCOUNT_INPUT_OK: CreateMdMessage('FOODCOUNT_INPUT_OK', {
        lbs: '',
        note: '',
        org: '',
        date: '',
        seconds: ''
    }),
    FOODCOUNT_HOWTO: CreateMdMessage('FOODCOUNT_HOWTO', {
        nightChannelNameList: '',
        foodcountExample: ''
    }),
    FOODCOUNT_REMINDER: CreateMdMessage('FOODCOUNT_REMINDER', {
        randoSalutation: '',
        dayName: '',
        pickupOrgList: '',
        tagUserList: ''
    })
};

// message service allows us to combine core data with event data to produce messages
export class MarkdownService {
    coreDataService: CoreDataService;
    md: typeof messageMap;

    constructor(coreDataService: CoreDataService) {
        this.coreDataService = coreDataService;

        this.md = messageMap;
    }
    // we can get any message
    getMessage<U extends keyof typeof messageMap>(k: U) {
        return this.md[k] as (typeof messageMap)[typeof k];
    }

    // or write a method per message so we can combine with core or market data etc.
    async getGenericSorry() {
        // here we can get data that goes on every message
        // like tech phone from core
        return this.md.GENERIC_SORRY({
            techPhone: ''
        });
    }

    async getGenericNoPerson() {
        // here we can get data that goes on every message
        // like tech phone from core
        return this.md.GENERIC_SORRY({
            techPhone: ''
        });
    }
    getGenericBulletList(list: { name: string }[]) {
        return list.map(({ name }) => `  - ${name}`).join('\n');
    }
    getPersonBulletList(personList: PersonModel[]) {
        return personList.map(({ name }) => `  - ${name}`).join('\n');
    }

    getPersonBulletListWithPhone(personList: PersonModel[]) {
        return personList
            .map(({ name, phone }) => `  - ${name} ${phone}`)
            .join('\n');
    }

    // turns person availability strings from spreadsheet into a md list of readable day and time
    getAvailabilityListsFromPerson(person: PersonModel): [string, string] {
        return [
            person.availabilityHost
                .split(',')
                .map((a) =>
                    a
                        .trim()
                        .split('|||')
                        .map((a) => a.trim())
                )
                .map(
                    (a) =>
                        `  - Host ${
                            DAYS_OF_WEEK[a[0] as NmDayNameType].name
                        } ${ParseContentService.getAmPmTimeFrom24Hour(a[1])}`
                )
                .join('\n'),
            person.availabilityPickup
                .split(',')
                .map((a) =>
                    a
                        .trim()
                        .split('|||')
                        .map((a) => a.trim())
                )
                .map(
                    (a) =>
                        `  - Pick-up ${
                            DAYS_OF_WEEK[a[0] as NmDayNameType].name
                        } ${PARTS_OF_DAY[a[1] as NmPartOfDayNameType].name}`
                )
                .join('\n')
        ];
    }

    getPickupJoinMessage(pickupList: NightPickupModel[]) {
        return pickupList
            .map(
                ({ org, timeStart, personList }) =>
                    `## ${org} at ${timeStart} with ${personList
                        .map((a) => a.name)
                        .join(', ')} `
            )
            .join('\n');
    }

    getAnnounceMessage(roleId: string, nightMap: NightModel): string {
        return (
            `## ${this.getRandoSalute()} ${roleMention(roleId)}!\n` +
            '\n' +
            this.getNightCapMessage(nightMap) +
            '\n' +
            this.getHostMessage(nightMap) +
            '\n' +
            this.getPickupsMessage(nightMap)
        );
    }

    getRandoSalute() {
        const saluteList: string[] = [
            'Hellooo',
            'Holla',
            'Dear',
            'Dearest',
            'Darling'
        ];

        return saluteList[Math.floor(Math.random() * saluteList.length)];
    }
    // todo: use message service
    getAfterMarketMessage(roleId: string, { pickupList }: NightModel): string {
        return `## ${roleMention(
            roleId
        )}!\nNight herstory has been recorded! New night list: \n${pickupList
            .map(({ org, timeStart, personList }) => {
                return (
                    '>> ' +
                    org +
                    ' ' +
                    timeStart +
                    ' ' +
                    personList
                        .map(
                            ({ name, discordId }) =>
                                `${bold(name)} ${
                                    discordId ? userMention(discordId) : ''
                                }`
                        )
                        .join(', ')
                );
            })
            .join('\n')}`;
    }
    // todo: use message service
    getPickupsMessage({ pickupList }: NightModel): string {
        return `Pickups\n${pickupList
            .map(({ org, timeStart, personList }) => {
                return (
                    '>> ' +
                    org +
                    ' ' +
                    timeStart +
                    ' ' +
                    personList
                        .map(
                            ({ name, discordId }) =>
                                `${bold(name)} ${
                                    discordId ? userMention(discordId) : ''
                                }`
                        )
                        .join(', ')
                );
            })
            .join('\n')}`;
    }

    // todo: use message service
    getNightCapMessage({ day, hostList }: NightModel): string {
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');
        if (!nightCapList.length) {
            return 'Night Cap NEEDED! Talk to a CC';
        }
        return `Night Captain${
            nightCapList.length > 1 ? 's' : ''
        }: ${nightCapList
            .map((p) => (p.discordId ? userMention(p.discordId) : p.name))
            .join(', ')}`;
    }

    // todo: use message service
    getHostMessage({ hostList }: NightModel): string {
        const a = hostList.filter((a) => a.role === 'night-host');
        return `Host${a.length > 1 ? 's' : ''}: ${a
            .map(
                ({ name, discordId }) =>
                    `${bold(name)} ${discordId ? userMention(discordId) : ''}`
            )
            .join(', ')} `;
    }
}
