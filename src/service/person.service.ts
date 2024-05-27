import { RTable } from 'rethinkdb-ts';
import { PersonDataModel, PersonModel } from '../model/person.model';
import { EntityService } from './entity.service';

export class PersonService {
    constructor(
        private entityService: EntityService<'type_person'>,
        private entityPersonTable: RTable
    ) {}

    async create(data: PersonModel) {
        this.entityService.create(data);
        this.entityPersonTable.insert(data).run();
    }
    
    async update(data: PersonModel) {
        await this.entityPersonTable
            .get(data.id)
            .update(this.toUpdateData(data))
            .run();
    }

    async getByDiscordId(discordId: string) {
        const p = await this.entityPersonTable.filter({ discordId }).run();
        if (p.length > 0) {
            throw new Error(
                `We have too ${p.length} persons with the same discord ID!`
            );
        }
        const personData = p[0] as PersonDataModel;
        const personEntity = await this.entityService.getById(personData.id);
        return {
            ...personData,
            ...personEntity
        };
    }

    toInsertData({
        id,
        phone,
        email,
        discordId,
        pronounList,
        marketList
    }: PersonModel): Partial<PersonDataModel> {
        return {
            id: id === '_new' ? undefined : id,
            phone,
            email,
            discordId,
            pronounList,
            marketList
        };
    }
    toUpdateData({
        phone,
        email,
        discordId,
        pronounList,
        marketList
    }: PersonModel): Partial<PersonDataModel> {
        return {
            phone,
            email,
            discordId,
            pronounList,
            marketList
        };
    }
}
