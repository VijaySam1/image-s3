import {inject} from '@loopback/core';
import {repository} from '@loopback/repository';
import {
  getModelSchemaRef,
  HttpErrors,
  post,
  requestBody,
  response,
} from '@loopback/rest';
import _ from 'lodash';
import {Permission} from '../authorization/permissons.enum';
import {PasswordBindings} from '../keys';
import {Auth, Login} from '../models';
import {AuthRepository} from '../repositories';
import {BcryptHash} from '../services/hash.bcrypt';
import {JWTService} from '../services/jwt.service';
import {authService} from '../services/user.service';
import {validateCredentials} from '../services/validator';
import {Crdentials} from '../types';
export class AuthController {
  constructor(
    @repository(AuthRepository)
    public authRepository: AuthRepository,
    @inject(PasswordBindings.passwordHash)
    public hasher: BcryptHash,
    @inject('Services.user.service')
    public userService: authService,
    @inject('Services.jwt.service')
    public jwtService: JWTService,
  ) {}

  @post('/signUp')
  @response(200, {
    description: 'Auth model instance',
    content: {'application/json': {schema: getModelSchemaRef(Auth)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Auth, {
            title: 'NewAuth',
            exclude: ['id'],
          }),
        },
      },
    })
    auth: Omit<Auth, 'id'>,
  ): Promise<any> {
    try {
      validateCredentials(_.pick(auth, ['userName', 'password']));
      auth.permissions = [Permission.AccessAuthFeature];
      auth.password = await this.hasher.hashPassWord(auth.password);
      const {password, ...user} = await this.authRepository.create(auth);
      return user;
    } catch (err) {
      if (err.code === 11000) {
        throw new HttpErrors.Conflict('Duplicate key error');
      }
      throw Error(err);
    }
  }

  @post('/login')
  @response(200, {
    description: 'token',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            token: {
              type: 'string',
            },
          },
        },
      },
    },
  })
  async login(
    @requestBody({
      description: 'the input of login function',
      required: true,
      content: {
        'application/json': {schema: getModelSchemaRef(Login)},
      },
    })
    credentials: Crdentials,
  ): Promise<{token: string}> {
    const user = await this.userService.verifyCredentials(credentials);

    const userProfile = this.userService.convertToUserProfile(user);

    const token = await this.jwtService.generateToken(userProfile);
    return Promise.resolve({token});
  }

  @post('/createAdmin')
  @response(200, {
    description: 'Auth model instance',
    content: {'application/json': {schema: getModelSchemaRef(Auth)}},
  })
  async createAdmin(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Auth, {
            title: 'NewAuth',
            exclude: ['id'],
          }),
        },
      },
    })
    auth: Omit<Auth, 'id'>,
  ): Promise<Auth> {
    validateCredentials(_.pick(auth, ['userName', 'password']));
    auth.permissions = [
      Permission.Create,
      Permission.Update,
      Permission.Delete,
      Permission.AccessAuthFeature,
    ];
    auth.password = await this.hasher.hashPassWord(auth.password);
    const user = this.authRepository.create(auth);
    return user;
  }

  // @get('/auths/count')
  // @response(200, {
  //   description: 'Auth model count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async count(
  //   @param.where(Auth) where?: Where<Auth>,
  // ): Promise<Count> {
  //   return this.authRepository.count(where);
  // }

  // @get('/auths')
  // @response(200, {
  //   description: 'Array of Auth model instances',
  //   content: {
  //     'application/json': {
  //       schema: {
  //         type: 'array',
  //         items: getModelSchemaRef(Auth, {includeRelations: true}),
  //       },
  //     },
  //   },
  // })
  // async find(
  //   @param.filter(Auth) filter?: Filter<Auth>,
  // ): Promise<Auth[]> {
  //   return this.authRepository.find(filter);
  // }

  // @patch('/auths')
  // @response(200, {
  //   description: 'Auth PATCH success count',
  //   content: {'application/json': {schema: CountSchema}},
  // })
  // async updateAll(
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Auth, {partial: true}),
  //       },
  //     },
  //   })
  //   auth: Auth,
  //   @param.where(Auth) where?: Where<Auth>,
  // ): Promise<Count> {
  //   return this.authRepository.updateAll(auth, where);
  // }

  // @get('/auths/{id}')
  // @response(200, {
  //   description: 'Auth model instance',
  //   content: {
  //     'application/json': {
  //       schema: getModelSchemaRef(Auth, {includeRelations: true}),
  //     },
  //   },
  // })
  // async findById(
  //   @param.path.string('id') id: string,
  //   @param.filter(Auth, {exclude: 'where'}) filter?: FilterExcludingWhere<Auth>
  // ): Promise<Auth> {
  //   return this.authRepository.findById(id, filter);
  // }

  // @patch('/auths/{id}')
  // @response(204, {
  //   description: 'Auth PATCH success',
  // })
  // async updateById(
  //   @param.path.string('id') id: string,
  //   @requestBody({
  //     content: {
  //       'application/json': {
  //         schema: getModelSchemaRef(Auth, {partial: true}),
  //       },
  //     },
  //   })
  //   auth: Auth,
  // ): Promise<void> {
  //   await this.authRepository.updateById(id, auth);
  // }

  //   @put('/auths/{id}')
  //   @response(204, {
  //     description: 'Auth PUT success',
  //   })
  //   async replaceById(
  //     @param.path.string('id') id: string,
  //     @requestBody() auth: Auth,
  //   ): Promise<void> {
  //     await this.authRepository.replaceById(id, auth);
  //   }

  //   @del('/auths/{id}')
  //   @response(204, {
  //     description: 'Auth DELETE success',
  //   })
  //   async deleteById(@param.path.string('id') id: string): Promise<void> {
  //     await this.authRepository.deleteById(id);
  //   }
}
