export type EntityType =
    | 'type_organization'
    | 'type_person'
    | 'type_nightmarket';
export interface EntityModel<T extends EntityType = EntityType> {
    id: string;
    type: T;
    name: string;
    description: string;
    stampCreate: Date;
}

export interface PersonEntityModel extends EntityModel<'type_person'> {}

export interface OrganizationEntityModel
    extends EntityModel<'type_organization'> {}

export interface NightMarketEntityModel
    extends EntityModel<'type_nightmarket'> {}
