import { type ActiveStateType } from '../model/night-market.model';
import {
    CONFIG_GSPREAD_SHEET_NAME,
    GSPREAD_CORE_ACTIVE_STATE_LIST
} from '../nm-const';
import { GoogleSpreadsheetsService } from '../service';

import { ConfigValueGet } from '../config';

interface NmOrgModel {
    name: string;
    nameAltList: string[];
}
// one hour: every hour the org list gets refreshed
const ORG_LIST_CACHE_EXPIRY = 1000 * 60 * 60;
const ORG_LIST_CACHE_TIME = Date.now();
let OrgCacheList: NmOrgModel[] = [];

// TODO: make this a class service

export class NmOrgService {
    private orgSheetService: GoogleSpreadsheetsService;
    async getOrgList(
        {
            active = false,
            flushCache = true
        }: {
            active?: boolean;
            flushCache?: boolean;
        } = {
            active: false,
            flushCache: true
        }
    ): Promise<NmOrgModel[]> {
        if (
            // we have a list of orgs AND
            OrgCacheList.length > 0 &&
            // we are not flushing the cache AND
            !flushCache &&
            // the cache is not expired
            Date.now() - ORG_LIST_CACHE_TIME < ORG_LIST_CACHE_EXPIRY
        ) {
            return OrgCacheList;
        }
        const r = (await this.orgSheetService.rangeGet('org!A3:C')) ?? [];
        OrgCacheList = r
            .filter(([status, name]) => {
                if (active && status !== GSPREAD_CORE_ACTIVE_STATE_LIST[0]) {
                    return false;
                }
                // filter any blank names as well
                return !!name.trim();
            })
            .map(([_, name, nameAltList]) => {
                // if we have requested only active orgs

                // otherwise return just the name
                return {
                    name: name.trim(),
                    nameAltList:
                        // spreadsheet service does not return a value if there is nothing defined
                        nameAltList
                            ?.split(',')
                            .filter((a) => a.trim())
                            .map((a) => a.trim()) ?? []
                };
            });

        return OrgCacheList;
    }

    async getOrgNameList(
        opts: {
            active?: boolean;
            flushCache?: boolean;
        } = {
            active: false,
            flushCache: true
        }
    ): Promise<string[]> {
        const r = await this.getOrgList(opts);
        return r.map((a) => a.name);
    }

    // toggle an org state to active
    static async setOrgActiveState(
        _name: string,
        activeState: ActiveStateType
    ) {
        if (!GSPREAD_CORE_ACTIVE_STATE_LIST.indexOf(activeState)) {
            throw new Error('Must set active state');
        }

        // TODO:
        // get all the org rows
        // find a match to name
        // update cell for active at row and column index (add method to GSpreadService)
    }
    constructor(instanceId: string) {
        this.orgSheetService = new GoogleSpreadsheetsService(
            ConfigValueGet(instanceId, CONFIG_GSPREAD_SHEET_NAME.ORG_SHEET)
        );
    }
}
