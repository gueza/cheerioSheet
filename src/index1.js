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

