require('dotenv').config()
const express = require('express')
const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3-transform')
const path = require('path')
const ejs = require('ejs')
const sharp = require('sharp')

aws.config.update({
    secretAccessKey: process.env.AWSSecretKey,
    accessKeyId: process.env.AWSAccessKeyId,
    region: 'eu-central-1'
})

const s3 = new aws.S3()


const upload = multer({
    storage: multerS3({
        s3: s3,
        bucket: 'gmens-test-1',
        region: 'eu-central-1',
        acl: 'public-read',
        contentType: multerS3.AUTO_CONTENT_TYPE,
        limits: { fileSize: 5000000 },

        //* add a function 'Please upload .jpg .jpeg .png' here

        shouldTransform: function (req, file, cb) {
            cb(null, /^image/i.test(file.mimetype))
        },
        transforms: [{
            id: 'manipulated',
            key: function (req, file, cb) {
                let fileSplit = file.originalname.split('.')

                let filename = fileSplit.slice(0, fileSplit.length - 1)
                filename.push(Date.now())
                filename = filename.join('_') + '.' + fileSplit[fileSplit.length - 1]

                cb(null, filename)
            },
            transform: function (req, file, cb) {
                cb(null, sharp().jpeg({
                    quality: 70,
                })
                    //.resize(300)
                    .modulate({ hue: 120 }))
            }
        }]
    })
})

// Init app
const app = express()
app.set('view engine', 'ejs')

// Public folder
app.use(express.static('./public'))

app.get('/', (req, res) => {

    s3.listObjectsV2({
        Bucket: 'gmens-test-1',
        MaxKeys: 1000,
        Prefix: '',
        Delimiter: '/'
    }, function (err, data) {
        if (err) {
            console.log(err, err.stack); // an error occurred
        } else {
            const imgData = [];
            var contents = data.Contents
            contents.forEach(function (content) {
                imgData.push(content.Key);
            });
            res.render('index', {
                imgUrl: '',
                imgUrls: imgData,
                introOff: false
            })
        }
    })
})


app.post('/upload', upload.single('myImage'), (req, res, next) => {

    if (!req.file) {
        res.render('index', {
            msg: 'Error: No File Selected!'
        })
    } else {
        s3.listObjectsV2({
            Bucket: 'gmens-test-1',
            MaxKeys: 1000,
            Prefix: '',
            Delimiter: '/'
        }, function (err, data) {
            if (err) {
                console.log(err, err.stack); // an error occurred
            } else {
                const imgData = [];
                var contents = data.Contents
                contents.forEach(function (content) {
                    imgData.push(content.Key);
                });
                res.render('index', {
                    msg: 'File Uploaded!',
                    imgUrl: req.file.transforms[0].location,
                    imgUrls: imgData,
                    introOff: true

                })
            }
        })

    }
})


const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log('Server started on ' + port)
})
