import {BindingKey} from '@loopback/core';
import {passwordHash} from './services/hash.bcrypt';
import {FileUploadHandler} from './types';
// Binding key for the file upload service
export const FILE_UPLOAD_SERVICE =
  BindingKey.create<FileUploadHandler>('services.FileUpload',);// Binding key for the storage directory
export const STORAGE_DIRECTORY = BindingKey.create<string>
  ('storage.directory');


export namespace TokenConstants {
  export const token_secret_value = 'thisisthesecretkey'
  export const token_expires_in = '5h'
}

export namespace TokenBindings {
  export const token_secret = BindingKey.create<string>(
    'authentication.jwt.secret'
  )
  export const token_expires_in = BindingKey.create<string>(
    'authentication.jwt.expiresIn'
  )

}

export namespace PasswordBindings {
  export const passwordHash = BindingKey.create<passwordHash>(
    'services.hasher'
  )
  export const rounds = BindingKey.create<number>(
    'services.hasher.rounds'
  )

}



