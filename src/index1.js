// https://docs.google.com/spreadsheets/d/19vS7UW63RJYmUGYjp_uvxP-ipOkw8_AN0sVMQmMvgxE/edit#gid=0

getValues('19vS7UW63RJYmUGYjp_uvxP-ipOkw8_AN0sVMQmMvgxE','A1:C');

/**
 * Gets cell values from a Spreadsheet.
 * @param {string} spreadsheetId 
 * @param {string} range 
 * @return {obj} 
 */

async function getValues(spreadsheetId, range) {
  const {GoogleAuth} = require('google-auth-library');
  const {google} = require('googleapis');

  const auth = new GoogleAuth({
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
    keyFile: 'src/json/credentials.json'
  });

  const service = google.sheets({version: 'v4', auth});
  try {
    const result = await service.spreadsheets.values.get({
      spreadsheetId,
      range,
    });
    const numRows = result.data.values ? result.data.values.length : 0;
    console.log(`${numRows} rows retrieved.`);
    const rows = result.data.values;
    rows.forEach(index => {
      console.log(index);
    })
    return result;
  } catch (err) {
    throw err;
  }
}



/////////////
const fs = require('fs');

/**
 * Gets cell values from a Spreadsheet and updates a JSON file.
 * @param {string} spreadsheetId 
 * @param {string} range 
 * @param {string} jsonFilePath Path to the JSON file to update
 */

async function getValuesAndUpdateJSON(spreadsheetId, range, jsonFilePath) {
    const { GoogleAuth } = require('google-auth-library');
    const { google } = require('googleapis');

    const auth = new GoogleAuth({
        scopes: 'https://www.googleapis.com/auth/spreadsheets',
        keyFile: 'src/json/credentials.json'
    });

    const service = google.sheets({ version: 'v4', auth });
    try {
        const spreadsheet = await service.spreadsheets.get({
            spreadsheetId,
        });

        const sheetTitles = spreadsheet.data.sheets.map(sheet => sheet.properties.title);

        const allValues = [];

        for (const title of sheetTitles) {
            const result = await service.spreadsheets.values.get({
                spreadsheetId,
                range: `${title}!${range}`, 
            });

            const values = result.data.values;
            if (values) {
                allValues.push({ sheet: title, values });
            }
        }

        console.log('All values retrieved:');
        console.log(allValues);

    } catch (err) {
        throw err;
    }
}


const spreadsheetId = '19vS7UW63RJYmUGYjp_uvxP-ipOkw8_AN0sVMQmMvgxE';
const range = 'A1';
const jsonFilePath = 'src/json/familia.json'; 

getValuesAndUpdateJSON(spreadsheetId, range, jsonFilePath);


