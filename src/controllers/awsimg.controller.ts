// Uncomment these imports to begin using these cool features!

// import {inject} from '@loopback/core';

import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {
  post,
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import AWS from 'aws-sdk';

import {securityId} from '@loopback/security';
import multer from 'multer';
import sharp from 'sharp';
import stream from 'stream';
import {Permission} from '../authorization/permissons.enum';
import {config} from '../config';
import {MyUserProfile} from '../types';

const {Duplex} = stream;

function bufferToStream(buffer: any) {
  const duplexStream = new Duplex();
  duplexStream.push(buffer);
  duplexStream.push(null);
  return duplexStream;
}

const s3 = new AWS.S3(config);
export class AwsimgController {
  constructor(
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile>,
  ) {}

  @post('/profile-image-upload', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: '',
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {required: [Permission.AccessAuthFeature]},
  })
  async upload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<object> {
    return new Promise<object>(async (resolve, reject) => {
      const storage = multer.memoryStorage();
      const upload = multer({storage});
      const user = await this.getCurrentUser();
      const bucketName = 'aws-s3-img-upload';
      upload.any()(request, response, async err => {
        if (err) reject(err);
        else {
          let res = new Array();
          for (const file of (request as any).files) {
            const optimized = await sharp(file.buffer)
              .resize(320, 320)
              .toBuffer();
            const params = {
              Bucket: bucketName,
              Key: `${user[securityId]}.jpg`, // File name you want to save as in S3
              Body: bufferToStream(optimized),
            };
            try {
              const stored = await s3.upload(params).promise();
              res.push(stored);
            } catch (err) {
              reject(err);
            }
          }
          resolve(res);
        }
      });
    });
  }
}
