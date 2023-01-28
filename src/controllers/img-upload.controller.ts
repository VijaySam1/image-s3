import {authenticate, AuthenticationBindings} from '@loopback/authentication';
import {Getter, inject} from '@loopback/core';
import {
  post,
  Request,
  requestBody,
  Response,
  RestBindings,
} from '@loopback/rest';
import {securityId} from '@loopback/security';
import fs from 'fs';
import {Permission} from '../authorization/permissons.enum';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {SharpService} from '../services/sharp.service';
import {FileUploadHandler, MyUserProfile} from '../types';
/**
 * A controller to handle file uploads using multipart/form-data media type
 */

export class FileUploadController {
  /**
   * Constructor
   * @param handler - Inject an express request handler to deal with the request
   */

  constructor(
    @inject(FILE_UPLOAD_SERVICE) private handler: FileUploadHandler,
    @inject('sharp')
    private sharpService: SharpService,
    @inject.getter(AuthenticationBindings.CURRENT_USER)
    public getCurrentUser: Getter<MyUserProfile>,
  ) {}

  @post('/files', {
    responses: {
      200: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
            },
          },
        },
        description: 'Files and fields',
      },
    },
  })
  @authenticate({
    strategy: 'jwt',
    options: {required: [Permission.AccessAuthFeature]},
  })
  async fileUpload(
    @requestBody.file()
    request: Request,
    @inject(RestBindings.Http.RESPONSE) response: Response,
  ): Promise<any> {
    const user = await this.getCurrentUser();
    return new Promise<object>((resolve, reject) => {
      //it enables multer service
      this.handler(request, response, async (err: unknown) => {
        if (err) reject(err);
        else {
          //it used to parse the request file'
          const file = this.getFilesAndFields(request).files[0];
          //pass the file to sharp service and resize
          await this.sharpService
            .resize(file.filename, user[securityId])
            .then(resizedImage => {
              setTimeout(() => {
                fs.unlink(`${file.path}`, (err: any) => {
                  if (err) reject(err);
                });
              }, 500);
              resolve({message: 'Image uploaded successfully'});
            })
            .catch((err: any) => {
              reject(err);
            });
        }
      });
    });
  }

  /**
   * Get files and fields for the request
   * @param request - Http request
   */
  getFilesAndFields(request: Request) {
    const uploadedFiles = request.files;
    const mapper = (f: globalThis.Express.Multer.File) => ({
      filename: f.filename,
      path: f.path,
    });
    let files: {filename: string; path: string}[] = [];
    if (Array.isArray(uploadedFiles)) {
      files = uploadedFiles.map(mapper);
    } else {
      for (const filename in uploadedFiles) {
        files.push(...uploadedFiles[filename].map(mapper));
      }
    }
    return {files: files};
  }
}
