const { log } = require('console');
const fs = require('fs');
const crypto = require('crypto');

/**
 * Gets cell values from a Spreadsheet and updates a JSON file.
 * @param {string} spreadsheetId 
 * @param {string} range 
 * @param {string} jsonFilePath Path to the JSON file to update
 */

async function getValuesAndUpdateJSON(spreadsheetId, range) {
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

        actualizarInformacion(allValues);
        console.log('All values retrieved:');

    } catch (err) {
        throw err;
    }
}

function actualizarInformacion(sheets) {
    fs.readFile('src/json/cards-data.json', 'utf8', (err, data) => {
        if (err) {
            console.error('Error al leer el archivo:', err);
            return;
        }

        try {
            const cards = JSON.parse(data);

            sheets.forEach(sheet => {
                const index = cards.findIndex(item => item.id === sheet.sheet);
                let titleSheet = [];

                if (index !== -1) {

                    let idTemporal = [];
                    let boolean = false;

                    sheet.values.forEach(row => {
                        row.forEach((item, i) => {
                            if (i == 0) {
                                idTemporal.push(item);
                            }
                        });
                    });

                    sheet.values.forEach(row => {

                        let cardSheetIndex = cards[index].cards.findIndex(card => card.id === row[0]);

                        if (cardSheetIndex === -1 && row[0] == 'id') {
                            titleSheet = [];
                            row.forEach((title, index) => {
                                titleSheet[index] = title;
                            });
                        }

                        let guardar = idTemporal.filter(element => element == row[0]);

                        if (guardar.length <= 1) {
                            boolean = true;
                        }

                        if ((cardSheetIndex === -1 && row[0] != 'id') || (guardar.length > 1)) {

                            if (boolean) {
                                const newId = crypto.randomUUID();
                                cards[index].cards.push({ id: newId });
    
                                cardSheetIndex = cards[index].cards.findIndex(card => card.id === newId);
                                const split = titleSheet[1].split(" ");
    
                                cards[index].cards[cardSheetIndex].data = {};
    
                                if (split[1].toLowerCase() == "text") {
                                    cards[index].cards[cardSheetIndex].data["text"] = []
                                } else {
                                    cards[index].cards[cardSheetIndex].data["listItems"] = []
                                }

                            } else {
                                boolean = true;
                            }
                        }


                        if (cardSheetIndex !== -1) {

                            const card = cards[index].cards[cardSheetIndex];

                            if (card.data.listItems) {
                                cards[index].cards[cardSheetIndex].data.listItems = []
                            } else {
                                cards[index].cards[cardSheetIndex].data.text = []
                            }

                            let arrayTemporal = {};

                            row.forEach((item, i) => {
                                const nuevoElemento = {};
                                if (i !== 0) {
                                    const split = titleSheet[i].split(" ");
                                    const indexInternoTemporal = card.data.listItems ? split[1] : 0;
                                    const indexInternoNuevo = card.data.listItems ? split[2] : split[1];

                                    nuevoElemento[indexInternoNuevo] = item;

                                    if (!arrayTemporal[indexInternoTemporal]) {
                                        arrayTemporal[indexInternoTemporal] = [];
                                    }
                                    arrayTemporal[indexInternoTemporal].push(nuevoElemento);
                                }

                                const listItemsNew = [];

                                for (let key in arrayTemporal) {
                                    if (arrayTemporal.hasOwnProperty(key)) {
                                        const subItems = arrayTemporal[key];
                                        const newItem = {};

                                        subItems.forEach(subItem => {
                                            const [idioma, valor] = Object.entries(subItem)[0];
                                            newItem[idioma] = valor;
                                        });
                                        listItemsNew.push(newItem);
                                    }
                                }

                                if (card.data.listItems) {
                                    cards[index].cards[cardSheetIndex].data.listItems = listItemsNew;
                                } else {
                                    cards[index].cards[cardSheetIndex].data.text = listItemsNew;
                                }
                            });
                        }
                    });
                }
            });

            fs.writeFile('src/json/cards-data.json', JSON.stringify(cards, null, 2), err => {
                if (err) {
                    console.error('Error al escribir en el archivo:', err);
                    return;
                }
                console.log('El archivo cards-data.json ha sido actualizado exitosamente.');
            });
        } catch (error) {
            console.error('Error al procesar el archivo JSON:', error);
        }
    });
}


const spreadsheetId = '19vS7UW63RJYmUGYjp_uvxP-ipOkw8_AN0sVMQmMvgxE';
const range = 'A1:ZZ';

getValuesAndUpdateJSON(spreadsheetId, range);
