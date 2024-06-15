"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActionService = void 0;
class ActionService {
    constructor(table, actionTypeList) {
        this.table = table;
        this.actionTypeList = actionTypeList;
    }
    async getActionBy(id) {
        return await this.table.get(id).run().then(this.fromData);
    }
    async getActionByType(actionType) {
        return await this.table
            .filter({ actionType })
            .run()
            .then(this.fromDataList);
    }
    async getActionListByParentId(idParent) {
        return await this.table
            .filter({ idParent })
            .run()
            .then(this.fromDataList);
    }
    async getActionWithChildren(action) {
        action.actionList = await this.getActionListByParentId(action.id);
        return action;
    }
    async getActionWithChildrenRecursive(action) {
        action.actionList = await this.getActionListByParentId(action.id);
        for (const a of action.actionList) {
            await this.getActionWithChildrenRecursive(a);
        }
        return action;
    }
    async create(data) {
        await this.table.insert(this.toInsertData(data)).run();
    }
    async update(action) {
        await this.table.update(this.toUpdateData(action)).run();
    }
    // we can send the data to the database to save
    toInsertData(action) {
        if (!this.actionTypeList.includes(action.actionType)) {
            throw new Error('Cannot input Action of type ' + action.type);
        }
        delete action.id;
        return action;
    }
    toUpdateData(action) {
        // types are immutable
        delete action.type;
        delete action.actionList;
        return action;
    }
    // normalize data
    fromData(data) {
        return {
            ...data,
            actionList: []
        };
    }
    fromDataList(dataList) {
        return dataList.map(this.fromData);
    }
}
exports.ActionService = ActionService;
