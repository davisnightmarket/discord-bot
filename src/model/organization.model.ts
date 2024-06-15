import type {
    NightMarketEntityModel,
    OrganizationEntityModel,
    PersonDataModel
} from '.';

export interface OrganizationDataModel {
    id: string;
    phone: string;
    email: string;
    discordId: string;
    pronounList: string;
    contactPersonIdList: Array<{ id: string; isArchived: boolean }>;
    marketList: Array<NightMarketEntityModel & { stampJoin: Date }>;
}

export type OrganizationModel = OrganizationEntityModel &
    OrganizationDataModel & {
        contactPersonList: PersonDataModel[];
    };
