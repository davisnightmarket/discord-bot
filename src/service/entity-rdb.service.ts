import type { RTable } from 'rethinkdb-ts';
import type { EntityModel } from '../model';
import type { RdbService } from './rdb.service';

const EntityTypeList = ['type_person', 'type_event', 'type_role', 'type_team'];

export class EntityService<T extends string> {
    private readonly table: RTable;
    private readonly waitingForEntityTypes: Promise<string[]>;
    constructor(private readonly rdbService: RdbService) {
        this.table = this.rdbService.getTable('entity');
        this.waitingForEntityTypes = this.table
            .pluck('type')
            .distinct()
            .run()
            .then(
                (a) =>
                    [
                        ...a.map((a: { type: string }) => a.type),
                        ...EntityTypeList
                    ] as string[]
            );
    }

    async getById(id: string) {
        try {
            return await this.table
                .get(id)
                .run()
                .then((a) => this.fromData(a));
        } catch (e) {
            console.warn(e);
            return null;
        }
    }

    async getByType(type: string) {
        console.log(await this.table.filter({ type }).run(), 'getByType');
        return await this.table
            .filter({ type })
            .run()
            .then((a) => this.fromDataList(a));
    }

    async create(
        data: Pick<EntityModel<T>, 'id' | 'name' | 'type'> &
            Partial<EntityModel<T>>
    ) {
        return await this.table
            .insert(await this.toInsertData(data))
            .run()
            .then((a) => {
                if (data.id === '_new' && !a.generated_keys) {
                    throw new Error('No generated keys!');
                }
                const id = a.generated_keys ? a.generated_keys[0] : data.id;

                return {
                    ...data,
                    id
                };
            });
    }

    async update(
        id: string,
        data: Partial<Pick<EntityModel<T>, 'name' | 'description'>>
    ) {
        try {
            await this.table.get(id).update(this.toUpdateData(data)).run();
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    async deleteById(id: string): Promise<boolean> {
        try {
            await this.table.get(id).delete().run();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    // we can send the data to the database to save
    async toInsertData({
        id,
        name,
        description,
        type,
        stampCreate = new Date()
    }: Pick<EntityModel<T>, 'id' | 'name' | 'type'> & Partial<EntityModel<T>>) {
        const entityType = await this.waitingForEntityTypes;
        if (!entityType.includes(type as string)) {
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

    toUpdateData({
        name,
        description
    }: Partial<Pick<EntityModel<T>, 'name' | 'description'>>) {
        return {
            name,
            description
        };
    }

    // normalize data
    fromData(data: EntityModel<T>): EntityModel<T> {
        if (!data) {
            throw new Error(`No data passed to fromData!`);
        }
        return {
            ...data
        };
    }

    fromDataList(dataList: Array<EntityModel<T>>): Array<EntityModel<T>> {
        return dataList.map((a) => this.fromData(a));
    }
}
