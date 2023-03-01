/* eslint-disable no-undef */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
require('dotenv/config');

const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const crypto = require('node:crypto');
const express = require('express');
const Nunjucks = require('nunjucks');
const HTTPErrors = require('http-errors');
const morgan = require('morgan');
const multer = require('multer');
const Jimp = require('jimp');
const { readFileSync } = require('node:fs');
const mime = require('mime');
const KNN = require('ml-knn');
const childProcess = require('node:child_process');
const { sequelize, DataTraining } = require('./database');

sequelize.sync({
  truncate: true,
});

const trainData = {
  dataSets: [],
  dataLabels: [],
};

let knn;

DataTraining.findAll().then((train) => {
  train.forEach((item) => {
    trainData.dataSets.push(Object.values(JSON.parse(item.data)));
    trainData.dataLabels.push(item.label);
  });

  knn = new KNN(trainData.dataSets, trainData.dataLabels);
});

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, path.join(__dirname, 'uploads'));
  },
  filename: (req, file, callback) => {
    callback(null, `${crypto.randomBytes(20).toString('hex')}`);
  },
});

const upload = multer({ storage });

const app = express();

const GLCM = (file) => new Promise((resolve, reject) => {
  const glcm = childProcess.spawn('python', ['GLCM.py', file]);
  let result = '';

  glcm.stdout.on('data', (data) => {
    const output = data.toString().trim();
    for (let i = 0; i < output.length; i++) {
      result += output[i].toString().trim();
    }
  });

  glcm.on('close', () => {
    try {
      resolve(JSON.parse(result));
    } catch (e) {
      reject(e);
    }
  });
});

new Nunjucks.Environment(
  new Nunjucks.FileSystemLoader(`${process.cwd()}/views`, {
    watch: process.env.NODE_ENV === 'development',
    noCache: process.env.NODE_ENV === 'development',
  }),
  {
    autoescape: false,
  },
).express(app.set('view engine', 'njk'));

app.use(morgan('dev'));
app.use('/uploads', express.static('./uploads'));

const imageProcessing = async (req, res, next) => {
  try {
    const file = readFileSync(req.file.path);
    const image = await Jimp.read(file);
    const { _originalMime } = image;
    const filePath = path.dirname(req.file.path);
    const fileName = path.basename(req.file.path);
    const fileExt = mime.getExtension(_originalMime);

    // rename file
    fs.renameSync(req.file.path, `${filePath}/${fileName}.${fileExt}`);

    const grayscale = image.clone().grayscale();
    await grayscale.write(`${filePath}/${fileName}-grayscale.${fileExt}`);

    grayscale.convolute([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]]).write(`${filePath}/${fileName}-texture.${fileExt}`);

    let num = 0;
    const GLCMRun = await GLCM(`${filePath}/${fileName}.${fileExt}`);
    const GLCMData = {};
    const angles = ['0', '45', '90', '135'];
    const properties = ['dissimilarity', 'correlation', 'homogeneity', 'contrast', 'ASM', 'energy'];

    for (let p = 0; p < properties.length; p++) {
      for (let a = 0; a < angles.length; a++) {
        Object.assign(GLCMData, { [`${properties[p]}_${angles[a]}`]: GLCMRun[num] });
        num++;
      }
    }

    const images = {
      grayscale: `${fileName}-grayscale.${fileExt}`,
      texture: `${fileName}-texture.${fileExt}`,
    };

    const predict = knn.predict(Object.values(GLCMData));

    res.data = {
      glcm: GLCMData,
      knn: {
        label: predict,
      },
      images,
    };

    if (req.body.train) {
      await DataTraining.create({
        label: req.body.label,
        data: JSON.stringify(GLCMData),
        images: JSON.stringify(images),
      });
    }

    return next();
  } catch (error) {
    return res.json({
      status: 'error',
      message: error.message,
    });
  }
};

app.get('/', (req, res, next) => {
  DataTraining.findAll().then((dataTraining) => {
    res.json({
      status: 'success',
      data: dataTraining.map((item) => ({
        id: item.id,
        label: item.label,
        data: JSON.parse(item.data),
        images: JSON.parse(item.images),
      })),
    });
  }, next);
});

app.post('/upload', upload.single('image'), imageProcessing, async (req, res) => {
  res.json({
    status: 'success',
    data: res.data,
  });
});

app.use((req, res, next) => next(HTTPErrors(404)));
app.use((error, req, res, next) => {
  console.log(error);
  const errorStatus = error.status || 500;
  if (res.headersSent) {
    return next();
  }

  return res.status(errorStatus).json({
    status: 'error',
    message: error,
  });
});

const server = http.createServer(app);
server.listen(process.env.PORT || 8080);
