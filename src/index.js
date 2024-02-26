const { log } = require('console');
const fs = require('fs');

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
            //return;
            console.log(values);
        }
        // allValues.forEach(a => {
        //      console.log(a);
        // })


        actualizarInformacion(allValues);
        console.log('All values retrieved:');

    } catch (err) {
        throw err;
    }
}


// function actualizarInformacion(sheets) {
//     fs.readFile('src/json/cards-data.json', 'utf8', (err, data) => {
//         if (err) {
//             console.error('Error al leer el archivo:', err);
//             return;
//         }

//         try {

//             const cards = JSON.parse(data);
//             let sheetsArray = []; 

//             // sheets.forEach(sheet => {
//             //     sheet.values.slice(1).map(row => {
//             //         sheetsArray.push(row[0]);
//             //     })
//             // })

//             // console.log(sheetsArray);
//             // return;

//             sheets.forEach(sheet => {
//                 console.log(sheet);
//                 const index = cards.findIndex(item => item.id === sheet.sheet);

//                 if (index !== -1) {
//                     const card = sheet.values.slice(1).map(row => {
//                         const data = {
//                             id: row[0],
//                             data: {
//                             }
//                         };
//                         console.log(row)

//                         let choose = [];
//                         for (const e of sheet.values) {
//                             for (const a of e) {
//                                 choose.push(a);
//                             }
//                             break;
//                         }

//                         let name1;
//                         let name2;

//                         if (choose.find(element => element == 'listItems de') || choose.find(element => element == 'listItems en')) {
//                             name1 = data.data.listItems = [];
//                             name2 = data.data.listItems;
//                         } else {
//                             name1 = data.data.text = [];
//                             name2 = data.data.text;
//                         }

//                         for (let i = 2; i < row.length; i++) {

//                             if (row[i]) {
//                                 if (!data.data.listItems) name1;
//                                 if (choose[i].includes('de')) {
//                                     name2.push({ de: row[i] });
//                                 } else {
//                                     name2.push({ en: row[i] });
//                                 }
//                             }
//                         }

//                         return data;
//                     });
//                 }
//                 cards[index].cards = data;
//             });

//             console.log(cards);


//             fs.writeFile('src/json/cards-data.json', JSON.stringify(cards, null, 2), err => {
//                 if (err) {
//                     console.error('Error al escribir en el archivo:', err);
//                     return;
//                 }
//                 console.log('El archivo cards-data.json ha sido actualizado exitosamente.');
//             });
//         } catch (error) {
//             console.error('Error al procesar el archivo JSON:', error);
//         }
//     });

// }


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
                    sheet.values.forEach(row => {
                        let cardSheetIndex = cards[index].cards.findIndex(card => card.id === row[0]);

                        if (cardSheetIndex === -1 && row[0] !== '') {
                            titleSheet = [];
                            row.forEach((title, index) => {
                                titleSheet[index] = title;
                            });
                        }

                        if (cardSheetIndex === -1 && row[0] == '') {
                            // no tiene id
                            console.log('sin id');
                            cards[index].cards.push({id: 123}); //funcion id 
                            cardSheetIndex = cards[index].cards.findIndex(card => card.id === 123);
                            const split = titleSheet[1].split(" ");
                            cards[index].cards[cardSheetIndex].data = {};
                            if (split[1].toLowerCase() == "text"){
                                cards[index].cards[cardSheetIndex].data["text"] = []
                            } else {
                                cards[index].cards[cardSheetIndex].data["listItems"] = []
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
                                if (i === 0) {
                                    // console.log('entra', item);
                                    // Logica para evaluar el idc
                                    // cards[index].cards[cardSheetIndex].data.id = //funcion id ;
                                } else {
                                    const split = titleSheet[i].split(" ");
                                    const indexInternoTemporal = card.data.listItems ? split[1] : 0 ;
                                    const indexInternoNuevo = card.data.listItems ? split[2] : split[1] ;
                                    nuevoElemento[indexInternoNuevo] = item;
                                    if (!arrayTemporal[indexInternoTemporal]) {
                                        arrayTemporal[indexInternoTemporal] = [];
                                    }
                                    arrayTemporal[indexInternoTemporal].push(nuevoElemento);
                                }
                                const listItemsNuevo = [];
                                for (let key in arrayTemporal) {
                                    if (arrayTemporal.hasOwnProperty(key)) {
                                        const subItems = arrayTemporal[key];
                                        const newItem = {};

                                        subItems.forEach(subItem => {
                                            const [idioma, valor] = Object.entries(subItem)[0];
                                            newItem[idioma] = valor;
                                        });
                                        listItemsNuevo.push(newItem);
                                    }
                                }
                                if (card.data.listItems) {
                                    cards[index].cards[cardSheetIndex].data.listItems = listItemsNuevo;
                                } else {
                                    cards[index].cards[cardSheetIndex].data.text = listItemsNuevo;
                                }
                            });

                            // if (card.data.listItems) {
                            //     cards[index].cards[cardSheetIndex].data.listItems = []
                            //     let arrayTemporal = {};
                            //     row.forEach((item, i) => {
                            //         const nuevoElemento = {};
                            //         if (i === 0) {
                            //             // Logica para evaluar el id
                            //         } else {
                            //             const split = titleSheet[i].split(" ");
                            //             nuevoElemento[split[2]] = item;
                            //             if (!arrayTemporal[split[1]]) {
                            //                 arrayTemporal[split[1]] = [];
                            //             }
                            //             arrayTemporal[split[1]].push(nuevoElemento);
                            //         }
                            //     });
                            //     const listItemsNuevo = [];
                            //     for (let key in arrayTemporal) {
                            //         if (arrayTemporal.hasOwnProperty(key)) {
                            //             const subItems = arrayTemporal[key];
                            //             const newItem = {};

                            //             subItems.forEach(subItem => {
                            //                 const [idioma, valor] = Object.entries(subItem)[0];
                            //                 newItem[idioma] = valor;
                            //             });
                            //             listItemsNuevo.push(newItem);
                            //         }
                            //     }
                            //     cards[index].cards[cardSheetIndex].data.listItems = listItemsNuevo;
                            // } else if (card.data.text) {
                            //     cards[index].cards[cardSheetIndex].data.text = []
                            //     let arrayTemporal = {};
                            //     row.forEach((item, i) => {
                            //         const nuevoElemento = {};
                            //         if (i === 0) {
                            //             // Logica para evaluar el id
                            //         } else {
                            //             const split = titleSheet[i].split(" ");
                            //             nuevoElemento[split[1]] = item;
                            //             if (!arrayTemporal[0]) {
                            //                 arrayTemporal[0] = [];
                            //             }
                            //             arrayTemporal[0].push(nuevoElemento);
                            //         }
                            //     });
                            //     const listItemsNuevo = [];
                            //     for (let key in arrayTemporal) {
                            //         if (arrayTemporal.hasOwnProperty(key)) {
                            //             const subItems = arrayTemporal[key];
                            //             const newItem = {};

                            //             subItems.forEach(subItem => {
                            //                 const [idioma, valor] = Object.entries(subItem)[0];
                            //                 newItem[idioma] = valor;
                            //             });
                            //             listItemsNuevo.push(newItem);
                            //         }
                            //     }
                            //     cards[index].cards[cardSheetIndex].data.text = listItemsNuevo;
                            // }
                        }
                        //return nuevoElemento;
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
