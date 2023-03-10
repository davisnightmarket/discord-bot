import { GoogleAuth } from 'google-auth-library';
import { google } from 'googleapis';

const auth = new GoogleAuth({
    keyFile: 'keys.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets'
});

const gspread = google.sheets({ version: 'v4', auth });

export async function rangeGet(range: string, spreadsheetId: string) {
    validate(range, spreadsheetId);

    const result = await gspread.spreadsheets.values.get({
        spreadsheetId,
        range
    });

    return result.data.values;
}

export async function rowsWrite(
    values: string[][],
    range: string,
    spreadsheetId: string
) {
    if (!values || !(values instanceof Array) || !values.length) {
        throw new Error('Must pass a valid values');
    }

    validate(range, spreadsheetId);

    const service = google.sheets({ version: 'v4', auth });

    const resource = {
        values
    };
    try {
        const result = await gspread.spreadsheets.values.update({
            spreadsheetId,
            valueInputOption: 'RAW',
            range,
            requestBody: { values }
        });

        console.log('%d cells updated.', result.data.updatedCells);
        return result;
    } catch (err) {
        // TODO (Developer) - Handle exception
        throw err;
    }
}

export async function rowsAppend(
    values: string[][],
    range: string,
    spreadsheetId: string
) {
    if (!values || !(values instanceof Array) || !values.length) {
        throw new Error('Must pass a valid values');
    }
    validate(range, spreadsheetId);

    return new Promise((r, x) => {
        gspread.spreadsheets.values.append(
            {
                spreadsheetId,
                range,
                valueInputOption: 'USER_ENTERED',
                requestBody: { values }
            },
            function (err: Error | null, response: any) {
                if (err) {
                    x(err);
                }
                r(response);
            }
        );
    });
}

export async function sheetExists(title: string, spreadsheetId: string) {
    try {
        const request = {
            spreadsheetId,
            ranges: [title],
            includeGridData: false
        };

        const res = await gspread.spreadsheets.get(request);
        return (
            (res.data.sheets?.length &&
                res.data.sheets[0]?.properties?.sheetId) ||
            null
        );
    } catch (e) {
        return null;
    }
}

export async function sheetCreate(title: string, spreadsheetId: string) {
    validate(title, spreadsheetId);
    try {
        const request = {
            spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title
                            }
                        }
                    }
                ]
            },
            auth
        };

        const resp = await gspread.spreadsheets.batchUpdate(request);
    } catch (error) {
        console.log(error);
    }
}

// abstract out test for range and spreadsheetId
function validate(range: string, spreadsheetId: string) {
    if (!range) {
        throw new Error('Must pass a valid sheet "range"');
    }

    if (!spreadsheetId) {
        throw new Error('Must pass a valid spreadsheet id');
    }
}
