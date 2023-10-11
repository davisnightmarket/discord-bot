import { Client, Guild } from 'discord.js';
import { NIGHT_CHANNEL_NAMES_MAP, PersonModel } from '../service';
import {
    Dbg,
    GetChannelDayToday,
    GetChannelDayYesterday,
    GetGuildServices
} from '../utility';
import { DAYS_OF_WEEK } from '../const';

const dbg = Dbg('FoodCountReminderJob');

export const FoodCountReminderJob = (client: Client) => async () => {
    dbg('OK');
    const guildList = client.guilds.cache.map((guild) => guild);

    // first we want to know what day it is
    const dateYesterday = new Date(new Date().getDate() - 1);
    const today = GetChannelDayToday();
    const yesterday = GetChannelDayYesterday();
    // did we do it right?
    console.log(today);
    console.log(yesterday);

    // now we send a message to each channel in each guild
    for (const guild of guildList) {
        const {
            messageService,
            nightDataService,
            foodCountDataService,
            personDataService
        } = await GetGuildServices(guild.id);
        // next we want a list of all pickups this year so far (or at least a month back)
        // then we want to search back through them, and get only those that happened last night
        // if that number is zero, then we want to send a gentle reminder to the channel for that day

        const yesterdayFoodCountList =
            await foodCountDataService.getFoodCountByDate(dateYesterday);
        const yesterdayPickupList =
            await nightDataService.getNightTimelineListByDate(dateYesterday);
        // this means there were pickups scheduled, but no food was counted
        if (!yesterdayFoodCountList.length && !!yesterdayPickupList.length) {
            const pickupOrgList = yesterdayFoodCountList
                .map((a) => a.org)
                .join(', ');
            const tagUserList = (
                await Promise.all(
                    yesterdayPickupList.map((a) =>
                        personDataService.getPersonByEmailOrDiscordId(
                            a.discordIdOrEmail
                        )
                    )
                )
            )
                .filter((a) => a)

                // tag them if possible
                .map((a) =>
                    a?.discordId
                        ? '<@' + a.discordId + '>'
                        : (a as PersonModel).name
                )
                .join(', ');

            const channel = guild.channels.cache.find(
                (a) => a.name === yesterday
            );
            // todo: these are message worthy loggables
            if (!channel) {
                console.error(
                    `Missing channel ${yesterday} from guild ${guild.id}`
                );
                continue;
            }
            if (!channel.isTextBased()) {
                console.error(
                    `Channel ${yesterday} from guild ${guild.id} is not isTextBased`
                );
                continue;
            }
            channel.send({
                content: [
                    await messageService.m.FOODCOUNT_REMINDER({
                        randoSalutation: 'Helloo!',
                        dayName: DAYS_OF_WEEK[yesterday].name,
                        pickupOrgList,
                        tagUserList
                    }),
                    'Reminder:',
                    await messageService.m.FOODCOUNT_HOWTO({
                        nightChannelNameList: Object.keys(
                            NIGHT_CHANNEL_NAMES_MAP
                        ).join(', '),
                        foodcountExample: 'davis food coop 3'
                    })
                ].join('\n')
            });
        }
    }
};
