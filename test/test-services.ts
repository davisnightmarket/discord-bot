import { GoogleSheetService } from '../src/service';
console.log(GoogleSheetService);

export const testSheetService = new GoogleSheetService({
    spreadsheetId: '1kksf6xpjgz5wutszinKGOGrZesNz4mp0AKzXp9YXcas',
    sheetName: 'test',
    headersList: ['a', 'b', 'c']
});
