"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonService = void 0;
class PersonService {
    constructor(entityService, rdbService) {
        this.entityService = entityService;
        this.rdbService = rdbService;
        this.entityPersonTable = this.rdbService.getTable('entity_person');
    }
    async create(data) {
        this.entityService.create(data);
        this.entityPersonTable.insert(data).run();
    }
    async update(data) {
        await this.entityPersonTable
            .get(data.id)
            .update(this.toUpdateData(data))
            .run();
    }
    async getByDiscordId(discordId) {
        const p = await this.entityPersonTable.filter({ discordId }).run();
        if (p.length > 0) {
            throw new Error(`We have too ${p.length} persons with the same discord ID!`);
        }
        const personData = p[0];
        const personEntity = await this.entityService.getById(personData.id);
        return {
            ...personData,
            ...personEntity
        };
    }
    fromPersonSheetData({ name, discordId, bio, stampCreate, phone, email, pronouns }) {
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
            type: 'type_person',
            idAccount: '',
            attrAdminRoleInterestList: [],
            attrTeamInterestList: [],
            attrBikeAttributeList: [],
            name,
            contactList,
            description: bio,
            stampCreate: new Date(stampCreate),
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
    toInsertData({ id, contactList, discordId, pronounList, idNm }) {
        return {
            id: id === '_new' ? undefined : id,
            contactList,
            discordId,
            pronounList,
            idNm
        };
    }
    toUpdateData({ contactList, discordId, pronounList, idNm }) {
        return {
            contactList,
            discordId,
            pronounList,
            idNm
        };
    }
}
exports.PersonService = PersonService;
