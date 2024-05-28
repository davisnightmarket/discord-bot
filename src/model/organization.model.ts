import { MarketEntityModel, OrganizationEntityModel } from '.';
import { PersonDataModel } from './person.model';

export interface OrganizationDataModel {
    id: string;
    phone: string;
    email: string;
    discordId: string;
    pronounList: string;
    contactPersonIdList: { id: string; isArchived: boolean }[];
    marketList: (MarketEntityModel & { stampJoin: Date })[];
}

export type OrganizationModel = OrganizationEntityModel &
    OrganizationDataModel & {
        contactPersonList: PersonDataModel[];
    };
