import {UserProfile} from '@loopback/security';
import {RequestHandler} from 'express-serve-static-core';
import {Permission} from './authorization/permissons.enum';
export type FileUploadHandler = RequestHandler;

/**
 * Objects with open properties
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any

export interface RequiredPermissions {
  required: Permission[];
}
export interface MyUserProfile extends UserProfile {
  permissions: Permission[] | string[];
}

export type AnyObject = Record<string, any>;
export type Crdentials = {
  userName: string;
  password: string;
};
