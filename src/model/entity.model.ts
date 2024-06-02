export interface EntityModel<T extends string = 'type_entity'> {
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
