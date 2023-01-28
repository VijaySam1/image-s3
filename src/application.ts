import {AuthenticationComponent, registerAuthenticationStrategy} from '@loopback/authentication';
import {JWTAuthenticationComponent} from '@loopback/authentication-jwt';
import {BootMixin} from '@loopback/boot';
import {ApplicationConfig, createBindingFromClass} from '@loopback/core';
import {RepositoryMixin} from '@loopback/repository';
import {RestApplication} from '@loopback/rest';
import {
  RestExplorerBindings,
  RestExplorerComponent
} from '@loopback/rest-explorer';
import {ServiceMixin} from '@loopback/service-proxy';
import path from 'path';
import {JWTStrategy} from './authStrategies/jwt.strategy';
import {ErrorInterceptor} from './interceptors';

import {PasswordBindings, TokenBindings, TokenConstants} from './keys';
import {ErrorHandlerMiddlewareProvider} from './middlewares';
import {MySequence} from './sequence';
import {BcryptHash} from './services/hash.bcrypt';
import {JWTService} from './services/jwt.service';
import {SharpService} from './services/sharp.service';
import {authService} from './services/user.service';

export {ApplicationConfig};

export class StarterApplication extends BootMixin(
  ServiceMixin(RepositoryMixin(RestApplication)),
) {
  constructor(options: ApplicationConfig = {}) {
    super(options);
    //set up binding
    this.setupBinding();

    this.component(AuthenticationComponent);
    registerAuthenticationStrategy(this, JWTStrategy)
    this.component(JWTAuthenticationComponent);


    // Set up the custom sequence
    this.sequence(MySequence);

    // Set up default home page
    this.static('/', path.join(__dirname, '../public'));

    // Customize @loopback/rest-explorer configuration here
    this.configure(RestExplorerBindings.COMPONENT).to({
      path: '/explorer',
    });
    this.component(RestExplorerComponent);

    this.projectRoot = __dirname;
    // Customize @loopback/boot Booter Conventions here
    this.bootOptions = {
      controllers: {
        // Customize ControllerBooter Conventions here
        dirs: ['controllers'],
        extensions: ['.controller.js'],
        nested: true,
      },
    };
  }
  setupBinding() {
    this.bind(PasswordBindings.passwordHash).toClass(BcryptHash);
    this.bind(PasswordBindings.rounds).to(10)
    this.bind('Services.user.service').toClass(authService)
    this.bind('Services.jwt.service').toClass(JWTService)
    this.bind(TokenBindings.token_secret).to(TokenConstants.token_secret_value)
    this.bind(TokenBindings.token_expires_in).to(TokenConstants.token_expires_in)
    this.bind('ErrorInterceptor').toClass(ErrorInterceptor)
    this.bind('sharp').toClass(SharpService)
    this.add(createBindingFromClass(ErrorHandlerMiddlewareProvider));
  }
}
