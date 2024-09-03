
const express = require('express');
const bodyParser = require('body-parser')
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const path = require('path');
const fs = require('fs');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');
const app = express();
const port = 5000;


app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

const { updateOnlyResolutionImages,updateDevolution, addDevolution, getReturnmentLabel, getImage, uploadImageFile, uploadPDFFile, deleteImage, deleteReturnmentLabel } = require("./google-utils");

app.post('/uploadPhoto', upload.single('image'), async (req, res) => { 
    
    try {
        if (!req.file) {
            fs.unlinkSync(req.file.path);
            return res.status(400).send('No file uploaded.');
        }

        const { operationId } = req.body; 
    
        // Call the function to upload the image file to Google Drive
        const result = await uploadImageFile(req.file.path, operationId);

        // Delete the temporary file
        fs.unlinkSync(req.file.path);
    
        // Respond with the result from Google Drive API
        res.send(result);
    } catch (error) {
        fs.unlinkSync(req.file.path);
        res.status(500).send(error.message);
    }

});


app.post('/uploadReturnmentLabel', upload.single('returnmentLabel'), async (req, res) => {

    try {
        
        if (!req.file) {
            fs.unlinkSync(req.file.path);
            return res.status(400).send('No file uploaded.');
        }

        const { operationId } = req.body;
    
        // Call the function to upload the image file to Google Drive
        const result = await uploadPDFFile(req.file.path, operationId);

        // Delete the temporary file
        fs.unlinkSync(req.file.path);
    
        // Respond with the result from Google Drive API
        res.send(result);

    } catch (error) {
        res.status(500).send(error.message);
    }

});



app.delete('/deleteImage/', async (req, res) => {
    
    try {
        
        const { operationId } = req.query;

        const result = await deleteImage(operationId);
        
        res.send(result);
    } catch (error) {
        res.status(500).send(error.message);
    }

})

app.delete('/deleteReturnmentLabel/', async (req, res) => {

    try {

        const { operationId } = req.query;
        const result = await deleteReturnmentLabel(operationId);
        res.send(result);

    } catch (error) {
        res.status(500).send(error.message);
    }

});

app.get('/getReturnmentLabel/', async (req, res) => {
    try {
        const { documentIdentifier } = req.query;

        if (!documentIdentifier) {
            return res.status(400).send('imageIdentifier is required');
        }
        
        const file = await getReturnmentLabel(documentIdentifier);

        res.setHeader('Content-Type', 'application/pdf');

        file
            .on('end', () => {
                console.log('Done');
            })
            .on('error', err => {
                console.log('Error', err);
                res.status(500).send('Error downloading file');
            })
            .pipe(res);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
})

app.get('/getImage/', async (req, res) => {
    try {
        const { documentIdentifier } = req.query;

        if (!documentIdentifier) {
            return res.status(400).send('imageIdentifier is required');
        }
        
        const file = await getImage(documentIdentifier);

        res.setHeader('Content-Type', 'application/pdf');

        file
            .on('end', () => {
                console.log('Done');
            })
            .on('error', err => {
                console.log('Error', err);
                res.status(500).send('Error downloading file');
            })
            .pipe(res);
        
    } catch (error) {
        res.status(500).send(error.message);
    }
})

app.post('/spreadsheet/devolution', async (req, res) => {
    try {

        const devolution = req.body;

        const uid = Number.parseFloat(
            Number(devolution['devolution'][0]["date"].replaceAll("-", "") + devolution['devolution'][0]["ticketNumber"]) / 2
        ).toFixed(0);


        let columnsDevolution = devolution['devolution'].map(e => Object.keys(e))[0];
        columnsDevolution = ["uid"].concat(columnsDevolution);
        let devolutionData = [];


        for (item of devolution['devolution']) {
            let row = [];
            for (column of columnsDevolution) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            devolutionData.push(row);
        };

        console.log(devolutionData);

    
        let columnsItems = devolution['items'].map(e => Object.keys(e))[0];
        columnsItems = ["uid"].concat(columnsItems);
        let devolutionItems = [];


        for (item of devolution['items']) {
            let row = [];
            for (column of columnsItems) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            devolutionItems.push(row);
        };

        console.log(devolutionItems);

        let columnsImages = devolution['images'].map(e => Object.keys(e))[0];
        columnsImages = ["uid"].concat(columnsImages);
        let devolutionImages = [];


        for (item of devolution['images']) {
            let row = [];
            for (column of columnsImages) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            devolutionImages.push(row);
        };

        console.log(devolutionImages);

        let columnsResolution = devolution['resolution'].map(e => Object.keys(e))[0];
        columnsResolution = ["uid"].concat(columnsResolution);
        let resolutionData = [];


        for (item of devolution['resolution']) {
            let row = [];
            for (column of columnsResolution) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            resolutionData.push(row);
        };

        console.log(resolutionData);

        let columnsResolutionImages = devolution['resolution_images'].map(e => Object.keys(e))[0];
        columnsResolutionImages = ["uid"].concat(columnsResolutionImages);
        let resolutionImages = [];


        for (item of devolution['resolution_images']) {
            let row = [];
            for (column of columnsResolutionImages) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            resolutionImages.push(row);
        };

        const result = await addDevolution(devolutionData, devolutionItems, devolutionImages, resolutionData, resolutionImages);
        res.send(result);

    } catch (error) {
        res.status(500).send(error.message);
    }
})

app.delete('/spreadsheet/devolution/image', async (req, res) => {
    
})

app.put('/spreadsheet/devolution/', async (req, res) => {


    try {
        
        const devolution = req.body;
        const uid = devolution['id'];

        let columnsDevolution = devolution['devolution'].map(e => Object.keys(e))[0];
        columnsDevolution = ["uid"].concat(columnsDevolution);
        let devolutionData = [];


        for (item of devolution['devolution']) {
            let row = [];
            for (column of columnsDevolution) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            devolutionData.push(row);
        };

        //console.log(devolutionData);

    
        let columnsItems = devolution['items'].map(e => Object.keys(e))[0];
        columnsItems = ["uid"].concat(columnsItems);
        let devolutionItems = [];


        for (item of devolution['items']) {
            let row = [];
            for (column of columnsItems) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            devolutionItems.push(row);
        };

       // console.log(devolutionItems);

        let columnsImages = devolution['images'].map(e => Object.keys(e))[0];
        columnsImages = ["uid"].concat(columnsImages);
        let devolutionImages = [];


        for (item of devolution['images']) {
            let row = [];
            for (column of columnsImages) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            devolutionImages.push(row);
        };

        //console.log(devolutionImages);

        let columnsResolution = devolution['resolution'].map(e => Object.keys(e))[0];
        columnsResolution = ["uid"].concat(columnsResolution);
        let resolutionData = [];


        for (item of devolution['resolution']) {
            let row = [];
            for (column of columnsResolution) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            resolutionData.push(row);
        };

        //console.log(resolutionData);

        let columnsResolutionImages = devolution['resolution_images'].map(e => Object.keys(e))[0];
        columnsResolutionImages = ["uid"].concat(columnsResolutionImages);
        let resolutionImages = [];


        for (item of devolution['resolution_images']) {
            let row = [];
            for (column of columnsResolutionImages) {

                if (column == "uid") {
                    row.push(uid)
                } else {
                    row.push(item[column]);
                }
            }
            resolutionImages.push(row);
        };

        //const result = await updateDevolution(uid, devolutionData, devolutionItems, devolutionImages, resolutionData, resolutionImages);
        const result = await updateOnlyResolutionImages(uid, resolutionImages);
        res.send(result);

    } catch (error) {
        res.status(500).send(error.message);
    }
});


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})