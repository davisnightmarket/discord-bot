import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    Events,
    Interaction,
    ModalSubmitInteraction,
    StringSelectMenuInteraction
} from 'discord.js';
import { GetGuildServices, Dbg } from '../utility';
import {
    AvailabilityCommandEvent,
    AvailabilityEditButtonEvent,
    PermissionEditSelectEvent,
    VolunteerCommandEvent,
    VolunteerInitButtonEvent,
    WelcomeEvent,
    IdentityCommandEvent,
    IdentityEditModalEvent,
    HelpAndDocsCommandEvent,
    PermissionCommandEvent,
    FoodCountDeleteButtonEvent,
    PermissionButtonEvent,
    AvailabilityEditSelectEvent,
    VolunteerPickupSaveSelectEvent,
    VolunteerEditPickupButtonEvent
} from '../events';
import { NmDayNameType, NmNightRoleType } from '../model';

const dbg = Dbg('RouteInteraction');

export async function RouteInteraction(interaction: Interaction) {
    dbg(Events.InteractionCreate);
    interaction = interaction as ChatInputCommandInteraction;

    const services = await GetGuildServices(interaction.guildId ?? '');
    if (interaction?.isCommand()) {
        let command = 'NONE';
        try {
            command = interaction.options.getString('command') || 'NONE';
        } catch (e) {
            dbg('NO command found');
        }

        dbg(`Command: ${command}`);
        if (interaction?.commandName == 'nm') {
            dbg('/nm Command');

            if (command === 'volunteer') {
                VolunteerCommandEvent(
                    services,
                    interaction,
                    interaction.user.id
                );
            }
            // ToDO: automate this
            if (command === 'availability') {
                dbg('Editing Availability');
                AvailabilityCommandEvent(
                    services,
                    interaction,
                    interaction.user.id
                );
            }
            if (command === 'permission') {
                dbg('Editing permission');
                PermissionCommandEvent(
                    services,
                    interaction,
                    interaction.user.id
                );
            }
            if (command === 'identity') {
                dbg('Editing identity');
                IdentityCommandEvent(
                    services,
                    interaction,
                    interaction.user.id
                );
            }

            if (command === 'help-and-docs') {
                dbg('help-and-docs');
                HelpAndDocsCommandEvent(services, interaction);
            }
        }

        // restrict to community coordinator
        if (interaction?.commandName == 'cc') {
            dbg('/cc Command');
            // todo: make sure they are a CC
            // todo: we don't want to rely on discord role records, we want to geth from the admin sheet of the night spreadsheet

            // const { nightDataService } = services;
            // const ccList = await nightDataService.getCommunityCoordinatorList();
            // if(!ccList.map(a=>a.discordId).includes(interaction.user.id)){
            // show how to become a cc message and return
            // return
            //}

            const target = interaction.options.getUser('target');
            if (!command) {
                interaction.reply(' CC how-to docs and help coming soon!');
                return;
            }
            if (!target) {
                interaction.reply(`CC ${command} how-to coming soon!`);
                return;
            }

            if (command === 'volunteer') {
                VolunteerCommandEvent(services, interaction, target.id);
            }

            if (command === 'availability') {
                dbg('Editing Availability');
                AvailabilityCommandEvent(services, interaction, target.id);
            }
            if (command === 'permission') {
                dbg('Editing permission');
                PermissionCommandEvent(services, interaction, target.id);
            }
            if (command === 'identity') {
                dbg('Editing identity');
                IdentityCommandEvent(services, interaction, target.id);
            }
        }
    }
    // we can lump these two together since they are both routed by customId
    else if (
        interaction.isStringSelectMenu() ||
        interaction.isButton() ||
        interaction.isModalSubmit()
    ) {
        const args = (interaction as ButtonInteraction).customId.split('--');
        // by convention, the last arg is the discordId
        const discordId = args.pop() as string;
        const command = args[0];

        dbg(
            'Modal, Button or Select!',
            command,
            discordId,
            (interaction as StringSelectMenuInteraction).isStringSelectMenu()
                ? 'isStringSelectMenu'
                : 'isButton'
        );

        if ((interaction as ModalSubmitInteraction).isModalSubmit()) {
            dbg('isModalSubmit');

            IdentityEditModalEvent(
                services,
                interaction as ModalSubmitInteraction,
                discordId,
                args as [string]
            );
        }

        if ((interaction as StringSelectMenuInteraction).isStringSelectMenu()) {
            dbg('isStringSelectMenu');
            PermissionEditSelectEvent(
                services,
                interaction as StringSelectMenuInteraction,
                discordId,
                args as [string, 'edit', NmDayNameType]
            );
            AvailabilityEditSelectEvent(
                services,
                interaction as StringSelectMenuInteraction,
                discordId,
                args as [string, NmNightRoleType, NmDayNameType]
            );

            VolunteerPickupSaveSelectEvent(
                services,
                interaction as StringSelectMenuInteraction,
                args as [string, NmDayNameType, NmNightRoleType, string]
            );
        }

        if ((interaction as ButtonInteraction).isButton()) {
            dbg('isButton');

            FoodCountDeleteButtonEvent(
                interaction as ButtonInteraction,
                args as [string, string]
            );

            AvailabilityEditButtonEvent(
                services,
                interaction as ButtonInteraction,
                discordId,
                args as [string, 'init', NmDayNameType]
            );

            PermissionButtonEvent(
                services,
                interaction as ButtonInteraction,
                discordId,
                args as [string, 'revoke' | 'start', NmDayNameType]
            );

            VolunteerInitButtonEvent(
                services,
                interaction as ButtonInteraction,
                discordId,
                args as [string, NmDayNameType, NmNightRoleType, string]
            );

            VolunteerEditPickupButtonEvent(
                services,
                interaction as ButtonInteraction,
                args as [string, NmDayNameType, NmNightRoleType, string]
            );
        }
    }
}