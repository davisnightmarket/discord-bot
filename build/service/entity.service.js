"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntityService = void 0;
class EntityService {
    constructor(rdbService) {
        this.rdbService = rdbService;
        this.table = this.rdbService.getTable('entity');
        this.waitingForEntityTypes = this.table
            .pluck('type')
            .distinct()
            .run()
            .then((a) => a);
    }
    async getById(id) {
        return await this.table.get(id).run().then(this.fromData);
    }
    async getByType(type) {
        return await this.table.filter({ type }).run().then(this.fromDataList);
    }
    async create(data) {
        await this.table.insert(this.toInsertData(data)).run();
    }
    async update(data) {
        await this.table.get(data.id).update(this.toUpdateData(data)).run();
    }
    // we can send the data to the database to save
    async toInsertData({ id, name, description, type, stampCreate = new Date() }) {
        const entityType = await this.waitingForEntityTypes;
        if (!entityType.includes(type)) {
            throw new Error('Cannot input Entity of type ' + type);
        }
        return {
            id: id === '_new' ? undefined : id,
            type,
            name,
            description,
            stampCreate
        };
    }
    toUpdateData({ name, description }) {
        return {
            name,
            description
        };
    }
    // normalize data
    fromData(data) {
        return {
            ...data
        };
    }
    fromDataList(dataList) {
        return dataList.map(this.fromData);
    }
}
exports.EntityService = EntityService;
