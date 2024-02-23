const { google } = require('googleapis');
const fs = require('fs');

// Cargar las credenciales de autenticación desde el archivo JSON
const credentials = require('./json/credentials.json');

// ID de la hoja de cálculo de Google Sheets
const spreadsheetId = '19vS7UW63RJYmUGYjp_uvxP-ipOkw8_AN0sVMQmMvgxE';

// Autenticación con Google Sheets API
const auth = new google.auth.GoogleAuth({
    credentials: credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

// Crear cliente de Google Sheets
let sheets = google.sheets({ version: 'v4', auth });

// Leer el archivo JSON
fs.readFile('src/json/familia.json', 'utf8', (err, jsonString) => {
    if (err) {
        console.log('Error al leer el archivo JSON:', err);
        return;
    }

    try {
        const data = JSON.parse(jsonString);

        let values = [];
    
        data.forEach(item => {
            let headers = [];

            for (let integrante of item.integrantes) {
                for (const a in integrante) {
                    headers.push(a);
                    if (a == 'telefono') {
                        const tel = integrante['telefono'];
                        for ( const te in tel){
                            for(const t in tel[te]) {
                                let i = 0;
                                for (const len in tel[te][t]) {
                                    ++i;
                                    if(len) {
                                        headers.push( te + ' ' + len);
                                    }
                                }
                               
                            }
                        }
                        
                    }
                }
                break;
            }

            headers.splice(2,1);
            //console.log(headers);

            console.log(' ');
            item.integrantes.forEach(integrante => {

                values.push([integrante.cedula, integrante.nombre]);

                const telefono = integrante.telefono;
                let i = 0;

                if (telefono.lista) {
                    for (const lista of telefono.lista) {
                        if (lista.movil) {
                            values[values.length - 1].push(lista.movil)
                            i++;
                        }
                        if (lista.fijo) {
                            values[values.length - 1].push(lista.fijo)
                            i++;
                        }
                    }
                }

                if (telefono.texto) {
                    for (const texto of telefono.texto) {
                        if (texto.movil) {
                            values[values.length - 1].push(texto.movil)
                            i++;
                        }
                        if (texto.fijo) {
                            values[values.length - 1].push(texto.fijo)
                            i++;
                        }
                    }
                }
            });

            values.unshift(headers);

            updateSheet(values, item.name);
            values = [];
        });

    } catch (err) {
        console.log('Error al analizar el archivo JSON:', err);
    }
});

// Modificar la hoja de cálculo de Google Sheets
async function updateSheet(values, sheetName) {
    try {
        const sheetExists = await checkIfSheetExists(sheetName);
        if (!sheetExists) {
            await createSheet(sheetName);
        }

        await sheets.spreadsheets.values.update({
            spreadsheetId: spreadsheetId,
            range: `${sheetName}!A1`, // Rango donde quieres escribir los datos
            valueInputOption: 'RAW',
            resource: {
                values: values
            }
        });

        console.log('Hoja de cálculo actualizada con éxito.');
    } catch (err) {
        console.log('Error al actualizar la hoja de cálculo:', err);
    }
}

// Función para verificar si la hoja ya existe
async function checkIfSheetExists(sheetName) {
    try {
        const response = await sheets.spreadsheets.get({
            spreadsheetId: spreadsheetId
        });
        const sheet = response.data.sheets;
        for (const sh of sheet) {
            if (sh.properties.title === sheetName) {
                return true; // La hoja existe
            }
        }
        return false; // La hoja no existe
    } catch (err) {
        throw err;
    }
}

// Función para crear una nueva hoja
async function createSheet(sheetName) {
    try {
        await sheets.spreadsheets.batchUpdate({
            spreadsheetId: spreadsheetId,
            resource: {
                requests: [
                    {
                        addSheet: {
                            properties: {
                                title: sheetName
                            }
                        }
                    }
                ]
            }
        });
        console.log(`Hoja "${sheetName}" creada con éxito.`);
    } catch (err) {
        throw err;
    }
}

// Llamada a la función principal para escribir los datos

