/* eslint-disable max-len */
/* eslint-disable no-param-reassign */
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
const childProcess = require('node:child_process');
const { sequelize, DataTrainingGLCM, DataTrainingHistogram } = require('./database');

sequelize.sync({
  alter: true,
}).then(() => {
  const storage = multer.diskStorage({
    destination: (req, file, callback) => callback(null, path.join(__dirname, 'uploads')),
    filename: (req, file, callback) => {
      DataTrainingGLCM.count().then((count) => {
        const { label, increment } = req.body;
        const fileName = label ? label.toLowerCase().replace(/\s/g, '-') : crypto.randomBytes(20).toString('hex');
        callback(null, `${fileName}-${!Number.isNaN(parseFloat(increment)) ? parseFloat(increment) : count + 1}`);
      }, callback);
    },
  });

  const upload = multer({ storage });

  const app = express();

  app.use(express.json());
  app.use(express.raw());
  app.use(express.urlencoded({ extended: true }));

  function ColorHistogram(image) {
    function rgbToHsv(r, g, b) {
      r /= 255;
      g /= 255;
      b /= 255;

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h; const
        v = max;

      const d = max - min;
      const s = max === 0 ? 0 : d / max;

      if (max === min) {
        h = 0; // grayscale
      } else {
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;

          default:
            break;
        }
        h /= 6;
      }

      return { hue: h * 360, saturation: s, value: v };
    }
    const histogram = [];

    for (let i = 0; i < 16; i++) {
      histogram[i] = 0;
    }

    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function pixel(x, y, idx) {
      const red = this.bitmap.data[idx + 0];
      const green = this.bitmap.data[idx + 1];
      const blue = this.bitmap.data[idx + 2];
      const hsv = rgbToHsv(red, green, blue);
      const hue = Math.floor(hsv.hue * (16 / 360));
      histogram[hue]++;
    });

    return histogram;
  }

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
  app.get('/data', async (req, res, next) => {
    try {
      const GLCMTraining = await DataTrainingGLCM.findAll();
      const GLCMData = GLCMTraining.map((item) => ({
        label: item.label,
        data: JSON.parse(item.data),
        images: JSON.parse(item.images),
      }));
      res.json({
        GLCM: GLCMData,
      });
    } catch (e) {
      next(e);
    }
    // DataTrainingGLCM.findAll().then((data) => {
    //   res.json(data.map((item) => ({
    //     ...item.dataValues,
    //     GLCM: JSON.parse(item.data),
    //     images: JSON.parse(item.images),
    //   })));
    // }, next);
  });

  const imageProcessing = async (req, res, next) => {
    try {
      const file = readFileSync(req.file.path);
      const image = await Jimp.read(file);
      const colorHistogram = ColorHistogram(image);
      const { _originalMime } = image;
      const filePath = path.dirname(req.file.path);
      const fileName = path.basename(req.file.path);
      const fileExt = mime.getExtension(_originalMime);
      const grayscale = image.clone().grayscale();

      fs.renameSync(req.file.path, `${filePath}/${fileName}.${fileExt}`);

      grayscale.write(`${filePath}/${fileName}-grayscale.${fileExt}`);
      grayscale.convolute([[-2, -1, 0], [-1, 1, 1], [0, 1, 2]]).write(`${filePath}/${fileName}-texture.${fileExt}`);

      let num = 0;
      const GLCMRun = await GLCM(`${filePath}/${fileName}.${fileExt}`);
      const GLCMData = {};
      const angles = ['0', '45', '90', '135'];
      const properties = ['contrast', 'energy', 'homogeneity'];

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

      const KNN = new Promise((resolve, reject) => {
        DataTrainingGLCM.findAll().then((rows) => {
          const train = rows.map((item) => ({
            label: item.label,
            criteria: Object.values(JSON.parse(item.data)),
          }));

          const euclidean = train.map((data) => {
            const glcm = Object.values(GLCMData);
            const distance = data.criteria
              .map((val, k) => (glcm[k] - val) ** 2)
              .reduce((a, b) => a + b, 0);

            return {
              label: data.label,
              distance,
            };
          });

          resolve(euclidean);
        }, reject);
      });

      const KNNColorHistogram = new Promise((resolve, reject) => {
        DataTrainingHistogram.findAll().then((rows) => {
          const train = rows.map((item) => ({
            label: item.label,
            criteria: JSON.parse(item.data),
          }));

          const euclidean = train.map((data) => {
            const distance = data.criteria
              .map((val, k) => (colorHistogram[k] - val) ** 2)
              .reduce((a, b) => a + b, 0);

            return {
              label: data.label,
              distance,
            };
          });

          resolve(euclidean);
        }, reject);
      });

      res.data = {
        GLCM: GLCMData,
        colorHistogram,
        images,
      };

      if (req.body?.train && req.body.train.toString().toLowerCase() === 'false') {
        const KNNResultGLCM = await KNN;
        const KNNResultColorHistogram = await KNNColorHistogram;

        const GLCMdistances = KNNResultGLCM.map((item) => item.distance);
        const KNNGLCMIndex = KNNResultGLCM.findIndex((val) => val.distance === Math.min(...GLCMdistances));

        const Histogramdistances = KNNResultGLCM.map((item) => item.distance);
        const KNNHistogramIndex = KNNResultGLCM.findIndex((val) => val.distance === Math.min(...Histogramdistances));
        Object.assign(res.data, {
          KNNGLCM: {
            current: KNNResultGLCM[KNNGLCMIndex],
            results: KNNResultGLCM,
          },
          KNNColorHistogram: {
            current: KNNResultColorHistogram[KNNHistogramIndex],
            results: KNNResultColorHistogram,
          },
        });
      }

      if (req.body?.train && req.body.train.toString().toLowerCase() === 'true') {
        await DataTrainingGLCM.create({
          label: req.body.label,
          data: JSON.stringify(GLCMData),
          images: JSON.stringify(images),
        });

        await DataTrainingHistogram.create({
          label: req.body.label,
          data: JSON.stringify(colorHistogram),
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

  app.get('/', (req, res) => res.render('index'));
  app.get('/try', (req, res) => res.render('try'));

  app.head('/', (req, res, next) => {
    DataTrainingGLCM.findAll().then((dataTraining) => {
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
  server.on('listening', () => {
    console.log(`Server started on port ${server.address().port}`);
  });

  server.listen(process.env.PORT || 8080);
});
