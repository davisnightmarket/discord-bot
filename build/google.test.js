"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const utility_1 = require("./utility");
const google_auth_library_1 = require("google-auth-library");
const googleapis_1 = require("googleapis");
run();
async function run() {
    const keys = await utility_1.WaitingForConfig;
    console.log(keys, 'hi');
    const credentials = keys.googleSpreadsheetsKeys;
    const auth = new google_auth_library_1.GoogleAuth({
        credentials,
        scopes: 'https://www.googleapis.com/auth/spreadsheets'
    });
    const Gspread = [googleapis_1.google.sheets({ version: 'v4', auth }), auth];
    const spreadsheetId = '17ktzAhVMDElya2kGIEp1BNtwVk2_gXwR4vM3fWWi5Vg';
    try {
        const request = {
            spreadsheetId
        };
        const [gspread] = Gspread;
        const res = await gspread.spreadsheets.get(request);
        console.log(res?.data?.sheets
            ?.map((a) => a.properties?.sheetId)
            .filter((a) => !!a) ?? []);
    }
    catch (err) {
        console.error(err);
        throw err;
    }
}
