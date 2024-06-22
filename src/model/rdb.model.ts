import type { EnvType } from './nm-config.model';

export type RdbDbType = `nm-${EnvType}`;

export type RdbTableType =
    | 'entity'
    | 'access'
    | 'entity_person'
    | 'entity_market'
    | 'entity_organization'
    | 'action';
