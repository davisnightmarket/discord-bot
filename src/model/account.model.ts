import type { NightMarketEntityModel, PersonEntityModel } from './entity.model';

export type AccountDataModel = {
    id: string;
    token: string;
    idPerson: string;
    idNm: string;
} & (
    | {
          contactPrimary: string;
          tokenPrimary: string;
      }
    | {
          contactPrimary: string;
          contactSecondary: string;
          tokenSecondary: string;
      }
    | {
          contactPrimary: string;
          contactSecondary: string;
          tokenSecondary: string;
          contactTertiary: string;
          tokenTertiary: string;
      }
);

export type AccountModel = AccountDataModel & {
    personList: PersonEntityModel[];
    person: PersonEntityModel;
};
