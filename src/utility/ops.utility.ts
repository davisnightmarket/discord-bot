import { roleMention, bold, userMention } from 'discord.js';

import { type NightModel } from '../service';

import { DAYS_OF_WEEK } from '../nm-const';
// import { type NmDayNameType, type GuildServiceModel } from '../model';
// import { type PersonModel, type PickUp } from '../service';

export const GetChannelDayToday = (date = new Date()) => {
    return DAYS_OF_WEEK[date.getDay()];
};
export const GetChannelDayYesterday = (date = new Date()) => {
    return DAYS_OF_WEEK[date.getDay() - 1] || DAYS_OF_WEEK[6];
};

export function GetAnnounceMessage(
    roleId: string,
    nightMap: NightModel
): string {
    return (
        `## ${getRandoSalute()} ${roleMention(roleId)}!\n` +
        '\n' +
        GetNightCapMessage(nightMap) +
        '\n' +
        GetHostMessage(nightMap) +
        '\n' +
        GetPickupsMessage(nightMap)
    );
}

const saluteList: string[] = ['Hellooo', 'Holla', 'Dear', 'Dearest', 'Darling'];
function getRandoSalute() {
    return saluteList[Math.floor(Math.random() * saluteList.length)];
}

// todo: use message service
export function GetPickupsMessage({ pickupList }: NightModel): string {
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
export function GetNightCapMessage({ day, hostList }: NightModel): string {
    const nightCapList = hostList.filter((a) => a.role === 'night-captain');
    if (!nightCapList.length) {
        return 'Night Cap NEEDED! Talk to a CC';
    }
    return `Night Captain${nightCapList.length > 1 ? 's' : ''}: ${nightCapList
        .map((p) => (p.discordId ? userMention(p.discordId) : p.name))
        .join(', ')}`;
}

// todo: use message service
export function GetHostMessage({ hostList }: NightModel): string {
    const a = hostList.filter((a) => a.role === 'night-host');
    return `Host${a.length > 1 ? 's' : ''}: ${a
        .map(
            ({ name, discordId }) =>
                `${bold(name)} ${discordId ? userMention(discordId) : ''}`
        )
        .join(', ')} `;
}
