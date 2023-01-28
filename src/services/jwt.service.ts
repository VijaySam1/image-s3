import {inject} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';
import {securityId, UserProfile} from '@loopback/security';
import {TokenBindings} from '../keys';
const jwt = require("jsonwebtoken");


export class JWTService {

  @inject(TokenBindings.token_secret)
  public readonly jwtSecret: string;
  @inject(TokenBindings.token_expires_in)
  public readonly expiresIn: string;

  async generateToken(userProfile: UserProfile): Promise<string> {
    if (!userProfile) {
      throw new HttpErrors.Unauthorized('user is null token not genrated')
    }
    let token = '';
    try {
      token = jwt.sign(userProfile, this.jwtSecret, {expiresIn: this.expiresIn})
    } catch (err) {
      throw new HttpErrors.Unauthorized(`error ${err}`)
    }
    return token
  }
  async verifyToken(token: string): Promise<UserProfile> {
    if (!token) {
      throw new HttpErrors.Unauthorized('token in valid')
    }
    let userProfile: UserProfile;
    try {
      const decryptedToken = jwt.verify(token, this.jwtSecret);
      userProfile = Object.assign(
        {id: "", name: "", [securityId]: "", permissons:[]},
        {id: decryptedToken.id, name: decryptedToken.name, [securityId]: decryptedToken.id, permissons: decryptedToken.permissions}
      )

    } catch (error) {
      throw new HttpErrors.Unauthorized(
        `error${error.message}`
      )
    }
    return userProfile
  }
}
