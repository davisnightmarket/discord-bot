import { RTable } from 'rethinkdb-ts';
import { EntityModel } from '../model';

export class EntityService<T extends string> {
    constructor(private table: RTable, private entityType: T[]) {
        this.table = table;
    }
    async getById(id: string) {
        return await this.table.get(id).run().then(this.fromData);
    }
    async getByType(type: string) {
        return await this.table.filter({ type }).run().then(this.fromDataList);
    }

    async create(data: EntityModel<T>) {
        await this.table.insert(this.toInsertData(data)).run();
    }

    async update(data: EntityModel<T>) {
        await this.table.get(data.id).update(this.toUpdateData(data)).run();
    }

    // we can send the data to the database to save
    toInsertData({
        id,
        name,
        description,
        type,
        stampCreate = new Date()
    }: EntityModel<T>) {
        if (!this.entityType.includes(type)) {
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
    toUpdateData({ name, description }: EntityModel<T>) {
        return {
            name,
            description
        };
    }

    // normalize data
    fromData(data: EntityModel<T>): EntityModel<T> {
        return {
            ...data
        };
    }
    fromDataList(dataList: EntityModel<T>[]): EntityModel<T>[] {
        return dataList.map(this.fromData);
    }
}
