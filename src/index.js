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
        // allValues.forEach(a => {
        //      console.log(a);
        // })
        //return;
        //console.log(allValues);

        actualizarInformacion(allValues);
        console.log('All values retrieved:');

    } catch (err) {
        throw err;
    }
}


function actualizarInformacion(sheets) {
    fs.readFile('src/json/familia.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try {

            const familia = JSON.parse(data);

            sheets.forEach(sheet => {
                const index = familia.findIndex(item => item.name === sheet.sheet);

                if (index !== -1) {

                    const integrantes = sheet.values.slice(1).map(row => {
                        const integrante = {
                            cedula: row[0],
                            nombre: row[1],
                            telefono: {
                            }
                        };


                        let choose = [];
                        for (const e of sheet.values) {
                            for (const a of e) {
                                choose.push(a);
                            }
                            break;
                        }

                        let name1;
                        let name2;

                        if (choose.find(element => element == 'lista movil') || choose.find(element => element == 'lista fijo')) {
                            name1 = integrante.telefono.lista = [];
                            name2 = integrante.telefono.lista;
                        }else{
                            name1 = integrante.telefono.texto = [];
                            name2 = integrante.telefono.texto;
                        }

                        for (let i = 2; i < row.length; i++) {
                            
                            if (row[i]) {
                                if (!integrante.telefono.lista) name1;
                                    if (choose[i].includes('movil')) {
                                        name2.push({ movil: row[i] });
                                    } else {
                                        name2.push({ fijo: row[i] });
                                    } 
                            }
                        }

                        return integrante;
                    });

                    familia[index].integrantes = integrantes;
                }
            });

            fs.writeFile('src/json/familia.json', JSON.stringify(familia, null, 2), err => {
                if (err) {
                    console.error('Error al escribir en el archivo:', err);
                    return;
                }
                console.log('El archivo familia.json ha sido actualizado exitosamente.');
            });
        } catch (error) {
            console.error('Error al procesar el archivo JSON:', error);
        }
    });

}


const spreadsheetId = '19vS7UW63RJYmUGYjp_uvxP-ipOkw8_AN0sVMQmMvgxE';
const range = 'A1:ZZ';
const jsonFilePath = 'src/json/familia.json';

getValuesAndUpdateJSON(spreadsheetId, range, jsonFilePath);
