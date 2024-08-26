
const express = require('express');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' })

const path = require('path');
const fs = require('fs');
const { auth } = require('googleapis/build/src/apis/abusiveexperiencereport');
const app = express();
const port = 5000;


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { getReturnmentLabel, getImage, uploadImageFile, uploadPDFFile, deleteImage, deleteReturnmentLabel } = require("./google-drive-functions");

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
        res.send(error);

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


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
})