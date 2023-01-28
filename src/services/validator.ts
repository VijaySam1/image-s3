import {HttpErrors} from '@loopback/rest';
import {Crdentials} from '../types';


export const validateCredentials = (credentials: Crdentials) => {
  if (credentials.userName.length < 4) {
    throw new HttpErrors.UnprocessableEntity('invalid username')

  }
  if (credentials.password.length < 8) {
    throw new HttpErrors.UnprocessableEntity('invalid password,please enter a password with atleast 8 charecters')
  }

}
