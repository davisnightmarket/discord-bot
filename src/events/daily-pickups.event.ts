import {
    roleMention,
    type Guild,
    bold,
    userMention,
    type ChatInputCommandInteraction,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    type ButtonInteraction,
    type Interaction,
    type Client
} from 'discord.js';
import { OpsModel, type PersonModel } from '../service';
import {
    GetChannelByName,
    GetChannelDayToday,
    GetGuildRoleIdByName
} from '../utility';
import { type NmDayNameType, type GuildServiceModel } from '../model';

type OpsWithPersonModel = OpsModel & {
    personList: PersonModel[];
};

type OpsWithPersonListModel = {
    [k in NmDayNameType]: OpsWithPersonModel[];
};

// Let's keep a cache of role operations in here, because we will know when it gets updated in this module
let pickupsCache: OpsWithPersonListModel;

// get a fresh set of ops
async function pickupsCacheRefresh({
    opsDataService,
    personCoreService
}: Pick<GuildServiceModel, 'opsDataService' | 'personCoreService'>) {
    const a = (await opsDataService.getOpsByDay())
        .filter((a) => a.role === 'night-pickup')
        .reduce((a, b) => {
            if (!a[b.day as NmDayNameType]) {
                a[b.day as NmDayNameType] = [];
            }
            a[b.day as NmDayNameType].push({
                ...b,
                personList: []
            });
            return a;
        }, {} as OpsWithPersonListModel);

    for (const b of Object.values(a)) {
        for (const c in b) {
            b[c].personList = [
                // todo: lets make these individual rows in the sheet
                await personCoreService.getPersonByEmailOrDiscordId(
                    b[c].volunteer1
                ),
                await personCoreService.getPersonByEmailOrDiscordId(
                    b[c].volunteer1
                ),
                await personCoreService.getPersonByEmailOrDiscordId(
                    b[c].volunteer1
                )
            ].filter((a) => a) as PersonModel[];
        }
    }
}

export const PickupChangeEvent = async (
    { opsDataService, personCoreService }: GuildServiceModel,
    interaction: Interaction
) => {
    if (!pickupsCache) {
        pickupsCacheRefresh({ opsDataService, personCoreService });
    }

    // Is this our interaction to deal with?
    interaction = interaction as ButtonInteraction;
    const { customId } = interaction;
    if (!customId) return;
    const [name, day] = customId.split('--');
    if (name !== 'pickups-refresh') return;

    const guild = interaction.guild;
    if (!guild) return;

    // regenerate the message

    const channelDay = GetChannelDayToday();

    const content = createPickupsMessage(
        await GetGuildRoleIdByName(guild, channelDay),
        pickupsCache[channelDay]
    );

    // update it
    interaction.message.edit(content);
};

export async function PickupsListRequestEvent(
    { opsDataService, personCoreService }: GuildServiceModel,
    guild: Guild,
    interaction?: ChatInputCommandInteraction
) {
    if (!pickupsCache) {
        pickupsCacheRefresh({ opsDataService, personCoreService });
    }

    const channelDay = GetChannelDayToday();

    const content = createPickupsMessage(
        await GetGuildRoleIdByName(guild, channelDay),
        pickupsCache[channelDay]
    );
    if (interaction) {
        // TODO: instead of a button which will get lost, we might want to simply send an announce to the night cap
        // when a person has taken a role
        const refreshButton = new ButtonBuilder()
            .setCustomId(`pickups-refresh--${channelDay}`)
            .setLabel('Refresh')
            .setStyle(ButtonStyle.Secondary);

        const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
            refreshButton
        );

        interaction.reply({
            content,
            components: [row]
        });
    } else {
        const channel = GetChannelByName(guild, channelDay);
        channel.send(content);
    }
}

function createPickupsMessage(
    roleId: string,
    ops: OpsWithPersonModel[]
): string {
    let message = `## ${roleMention(roleId)} pickups!\n\n`;
    ops.filter((op) => op.role === 'night-pickup').forEach((op) => {
        message += `${bold(op.org)} at ${op.time}\n`;
        op.personList
            .filter((a) => a)
            .forEach((person) => {
                message += `> ${bold(person.name)} ${
                    person.discordId ? userMention(person.discordId) : ''
                }\n`;
            });
    });
    return message;
}

// async function createTodaysPickupThread(guild: Guild) {
//     const channel = GetChannelByName(guild, GetChannelDayToday());
//     const name = `${new Date().getDate()}/${new Date().getMonth()} pickups`;
//     return await channel.threads.create({ name });
// }
