import { RTable } from 'rethinkdb-ts';
import { ActionDataModel, ActionModel, ActionType } from '../model';

export class ActionService {
    constructor(private table: RTable, private actionTypeList: ActionType[]) {}
    async getActionBy(id: string) {
        return await this.table.get(id).run().then(this.fromData);
    }
    async getActionByType(actionType: ActionType) {
        return await this.table
            .filter({ actionType })
            .run()
            .then(this.fromDataList);
    }
    async getActionListByParentId(idParent: string) {
        return await this.table
            .filter({ idParent })
            .run()
            .then(this.fromDataList);
    }

    async getActionWithChildren(action: ActionModel<ActionType>) {
        action.actionList = await this.getActionListByParentId(action.id);
        return action;
    }

    async getActionWithChildrenRecursive(action: ActionModel<ActionType>) {
        action.actionList = await this.getActionListByParentId(action.id);
        for (const a of action.actionList) {
            await this.getActionWithChildrenRecursive(a);
        }
        return action;
    }

    async create(data: ActionModel<ActionType>) {
        await this.table.insert(this.toInsertData(data));
    }

    async update(action: ActionModel<ActionType>) {
        await this.table.update(this.toUpdateData(action)).run();
    }

    // we can send the data to the database to save
    toInsertData(action: ActionModel<ActionType>) {
        if (!this.actionTypeList.includes(action.actionType)) {
            throw new Error('Cannot input Action of type ' + action.type);
        }
        delete (action as Partial<ActionModel>).id;
        return action;
    }
    toUpdateData(action: ActionModel<T>) {
        // types are immutable
        delete (action as Partial<ActionModel>).type;
        delete (action as Partial<ActionModel>).actionList;

        return action;
    }

    // normalize data
    fromData(data: ActionDataModel): ActionModel {
        return {
            ...data,
            actionList: []
        };
    }
    fromDataList(dataList: ActionDataModel[]): ActionModel[] {
        return dataList.map(this.fromData);
    }
}
