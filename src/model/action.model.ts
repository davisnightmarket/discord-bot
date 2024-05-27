import { EntityModel } from './entity.model';

export type ActionType = 'action_generic' | 'action_food_count';

export interface ActionModel<T extends ActionType = 'action_generic'>
    extends EntityModel<'type_action'> {
    actionType: T;
    actionList: ActionModel[];
    idParent: string | null;
}

export interface ActionDataModel<T extends string = 'action_generic'>
    extends EntityModel<'type_action'> {
    actionType: T;
    idParent: string | null;
}
