/* 
Google Drive API:
Demonstration to:
1. upload 
2. delete 
3. create public URL of a file.
required npm package: googleapis
*/
const { google } = require('googleapis');
const path = require('path');
const { env } = require('node:process');
const fs = require('fs');
const { file } = require('googleapis/build/src/apis/file');
require("dotenv").config()

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const REDIRECT_URI = 'https://developers.google.com/oauthplayground';
const REFRESH_TOKEN = process.env.REFRESH_TOKEN;

const auth = new google.auth.GoogleAuth({
  keyFile:'./service-account.json',
  scopes:['https://www.googleapis.com/auth/spreadsheets']
});

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

oauth2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const drive = google.drive({
  version: 'v3',
  auth: oauth2Client,
});

async function uploadImageFile(filePath, id) {
  try {
    const response = await drive.files.create({
      requestBody: {
        name: id, // Change the name with the id of the opeartion(Devolution)
        mimeType: 'image/jpg',
        parents: [ process.env.IMAGE_REPO_ID ] // Carpeta donde se Guarda
      },
      media: {
        mimeType: 'image/jpg',
        body: fs.createReadStream(filePath),
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
}

async function uploadPDFFile(filePath, id) {
    try {
      const response = await drive.files.create({
        requestBody: {
          name: id, // Change the name with the id of the opeartion(Devolution)
          mimeType: 'application/pdf',
          parents: [ process.env.RETURNMENT_REPO_ID ]  // Carpeta donde Se Guarda
        },
        media: {
          mimeType: 'application/pdf',
          body: fs.createReadStream(filePath),
        },
      });
  
      return response.data;
    } catch (error) {
      return error.message;
    }
}



async function deleteImage(fileId) {
  try {
    const response = await drive.files.delete({
      fileId: fileId,
      parents: [ process.env.IMAGE_REPO_ID ]
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
}

async function deleteReturnmentLabel(fileId) {
  try {
    const response = await drive.files.delete({
      fileId: fileId,
      parents: [ process.env.RETURNMENT_REPO_ID ]
    });
    return response.data;
  } catch (error) {
    return error.message;
  }
}

async function getImage(fileId) {
  
  try {
    
    const response = await drive.files.get({
      fileId: fileId,
      acknowledgeAbuse: true,
      alt: 'media'
    }, { responseType: 'stream' });

    return response.data;
  } catch (error) {
    return error.message;
  }

}

async function getReturnmentLabel(fileId) {
  
  try {
    
    const response = await drive.files.get({
      fileId: fileId,
      acknowledgeAbuse: true,
      alt: 'media'
    }, { responseType: 'stream' });

    return response.data;
  } catch (error) {
    return error.message;
  }

}

async function devolutionRecord(values) {
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const range = 'Devolution';
  const valueInputOption = 'USER_ENTERED'; 


  const resource = { values };  // The data to be written.

  try {
      const res = await sheets.spreadsheets.values.update({
          spreadsheetId, range, valueInputOption, resource
      })
      return res;  // Returns the response from the Sheets API.
  } catch (error) {
      console.error('error', error);  // Logs errors.
  }
}



module.exports = { 
  getReturnmentLabel,
  uploadImageFile, 
  uploadPDFFile, 
  deleteImage, 
  deleteReturnmentLabel,
  getImage,
  devolutionRecord
};