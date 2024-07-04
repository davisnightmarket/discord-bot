import type { RTable } from 'rethinkdb-ts';
import type { EntityService } from './entity-rdb.service';
import type { PersonSheetModel } from '../person-sheet.service';
import type { RdbService } from './rdb.service';
import type { PersonDataModel, PersonModel, EntityModel } from '../../model';

// required to insert for extended person data
interface InsertData extends Partial<PersonModel> {}

// required to update for extended person data
interface UpdateData extends Partial<PersonModel> {
    id: string;
}

interface PartialPerson extends Partial<PersonModel> {
    id: string;
    name: string;
}

interface FullPerson extends PersonModel {}

export class PersonRdbService {
    entityPersonTable: RTable<PersonDataModel>;
    constructor(
        private readonly entityService: EntityService<'type_person'>,
        private readonly rdbService: RdbService
    ) {
        this.entityPersonTable = this.rdbService.getTable('entity_person');
    }

    getRdbTables() {
        return { entityPersonTable: this.entityPersonTable };
    }

    async getPersonEntityList() {
        return await this.entityService.getByType('type_person');
    }

    getRdbDiscordId(discordId: string) {
        return `discordId-${discordId}`;
    }

    async getPersonEmailList(id: string): Promise<string[]> {
        const a = await this.getPersonDataById(id);
        if (!a) {
            return [];
        }
        return a.contactList
            .filter((a) => a.type === 'email')
            .map((a) => a.contact);
    }

    async createDiscordPersonEntity({
        discordId,
        name
    }: {
        discordId: string;
        name: string;
    }) {
        const entityPerson = await this.entityService.create({
            id: this.getRdbDiscordId(discordId),
            name,
            description: '',
            type: 'type_person',
            stampCreate: new Date()
        });
        return entityPerson as EntityModel<'type_person'>;
        // this.entityPersonTable.insert(entityPerson as PersonDataModel).run();
    }

    async createPerson(
        data: Pick<PersonModel, 'name' | 'description'> & Partial<PersonModel>
    ): Promise<PartialPerson | null> {
        let id =
            data.id ?? data.discordId
                ? this.getRdbDiscordId(data.discordId as string)
                : '_new';

        try {
            id = await this.entityService
                .create({
                    ...data,
                    id,
                    type: 'type_person'
                })
                .then((a) => a.id);
            await this.createDataPerson({ ...data, id });
            return this.toFullPerson({ ...data, id, type: 'type_person' });
        } catch {
            return null;
        }
    }

    async updatePerson(data: UpdateData): Promise<boolean> {
        if (!data.id) {
            console.error('No id, cound not update person!');
            return false;
        }
        try {
            const didUpdate = await this.updatePersonEntity(data);
            if (!didUpdate) {
                return false;
            }
            await this.entityPersonTable
                .get(data.id)
                .update(this.toUpdateData(data))
                .run();
            return true;
        } catch (e) {
            return false;
        }
    }

    async updatePersonEntity(data: Partial<PersonModel>): Promise<boolean> {
        try {
            await this.entityService.update(data.id as string, data);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async createDataPerson(data: InsertData) {
        if (!data.id) {
            console.error(data);
            throw new Error('No id!');
        }
        await this.entityPersonTable
            .insert(this.toInsertData(data) as PersonDataModel)
            .run();
    }

    async getPersonEntityByDiscordId(discordId: string) {
        return await this.entityService.getById(
            this.getRdbDiscordId(discordId)
        );
    }

    async deletePersonEntityByDiscordId(discordId: string) {
        return await this.entityService.deleteById(
            this.getRdbDiscordId(discordId)
        );
    }

    async getByDiscordId(discordId: string) {
        return await this.getPersonById(this.getRdbDiscordId(discordId));
    }

    async getPersonById(id: string): Promise<FullPerson> {
        return this.toFullPerson({
            ...(await this.entityService.getById(id)),
            ...(await this.getPersonDataById(id))
        });
    }

    async getPersonDataById(id: string) {
        return await this.entityPersonTable.get(id).run();
    }

    async getPersonByEmail(email: string): Promise<FullPerson | null> {
        // todo: we should probablt filter the entity on all contact data with email type
        const p = await this.entityPersonTable.filter({ email }).run();
        if (p.length > 0) {
            throw new Error(
                `We have too ${p.length} persons with the same email!`
            );
        }
        const personData = p[0];
        if (!personData) {
            return null;
        }
        const personEntity = await this.entityService.getById(personData.id);
        return this.toFullPerson({
            ...personData,
            ...personEntity
        });
    }

    async getPersonByPhone(phone: string) {
        const p = await this.entityPersonTable.filter({ phone }).run();
        if (p.length > 0) {
            throw new Error(
                `We have too ${p.length} persons with the same phone!`
            );
        }
        const personData = p[0];
        if (!personData) {
            return null;
        }
        const personEntity = await this.entityService.getById(personData.id);
        return this.toFullPerson({
            ...personData,
            ...personEntity
        });
    }

    async deletePersonById(id: string) {
        try {
            const didServiceDelete = await this.entityService.deleteById(id);
            if (!didServiceDelete) {
                return false;
            }
            await this.entityPersonTable.get(id).delete().run();
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    }

    async deletePersonByDiscordId(discordId: string) {
        return await this.deletePersonById(this.getRdbDiscordId(discordId));
    }

    fromPersonSheetData({
        name,
        discordId,
        bio,
        stampCreate,
        phone,
        email,
        pronouns
    }: PersonSheetModel): PersonModel {
        const contactList = [];
        if (phone.trim()) {
            contactList.push({
                type: 'phone',
                contact: phone.trim()
            });
        }
        if (email.trim()) {
            contactList.push({
                type: 'email',
                contact: email.trim()
            });
        }
        return {
            discordId,
            id: '',
            phone,
            email,
            type: 'type_person',
            idAccount: '',
            attrAdminRoleInterestList: [],
            attrTeamInterestList: [],
            attrBikeAttributeList: [],
            name,
            contactList,
            description: bio,
            stampCreate: new Date(stampCreate as string),
            attrContactPermissionList: [],
            attrAvailabilityHostMap: [],
            attrAvailabilityPickupMap: [],
            idNm: '',
            pronounList: pronouns
                .split(', ')
                .map((a) => a.trim())
                .filter((a) => a),

            attrRoleInterestList: []
        };
    }

    toInsertData({
        id,
        contactList,
        discordId,
        pronounList,
        idNm
    }: InsertData): InsertData {
        return {
            id: id === '_new' ? undefined : id,
            contactList,
            discordId,
            pronounList,
            idNm
        };
    }

    toUpdateData({
        id,
        contactList,
        discordId,
        pronounList,
        idNm
    }: UpdateData): Partial<UpdateData> {
        return {
            // id, the id is not passed to the update, but it is required to do the update
            contactList,
            discordId,
            pronounList,
            idNm
        };
    }

    toFullPerson({
        id = '',
        name = '',
        description = '',
        stampCreate = new Date(),
        idAccount = '',
        email = '',
        phone = '',
        discordId = '',
        contactList = [],
        pronounList = [],
        attrRoleInterestList = [],
        attrAdminRoleInterestList = [],
        attrTeamInterestList = [],
        attrBikeAttributeList = [],
        attrContactPermissionList = [],
        attrAvailabilityHostMap = [],
        attrAvailabilityPickupMap = [],
        idNm = ''
    }: Partial<PersonModel>): FullPerson {
        return {
            id,
            name,
            type: 'type_person',
            description,
            stampCreate,
            contactList,
            idAccount,
            email,
            phone,
            discordId,
            pronounList,
            attrRoleInterestList,
            attrAdminRoleInterestList,
            attrTeamInterestList,
            attrBikeAttributeList,
            attrContactPermissionList,
            attrAvailabilityHostMap,
            attrAvailabilityPickupMap,
            idNm
        };
    }
}
