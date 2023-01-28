import {AuthenticationStrategy} from '@loopback/authentication';
import {inject} from '@loopback/core';
import {HttpErrors, Request} from '@loopback/rest';
import {UserProfile} from '@loopback/security';
import {JWTService} from '../services/jwt.service';
export class JWTStrategy implements AuthenticationStrategy {
  constructor(
    @inject('Services.jwt.service')
    public jwtService: JWTService
  ) { }
  name: string = 'jwt';
  async authenticate(
    request: Request
  ): Promise<UserProfile | undefined> {
    const token: string = this.extractCredentials(request)
    const userProfile = await this.jwtService.verifyToken(token)

    return Promise.resolve(userProfile)
  }
  extractCredentials(request: Request): string {
    if (!request.headers.authorization) {
      throw new HttpErrors.Unauthorized('auth header is missing')
    }
    const authHeaderValue = request.headers.authorization;
    if (!authHeaderValue.startsWith('Bearer')) {
      throw new HttpErrors.Unauthorized('auth is not in type bearer')
    }
    const parts = authHeaderValue.split(' ');
    if (parts.length !== 2) {
      throw new HttpErrors.Unauthorized('not a valid token')
    }
    const token = parts[1];
    return token;
  }
}
