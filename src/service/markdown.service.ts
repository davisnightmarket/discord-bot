import {
    type PersonModel,
    type CoreDataService,
    ParseContentService,
    type NightModel
} from '.';
import { DAYS_OF_WEEK, PARTS_OF_DAY } from '../const';
import { type NmDayNameType, type NmPartOfDayNameType } from '../model';
import { CreateMdMessage } from '../utility';

import { roleMention, bold, userMention } from 'discord.js';

import { type NightPickupModel } from '../service';

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
    AVAILABILITY_TO_PICKUP: CreateMdMessage('AVAILABILITY_TO_PICKUP', {}),
    AVAILABILITY_TO_PICKUP_ON_DAY: CreateMdMessage(
        'AVAILABILITY_TO_PICKUP_ON_DAY',
        {
            dayName: ''
        }
    ),
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
        return this.md[k];
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

    getGenericBulletList(list: Array<{ name: string }>) {
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
            person.availabilityHostList
                .split(',')
                .filter((a) => a.trim())
                .map((a) =>
                    a
                        .trim()
                        .split('|||')
                        .map((a) => a.trim())
                )
                .map(
                    (a) =>
                        `  - Host ${
                            DAYS_OF_WEEK[a[0] as NmDayNameType]?.name
                        } ${ParseContentService.getAmPmTimeFrom24Hour(a[1])}`
                )
                .join('\n'),
            person.availabilityPickupList
                .split(',')
                .filter((a) => a.trim())
                .map((a) =>
                    a
                        .trim()
                        .split('|||')
                        .map((a) => a.trim())
                )
                .map(
                    (a) =>
                        `  - Pick-up ${
                            DAYS_OF_WEEK[a[0] as NmDayNameType]?.name
                        } ${PARTS_OF_DAY[a[1] as NmPartOfDayNameType]?.name}`
                )
                .join('\n')
        ];
    }

    getPickupJoinMessage(pickupList: NightPickupModel[]) {
        return pickupList
            .map(
                ({ org, timeStart, personList }) =>
                    `## ${org} at ${ParseContentService.getAmPmTimeFrom24Hour(
                        timeStart
                    )} with ${personList.map((a) => a.name).join(', ')} `
            )
            .join('\n');
    }

    getNightOpsEphemeral(
        day: NmDayNameType,
        discordId: string,
        nightMap: NightModel
    ): string {
        return (
            `## ${DAYS_OF_WEEK[day].name}:\n` +
            '\n' +
            this.getNightCapEphemeral(discordId, nightMap) +
            '\n' +
            this.getDistroEphemeral(discordId, nightMap) +
            '\n' +
            this.getPickupsEphemeral(discordId, nightMap)
        );
    }

    getNightOpsAnnounce(roleId: string, nightMap: NightModel): string {
        return (
            `## ${roleMention(roleId)}\n` +
            '\n' +
            this.getNightCapAnnounce(nightMap) +
            '\n' +
            this.getDistroAnnounce(nightMap) +
            '\n' +
            this.getPickupsAnnounce(nightMap) +
            '\n\n Love, Crabapple'
        );
    }

    getRandoChannelSalute(channelName: string) {
        const saluteList: string[] = [
            `Pardon Me ${roleMention(channelName)}, my dear ol' chap,`,
            `Dearest Darling ${roleMention(channelName)},`,
            `Sup ${roleMention(channelName)} Dogz`
        ];

        return saluteList[Math.floor(Math.random() * saluteList.length)];
    }

    // todo: use message service
    getAfterMarketAnnounce(roleId: string, { pickupList }: NightModel): string {
        return `## ${roleMention(
            roleId
        )}!\nNight herstory has been recorded! New night list: ${pickupList
            .map(({ org, timeStart, personList }) => {
                return (
                    '\n>' +
                    org +
                    ' ' +
                    ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
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

    getPickupsAnnounce({ pickupList }: NightModel): string {
        return `Pick-up${pickupList.length === 1 ? '' : 's'}: ${pickupList.map(
            ({ org, timeStart, personList }) => {
                return (
                    '\n> ' +
                    org +
                    ' ' +
                    ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
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
            }
        )}`;
    }

    getNightCapAnnounce({ hostList, statusList }: NightModel): string {
        // todo: this logic needs improvement
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');
        if (statusList.includes('NEEDED_CAP')) {
            return 'Night Cap NEEDED!';
        }

        return `Night Captain${
            nightCapList.length === 1 ? '' : 's'
        }: ${nightCapList
            .map((p) => (p.discordId ? userMention(p.discordId) : p.name))
            .join(', ')}`;
    }

    // todo: use message service
    getDistroAnnounce({ hostList, statusList }: NightModel): string {
        if (statusList.includes('NEEDED_DISTRO')) {
            return 'Distro help NEEDED!';
        }
        const a = hostList.filter((a) => a.role === 'night-distro');
        return `Host${a.length > 1 ? 's' : ''}: ${a
            .map(
                ({ name, discordId }) =>
                    `${discordId ? userMention(discordId) : bold(name)}`
            )
            .join(', ')} `;
    }

    getMyPickups(discordId: string, { pickupList }: NightModel) {
        return `Current pick-up${
            pickupList.length === 1 ? '' : 's'
        }:${pickupList
            .filter((a) =>
                a.personList.some((b) => b.discordIdOrEmail === discordId)
            )
            .map(({ org, timeStart, personList }) => {
                return (
                    '\n> ' +
                    org +
                    ' ' +
                    ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                    ' ' +
                    personList
                        .map(
                            (a) =>
                                `${
                                    discordId
                                        ? userMention(a.discordId)
                                        : bold(a.name)
                                } ${
                                    a.periodStatus === 'SHADOW'
                                        ? '(Shadow Mode)'
                                        : ''
                                }`
                        )
                        .join(', ')
                );
            })}`;
    }

    getPickupsEphemeral(
        discordId: string,
        { pickupList, statusList }: NightModel
    ): string {
        return `Pick-up${pickupList.length === 1 ? '' : 's'}${
            statusList.includes('NEEDED_PICKUP') ? ' HELP NEEDED' : ''
        }:${pickupList.map(({ org, timeStart, personList }) => {
            return (
                '\n> ' +
                org +
                ' ' +
                ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                ' ' +
                personList
                    .map(
                        (a) =>
                            `${bold(a.name)} ${
                                discordId === a.discordId
                                    ? `(YOU${
                                          a.periodStatus === 'SHADOW'
                                              ? ', Shadow Mode'
                                              : ''
                                      })`
                                    : ''
                            }`
                    )
                    .join(', ')
            );
        })}`;
    }

    getNightCapEphemeral(
        discordId: string,
        { hostList, statusList }: NightModel
    ): string {
        if (statusList.includes('NEEDED_CAP')) {
            return 'Night Cap: HELP NEEDED!';
        }
        // todo: this logic needs improvement
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');

        return `Night Captain${
            nightCapList.length > 1 ? 's' : ''
        }: ${nightCapList
            .map(
                (a) =>
                    `${bold(a.name)} ${
                        discordId === a.discordId
                            ? `(YOU${
                                  a.periodStatus === 'SHADOW'
                                      ? ', Shadow Mode'
                                      : ''
                              })`
                            : ''
                    }`
            )
            .join(', ')}`;
    }

    // todo: use message service
    getDistroEphemeral(
        discordId: string,
        { hostList, statusList }: NightModel
    ): string {
        if (statusList.includes('NEEDED_DISTRO')) {
            return 'Distro: HELP NEEDED!';
        }
        const a = hostList.filter((a) => a.role === 'night-distro');
        return `Host${a.length === 1 ? '' : 's'}: ${a
            .map(
                (a) =>
                    `${bold(a.name)} ${
                        discordId === a.discordId
                            ? `(YOU${
                                  a.periodStatus === 'SHADOW'
                                      ? ', Shadow Mode'
                                      : ''
                              })`
                            : ''
                    }`
            )
            .join(', ')} `;
    }
}
