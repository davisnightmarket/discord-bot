import { MarketEntityModel, PersonEntityModel } from './';

export interface PersonDataModel {
    id: string;
    phone: string;
    email: string;
    discordId: string;
    pronounList: string;
    marketList: (MarketEntityModel & { stampJoin: Date })[];
}

export type PersonModel = PersonEntityModel & PersonDataModel;
