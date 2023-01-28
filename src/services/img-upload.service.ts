import {
  BindingScope,
  config,
  ContextTags,
  injectable,
  Provider,
} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import multer from 'multer';
import path from 'path';
import {FILE_UPLOAD_SERVICE} from '../keys';
import {FileUploadHandler} from '../types';

/**
 * A provider to return an `Express` request handler from `multer` middleware
 */
@injectable({
  scope: BindingScope.TRANSIENT,
  tags: {[ContextTags.KEY]: FILE_UPLOAD_SERVICE},
})
export class FileUploadProvider implements Provider<FileUploadHandler> {
  constructor(@config() private options: multer.Options = {}) {
    if (!this.options.storage) {
      // Default to in-memory storage
      this.options.storage = multer.memoryStorage();
      this.options.fileFilter = (req, file, cb) => {
        // Allowed ext
        const filetypes = /jpeg|jpg|png/;
        // Check ext
        const extname = filetypes.test(
          path.extname(file.originalname).toLowerCase(),
        );
        // Check mimed
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
          return cb(null, true);
        } else {
          cb(new HttpErrors.UnprocessableEntity('unsupported file format'));
        }
      };
    }
  }

  value(): FileUploadHandler {
    return multer(this.options).any();
  }
}
