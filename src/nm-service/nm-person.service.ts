import {
    type ActiveStateType,
    type PersonModel
} from '../model/night-market.model';
import {
    GSPREAD_CORE_ACTIVE_STATE_LIST,
    CONFIG_GSPREAD_SHEET_NAME
} from '../nm-const';
import { GoogleSpreadsheetsService } from '../service';
import { ConfigValueGet } from '../config';

type ColumnMapKeyType = keyof typeof ColumnMap;

// makes it easier to find and change where data is in sheet columns
const ColumnMap = {
    EMAIL: 'C',
    NAME: 'B',
    STATUS: 'A',
    DISCORD_ID: 'N',
    LAST_COLUMN: 'N'
};
// exclude the header when we want only data
const DATA_OFFSET = 2;
// the name of the core sheet where all people are
const CORE_PERSON_SHEET = 'person';
const PERSON_LIST_CACHE_EXPIRY = 1000 * 60 * 60; // one hour until cache refresh

// we use a cache so we do not have to go to Google spreadsheet everytime we want the people
let personListCache: PersonModel[] = [];
let personListCacheLastUpdate = Date.now();
export class NmPersonService {
    personSheetService: GoogleSpreadsheetsService;
    async getPersonList(): Promise<PersonModel[]> {
        if (
            personListCache.length === 0 ||
            Date.now() - PERSON_LIST_CACHE_EXPIRY > personListCacheLastUpdate
        ) {
            personListCacheLastUpdate = Date.now();
            // TODO: we probably only want the active people in the cache
            personListCache = (await this.getAllDataWithoutHeader()).map(
                this.createFromData
            );
        }
        return personListCache;
    }

    createFromData(a: string[]): PersonModel {
        // todo: make a better mapping, maybe map header to column, make it easier to edit spreadhseet without fuckup script?
        return {
            status: (a[0] ?? '').trim(),
            name: (a[1] ?? '').trim(),
            email: (a[2] ?? '').trim(),
            phone: (a[3] ?? '').trim(),
            location: (a[4] ?? '').trim(),
            bike: (a[5] ?? '').trim(),
            bikeCart: (a[6] ?? '').trim(),
            bikeCartAtNight: (a[7] ?? '').trim(),
            skills: (a[8] ?? '').trim(),
            bio: (a[9] ?? '').trim(),
            pronouns: (a[10] ?? '').trim(),
            interest: (a[11] ?? '').trim(),
            reference: (a[12] ?? '').trim(),
            discordId: (a[13] ?? '').trim()
        };
    }

    async getCleanNameList() {
        return await this.getNameList().then((a) => a.filter((b) => b.trim()));
    }

    async getCleanEmailList(): Promise<string[]> {
        return await this.getEmailList().then((a) => a.filter((a) => a.trim()));
    }

    async getNameList(): Promise<string[]> {
        return await this.personSheetService
            .rangeGet(this.getColumnDataRangeName('NAME'))
            .then((a) => a[0]);
    }

    async getEmailList(): Promise<string[]> {
        return await this.personSheetService
            .rangeGet(this.getColumnDataRangeName('EMAIL'))
            .then((a) => a.map((b) => b[0]));
    }

    async getAllDataWithoutHeader(): Promise<string[][]> {
        return (
            await this.personSheetService.rangeGet(
                this.getFullPersonDataRangeName()
            )
        ).filter((_a, i) => !!i);
    }

    async getAllData(): Promise<string[][]> {
        return await this.personSheetService.rangeGet(
            this.getFullPersonDataRangeName()
        );
    }

    async getPersonRangeByDiscorIdOrEmail(idOrEmail: string): Promise<string> {
        const personRange = '';

        return personRange;
    }

    async getPersonByDiscorIdOrEmail(idOrEmail: string): Promise<PersonModel> {
        const [
            status,
            name,
            email,
            phone,
            location,
            bike,
            bikeCart,
            bikeCartAtNight,
            skills,
            bio,
            pronouns,
            interest,
            reference,
            discordId
        ] = await this.getRowByDiscordIdOrEmail(idOrEmail);
        return {
            status,
            name,
            email,
            phone,
            location,
            bike,
            bikeCart,
            bikeCartAtNight,
            skills,
            bio,
            pronouns,
            interest,
            reference,
            discordId
        };
    }

    async getEmailByDiscordId(id: string): Promise<string> {
        const [_status, _name, email] = await this.getRowByDiscordIdOrEmail(id);
        return email;
    }

    async getRowByDiscordIdOrEmail(idOrEmail: string): Promise<string[]> {
        idOrEmail = idOrEmail.toLowerCase().trim();
        const emailIndex = this.getColumnIndexByName('EMAIL');
        const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
        const a = await this.personSheetService
            .rangeGet(this.getFullPersonDataRangeName())
            .then((a) =>
                a.filter((a) => {
                    return (
                        idOrEmail === a[emailIndex] ||
                        idOrEmail === a[discordIdIndex]
                    );
                })
            )
            .then((a) => a.pop());
        return a ?? [];
    }

    async getRowIndexByDiscordIdOrEmail(idOrEmail: string): Promise<number> {
        idOrEmail = idOrEmail.toLowerCase().trim();
        const emailIndex = this.getColumnIndexByName('EMAIL');
        const discordIdIndex = this.getColumnIndexByName('DISCORD_ID');
        return await this.personSheetService
            .rangeGet(this.getFullPersonDataRangeName())
            .then(
                (a) =>
                    a.findIndex((a) => {
                        return (
                            idOrEmail === a[emailIndex]?.trim() ||
                            idOrEmail === a[discordIdIndex]?.trim()
                        );
                    }) + 1
            );
    }

    // toggle a person state to active
    async setActiveState(email: string, activeState: ActiveStateType) {
        if (!GSPREAD_CORE_ACTIVE_STATE_LIST.includes(activeState)) {
            throw new Error(
                `Must set active state to one of ${GSPREAD_CORE_ACTIVE_STATE_LIST.join(
                    ', '
                )}`
            );
        }
        // get all the person rows
        const rowIndex = await this.getRowIndexByDiscordIdOrEmail(email);

        if (!rowIndex) {
            throw new Error('person does not exists');
        }

        const range = this.getColumnRangeName('STATUS', rowIndex);
        // update cell for active at row and column index (add method to GSpreadService)
        await this.personSheetService.rowsWrite([[activeState]], range);
        return range;
    }

    // gets the row index number from named column
    getColumnIndexByName(columnName: ColumnMapKeyType) {
        return this.personSheetService.columnIndexFromLetter(
            ColumnMap[columnName]
        );
    }

    // returns the full range for all the person data
    getFullPersonDataRangeName(): string {
        return `${CORE_PERSON_SHEET}!A:${ColumnMap.LAST_COLUMN}`;
    }

    // returns the full range for all the person data minus the header
    getFullPersonDataRangeNameWithoutHeader(): string {
        return `${CORE_PERSON_SHEET}!A${DATA_OFFSET}:${ColumnMap.LAST_COLUMN}`;
    }

    // returns a range for a data set minus the header
    getColumnDataRangeName(columnName: ColumnMapKeyType): string {
        return this.getColumnRangeName(
            columnName,
            DATA_OFFSET,
            ColumnMap[columnName]
        );
    }

    getColumnRangeName(
        columnName: ColumnMapKeyType,
        // defaults to full column
        index: number = 0,
        // optionally, get columns that follow
        endCol?: string
    ): string {
        return `${CORE_PERSON_SHEET}!${ColumnMap[columnName]}${index || ''}${
            endCol ? `:${endCol}` : ''
        }`;
    }

    getCellRangeName(
        columnName: ColumnMapKeyType,
        // defaults to full column
        index: number
    ): string {
        if (!index) {
            throw new Error('must have an index to get a row range name');
        }
        return `${CORE_PERSON_SHEET}!${ColumnMap[columnName]}${index || ''}`;
    }

    constructor(instanceId: string) {
        this.personSheetService = new GoogleSpreadsheetsService(
            ConfigValueGet(
                'davis.night',
                CONFIG_GSPREAD_SHEET_NAME.PERSON_SHEET
            )
        );
    }
}
