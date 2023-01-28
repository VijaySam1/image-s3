import {UserService} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {repository} from '@loopback/repository/dist/decorators';
import {HttpErrors} from '@loopback/rest';
import {securityId} from '@loopback/security';
import {PasswordBindings} from '../keys';
import {Auth} from '../models';
import {AuthRepository} from '../repositories';
import {Crdentials, MyUserProfile} from '../types';
import {BcryptHash} from './hash.bcrypt';


export class authService implements UserService<Auth, Crdentials>{
  constructor(
    @repository(AuthRepository)
    public authRepository: AuthRepository,
    @inject(PasswordBindings.passwordHash)
    public hasher: BcryptHash,
  ) { }
  async verifyCredentials(credentials: Crdentials): Promise<Auth> {
    const user = await this.authRepository.findOne({
      where: {
        userName: credentials.userName
      }
    });

    if (!user) {
      throw new HttpErrors.NotFound(`user not found with this ${credentials.userName}`)
    }

    const passwordMatched = await this.hasher.comparePassword(credentials.password, user.password);
    if (!passwordMatched) {
      throw new HttpErrors.Unauthorized('password not valid');
    }
    return user;
  }
  convertToUserProfile(user: Auth): MyUserProfile {
    console.log("ser", user)
    return {
      id: user.id,
      name: user.userName,
      permissions: user.permissions,
      [securityId]: user.id!,

    };
  }

}
