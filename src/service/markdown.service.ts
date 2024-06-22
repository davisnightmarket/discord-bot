import {
    type PersonSheetModel,
    ParseContentService,
    type NightMarketModel,
    type NightMapModel,
    type GoogleDriveService
} from '.';
import { DAYS_OF_WEEK } from '../const';
import { type NmDayNameType } from '../model';
import { CreateMdMessage } from '../utility';

import { roleMention, bold, userMention } from 'discord.js';

import { type NightPickupModel } from '../service';
import type { PersonModel } from '../model/person.model';

// TODO: make this simple to use from events

const mdMap = {
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
    md: typeof mdMap;

    constructor(private readonly googleDriveService: GoogleDriveService) {
        this.md = mdMap;
        this.googleDriveService.getNmInstanceMarkdownFiles().then(console.log);
    }

    // we can get any message
    getMessage<U extends keyof typeof mdMap>(k: U) {
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

    getPersonBulletList(personList: PersonSheetModel[]) {
        return personList.map(({ name }) => `  - ${name}`).join('\n');
    }

    getPersonBulletListWithPhone(personList: PersonSheetModel[]) {
        return personList
            .map(({ name, phone }) => `  - ${name} ${phone}`)
            .join('\n');
    }

    // turns person availability strings from spreadsheet into a md list of readable day and time
    getAvailabilityListsFromPerson(person: PersonModel): [string, string] {
        return [
            Object.keys(person.attrAvailabilityHostMap)

                .map(
                    (a) =>
                        `  - Host ${
                            DAYS_OF_WEEK[
                                a
                                    .replace('AVAILABLE_', '')
                                    .toLowerCase() as NmDayNameType
                            ]?.name
                        } ${ParseContentService.getAmPmTimeFrom24Hour(a[1])}`
                )
                .join('\n'),
            Object.keys(person.attrAvailabilityPickupMap)
                .map(
                    (a) =>
                        `  - Host ${
                            DAYS_OF_WEEK[
                                a
                                    .replace('AVAILABLE_', '')
                                    .toLowerCase() as NmDayNameType
                            ]?.name
                        } ${ParseContentService.getAmPmTimeFrom24Hour(a[1])}`
                )
                .join('\n')
        ];
    }

    getPickupJoinMessage(pickupList: NightPickupModel[]) {
        return pickupList
            .map(
                ({ orgPickup, timeStart, personList }) =>
                    `## ${orgPickup} at ${ParseContentService.getAmPmTimeFrom24Hour(
                        timeStart
                    )} with ${personList.map((a) => a.name).join(', ')} `
            )
            .join('\n');
    }

    getNightMapEphemeral(
        discordId: string,
        { day, marketList }: NightMapModel
    ): string {
        return (
            `## ${DAYS_OF_WEEK[day].name}:\n` +
            '\n' +
            marketList
                .map((a) => this.getNightOpsEphemeral(day, discordId, a))
                .join('\n\n')
        );
    }

    getNightOpsEphemeral(
        day: NmDayNameType,
        discordId: string,
        nightMarket: NightMarketModel
    ): string {
        return (
            this.getNightCapEphemeral(discordId, nightMarket) +
            '\n' +
            this.getDistroEphemeral(discordId, nightMarket) +
            '\n' +
            this.getPickupsEphemeral(discordId, nightMarket)
        );
    }

    getNightMapAnnounce(
        roleId: string,
        { day, marketList }: NightMapModel
    ): string {
        return (
            `## ${roleMention(roleId)} \n` +
            '\n' +
            marketList
                .map((a) => this.getNightOpsAnnounce(roleId, a))
                .join('\n\n')
        );
    }

    getNightOpsAnnounce(roleId: string, market: NightMarketModel): string {
        return (
            this.getNightCapAnnounce(market) +
            '\n' +
            this.getDistroAnnounce(market) +
            '\n' +
            this.getPickupsAnnounce(market) +
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
    getAfterMarketAnnounce(
        roleId: string,
        { pickupList }: NightMarketModel
    ): string {
        return `## ${roleMention(
            roleId
        )}!\nNight herstory has been recorded! New night list: ${pickupList
            .map(({ orgPickup, timeStart, personList }) => {
                return (
                    '\n>' +
                    orgPickup +
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

    getPickupsAnnounce({ pickupList }: NightMarketModel): string {
        return `Pick-up${pickupList.length === 1 ? '' : 's'}:\n> ${pickupList
            .map(({ orgPickup, timeStart, personList }) => {
                console.log(orgPickup, timeStart, personList);
                return (
                    orgPickup +
                    ' ' +
                    ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                    ' ' +
                    (personList.length
                        ? personList
                              .map(
                                  ({ name, discordId }) =>
                                      `${bold(name)} ${
                                          discordId
                                              ? userMention(discordId)
                                              : ''
                                      }`
                              )
                              .join(', ')
                        : bold('HELP NEEDED!'))
                );
            })
            .join('\n> ')}`;
    }

    getNightCapAnnounce({ hostList, statusList }: NightMarketModel): string {
        // todo: this logic needs improvement
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');
        if (statusList.includes('NEEDED_CAP')) {
            return 'Night Cap NEEDED!';
        }

        return `Night Captain${
            nightCapList.length === 1 ? '' : 's'
        }: ${nightCapList
            .map(({ discordId, name }) =>
                discordId ? userMention(discordId) : bold(name)
            )
            .join(', ')}`;
    }

    // todo: use message service
    getDistroAnnounce({ hostList, statusList }: NightMarketModel): string {
        if (statusList.includes('NEEDED_DISTRO')) {
            return 'Distro help NEEDED!';
        }
        const a = hostList.filter((a) => a.role === 'night-distro');
        return `Distro: ${
            a.length
                ? a
                      .map(
                          ({ name, discordId }) =>
                              `${
                                  discordId
                                      ? userMention(discordId)
                                      : bold(name)
                              }`
                      )
                      .join(', ')
                : bold('HELP NEEDED!')
        } `;
    }

    getMyDistros(discordId: string, { marketList }: NightMapModel) {
        const hostList = [...marketList.map((a) => a.hostList)]
            .flat()
            .filter((a) => a.discordIdOrEmail === discordId);
        return `Current distro${hostList.length === 1 ? '' : 's'}:\n> ${hostList
            .map(({ orgMarket, timeStart }) => {
                return (
                    (orgMarket as string) +
                    ' ' +
                    ParseContentService.getAmPmTimeFrom24Hour(
                        timeStart as string
                    )
                );
            })
            .join('\n> ')}`;
    }

    getMyPickups(discordId: string, { marketList }: NightMapModel) {
        const pickupList = [...marketList.map((a) => a.pickupList)].flat();
        return `Current pick-up${
            pickupList.length === 1 ? '' : 's'
        }:\n> ${pickupList
            .filter((a) =>
                a.personList.some((b) => b.discordIdOrEmail === discordId)
            )
            .map(({ orgPickup, timeStart, personList }) => {
                return (
                    orgPickup +
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
            })
            .join('\n> ')}`;
    }

    getPickupsEphemeral(
        discordId: string,
        { pickupList, statusList }: NightMarketModel
    ): string {
        return `Pick-up${pickupList.length === 1 ? '' : 's'}${
            statusList.includes('NEEDED_PICKUP') ? ' HELP NEEDED' : ''
        }:${pickupList
            .map(({ orgPickup, timeStart, personList }) => {
                return (
                    orgPickup +
                    ' ' +
                    ParseContentService.getAmPmTimeFrom24Hour(timeStart) +
                    ' ' +
                    (personList.length
                        ? personList
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
                        : bold('HELP NEEDED!'))
                );
            })
            .join('\n')}`;
    }

    getNightCapEphemeral(
        discordId: string,
        { hostList, statusList }: NightMarketModel
    ): string {
        if (statusList.includes('NEEDED_CAP')) {
            return 'Night Cap: HELP NEEDED!';
        }
        // todo: this logic needs improvement
        const nightCapList = hostList.filter((a) => a.role === 'night-captain');

        return `Night Captain${nightCapList.length > 1 ? 's' : ''}: ${
            nightCapList.length
                ? nightCapList
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
                : bold('HELP NEEDED!')
        }`;
    }

    // todo: use message service
    getDistroEphemeral(
        discordId: string,
        { hostList, statusList }: NightMarketModel
    ): string {
        if (statusList.includes('NEEDED_DISTRO')) {
            return 'Distro: HELP NEEDED!';
        }
        const a = hostList.filter((a) => a.role === 'night-distro');
        return `Distro: ${
            a.length
                ? a
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
                : bold('HELP NEEDED!')
        } `;
    }
}
