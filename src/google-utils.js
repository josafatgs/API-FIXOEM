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

async function addDevolution(devolutionData, devolutionItemData, devolutionImages, resolutionData, resolutionImages) {

  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const rangeDevolutionItem = 'Devolution Item';
  const rangeDevolution = 'Devolution';
  const rangeDevolutionImages = 'Devolution Image';
  const rangeResolution = 'Resolution';
  const rangeResolutionImages = 'Resolution Image';
  const valueInputOption = 'USER_ENTERED'; 


  const resourceDevolution = { values: devolutionData }; 
  const resourceDevolutionItems = { values: devolutionItemData };
  const resourceDevolutionImages = { values: devolutionImages };
  const resourceResolution = { values:  resolutionData};
  const resourceResolutionImages = { values: resolutionImages };

  try {

    const [devolutionResult, itemDevolutionResult, devolutionImagesResult, resolutionResult, resolutionImagesResult] = await Promise.all([
        sheets.spreadsheets.values.append({
            spreadsheetId, range: rangeDevolution, valueInputOption, resource: resourceDevolution
        }),
        sheets.spreadsheets.values.append({
          spreadsheetId, range: rangeDevolutionItem, valueInputOption, resource: resourceDevolutionItems
        }),
        sheets.spreadsheets.values.append({
          spreadsheetId, range: rangeDevolutionImages, valueInputOption, resource: resourceDevolutionImages
        }),
        sheets.spreadsheets.values.append({
          spreadsheetId, range: rangeResolution, valueInputOption, resource: resourceResolution
        }),
        sheets.spreadsheets.values.append({
          spreadsheetId, range: rangeResolutionImages, valueInputOption, resource: resourceResolutionImages
        })
    ]);

    return { devolutionResult, itemDevolutionResult, devolutionImagesResult, resolutionResult, resolutionImagesResult };
      
  } catch (error) {
      return error.message;  // Logs errors.
  }

}


async function updateDevolution(
  idDevolution, 
  devolutionData, 
  devolutionItemData, 
  devolutionImages, 
  resolutionData, 
  resolutionImages) {
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const rangeDevolutionItem = 'Devolution Item';
  const rangeDevolution = 'Devolution';
  const rangeDevolutionImages = 'Devolution Image';
  const rangeResolution = 'Resolution';
  const rangeResolutionImages = 'Resolution Image';

  const valueInputOption = 'USER_ENTERED'; 

  const resourceDevolution = { values: devolutionData }; 

  const resourceDevolutionItems = devolutionItemData.map( (ele) => {
    return { values: [ele] }
  });

  const resourceDevolutionImages = devolutionImages.map( (ele) => {
    return { values: [ele] }
  })
  
  const resourceResolution = { values:  resolutionData};

  const resourceResolutionImages = resolutionImages.map( (ele) => {
    return { values: [ele]}
  });



  // console.log(resourceDevolution);
  // console.log(resourceDevolutionItems);
  // console.log(resourceDevolutionImages);
  // console.log(resourceResolution);
  console.log(resolutionImages);

  let varRangeDevolutionItem = [];
  let varRangeDevolution;
  let varRangeDevolutionImages = [];
  let varRangeResolution;
  let varRangeResolutionImages = [];

  const isTheOne = ( element ) => {
    return element[0] == idDevolution;
  }

  const findOcurrences = (list, val) => {
    let indices = [];
  
    list.forEach((subList, outerIndex) => {
      if (subList[0] === val) {
        indices.push(outerIndex+1);
      }
    });
  
    return indices;
  }

  try {
    
    const allDevolutionData = await sheets.spreadsheets.values.get({
      spreadsheetId, range: rangeDevolution,
    });

    const allDevolutionItem = await sheets.spreadsheets.values.get({
      spreadsheetId, range: rangeDevolutionItem
    });

    const allDevolutionImages = await sheets.spreadsheets.values.get({
      spreadsheetId, range: rangeDevolutionImages
    });

    const allResolutionData = await sheets.spreadsheets.values.get({
      spreadsheetId, range: rangeResolution
    });

    const allResolutionImages = await sheets.spreadsheets.values.get({
      spreadsheetId, range: rangeResolutionImages
    });

    const res = [];


    const indexDevolutionData =  (allDevolutionData.data.values.findIndex( isTheOne ) + 1).toString();
    const indexDevolutionItem = findOcurrences(allDevolutionItem.data.values, idDevolution);
    const indexDevolutionImages = findOcurrences(allDevolutionImages.data.values, idDevolution);
    const indexResolutionData = (allResolutionData.data.values.findIndex(isTheOne) + 1).toString();
    const indexResolutionImages = findOcurrences(allResolutionImages.data.values, idDevolution);

    varRangeDevolution = rangeDevolution + "!A" + indexDevolutionData + ":M" + indexDevolutionData;
    
    indexDevolutionItem.forEach( (element) => {
      varRangeDevolutionItem.push(rangeDevolutionItem + "!A" + element + ":C" + element);
    })
  
    indexDevolutionImages.forEach( (element) => {
        varRangeDevolutionImages.push(rangeDevolutionImages  + "!A" + element + ":B" + element);
    })
    
    varRangeResolution = rangeResolution + "!A" + indexResolutionData + ":D" + indexResolutionData; 

    indexResolutionImages.forEach( (element) => {
      varRangeResolutionImages.push(rangeResolutionImages + "!A" + element + ":B" + element);
      res.push(allResolutionImages.data.values[element-1]);
    })

    console.log(res);
    
    return { 
      'Devolution': varRangeDevolution, 
      'Devolution Item': varRangeDevolutionItem,
      'DevolutionImages': varRangeDevolutionImages,
      'Resolution': varRangeResolution,
      'ResolutionImages': varRangeResolutionImages
    }

  } catch (error) {
    return error.message;
  }

  try {

    const [devolutionResult, itemDevolutionResult, devolutionImagesResult, resolutionResult, resolutionImagesResult] = await Promise.all([

      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: varRangeDevolution,
        valueInputOption,
        resource: resourceDevolution,
      }),
  
      Promise.all(resourceDevolutionItems.map((element, index) => {
        const range = varRangeDevolutionItem[index];
        // console.log(range);
        return sheets.spreadsheets.values.update({
          spreadsheetId,
          range: range,
          valueInputOption,
          resource: resourceDevolutionItems[index],
        });
      })),
  
      Promise.all(resourceDevolutionImages.map((element, index) => {
        const range = varRangeDevolutionImages[index];
        // console.log(range);
        return sheets.spreadsheets.values.update({
          spreadsheetId,
          range: range,
          valueInputOption,
          resource: resourceDevolutionImages[index],
        });
      })),
  
      sheets.spreadsheets.values.update({
        spreadsheetId,
        range: varRangeResolution,
        valueInputOption,
        resource: resourceResolution,
      }),
  
      Promise.all(resourceResolutionImages.map((element, index) => {
        
        const range = varRangeResolutionImages[index];
        // console.log(index);
        // console.log(range);

        if (range === undefined) {

          return sheets.spreadsheets.values.append({
            spreadsheetId,
            range: rangeResolutionImages,
            valueInputOption,
            resource: element,
          });

        } else {

          return sheets.spreadsheets.values.update({
            spreadsheetId,
            range: range ,
            valueInputOption,
            resource: element,
          });

        }
        
      }))

    ]);
  
    return { devolutionResult, itemDevolutionResult, devolutionImagesResult, resolutionResult, resolutionImagesResult };

  } catch (error) {
    return error.message;  // Logs errors.
  }
  

}

async function updateOnlyResolution(
  idDevolution, resolutionData) {
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const rangeResolution = 'Resolution';
  const valueInputOption = 'USER_ENTERED';
  const resourceResolution = { values:  resolutionData};

  let varRangeResolution;

  const isTheOne = ( element ) => {
    return element[0] == idDevolution;
  }

  try {
    
    const allResolutionData = await sheets.spreadsheets.values.get({
      spreadsheetId, range: rangeResolution
    });

    const indexResolutionData = (allResolutionData.data.values.findIndex(isTheOne) + 1).toString();

    varRangeResolution = rangeResolution + "!A" + indexResolutionData + ":D" + indexResolutionData;
    
    const resolutionResult =  sheets.spreadsheets.values.update({
      spreadsheetId,
      range: varRangeResolution,
      valueInputOption,
      resource: resourceResolution,
    })

    return resolutionResult;

  } catch (error) {
    return error.message;
  }
  
}

async function updateOnlyResolutionImages(
  idDevolution, resolutionDataImages) {

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.SPREADSHEET_ID;

    const valueInputOption = 'USER_ENTERED';
    const rangeResolutionImages = 'Resolution Image'
    const resourceResolutionImages = resolutionDataImages.map( (element) => {
      return { values: [element]}
    });

    let varRangeResolutionImages = [];
    let res = [];

    const findOcurrences = (list, val) => {
      let indices = {};
      let indexes = [];
    
      list.forEach((subList, outerIndex) => {
        if (subList[0] === val) {
          indices[subList[1]] = outerIndex+1;
          indexes.push(outerIndex+1);
        }
      });
    
      return [indices, indexes];
    }

    try {
      
      const allResolutionImages = await sheets.spreadsheets.values.get({
        spreadsheetId, range: rangeResolutionImages
      });

      const [indexResolutionImages, indixes] = findOcurrences(allResolutionImages.data.values, idDevolution);
      // console.log(indexResolutionImages);

      // return indexResolutionImages;
      
      indixes.forEach( (element) => {
        varRangeResolutionImages.push(rangeResolutionImages + "!A" + element + ":B" + element);
        res.push(allResolutionImages.data.values[element-1]);
      })

      const comparedLists = compareLists(resolutionDataImages, res);

      console.log(comparedLists);
      //console.log(res);

      if ( comparedLists.ToDelete.length > 0 ) {
        console.log(comparedLists.ToDelete);
        return;
        // Promise.all(comparedLists.ToDelete.map( (element, index) => {
        //   console.log(element);
        //   //const range = varRangeResolutionImages[index];
        //   //console.log(range);

        //   return sheets.spreadsheets.values.update({
        //     spreadsheetId,
        //     range: indexResolutionImages.element[0] +  ,
        //     valueInputOption,
        //     resource: { values: [['', '']] },
        //   });

        // }))
      }

      // if ( comparedLists.ToAppend.length > 0 ) {
      //   Promise.all(comparedLists.ToAppend.map( (element, index) => {
      //     console.log(comparedLists.ToAppend[index]);
      //     //console.log(element);

      //     return sheets.spreadsheets.values.append({
      //       spreadsheetId,
      //       range: rangeResolutionImages ,
      //       valueInputOption,
      //       resource: { values: [comparedLists.ToAppend[index]] },
      //     });

      //   }))
      // }
 
    } catch (error) {
      return error.message;
    }

}

async function updateOnlyDevolution(
  idDevolution, devolutionData) {
  
  const sheets = google.sheets({ version: 'v4', auth });
  const spreadsheetId = process.env.SPREADSHEET_ID;

  const rangeDevolution = 'Devolution';
  const valueInputOption = 'USER_ENTERED';
  const resourceDevolution = { values: devolutionData }; 

  let varRangeDevolution;

  const isTheOne = ( element ) => {
    return element[0] == idDevolution;
  }

  try {
    
    const allDevolutionData = await sheets.spreadsheets.values.get({
      spreadsheetId, range: rangeDevolution
    })

    const indexDevolutionData = (allDevolutionData.data.values.findIndex( isTheOne ) + 1).toString();

    varRangeDevolution = rangeDevolution + "!A" + indexDevolutionData + ":M" + indexDevolutionData;

    const devolutionResult = sheets.spreadsheets.values.update({
      spreadsheetId,
      range: varRangeDevolution,
      valueInputOption,
      resource: resourceDevolution,
    });

    return devolutionResult;

  } catch (error) {
    return error.message;
  }
}

function compareLists(ListaJson, ListaSheet) {

  let appendValues = [];
  let deleteValues = [];


  ListaJson.forEach( (element) => { 
    if (!ListaSheet.find((item) => JSON.stringify(item) === JSON.stringify(element))) {
      appendValues.push(element);
    }
  })

  ListaSheet.forEach( (element) => { 
    if (!ListaJson.find((item) => JSON.stringify(item) === JSON.stringify(element))) {
      deleteValues.push(element);
    }
  })


  return { ToAppend: appendValues, ToDelete: deleteValues }

}

module.exports = { 
  getReturnmentLabel,
  uploadImageFile, 
  uploadPDFFile, 
  deleteImage, 
  deleteReturnmentLabel,
  getImage,
  addDevolution,
  updateDevolution,
  updateOnlyDevolution,
  updateOnlyResolutionImages
};