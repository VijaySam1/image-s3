import {
  injectable,
  Interceptor,
  InvocationContext,
  InvocationResult,
  Provider,
  ValueOrPromise
} from '@loopback/core';
import {HttpErrors} from '@loopback/rest';

/**
 * This class will be bound to the application as an `Interceptor` during
 * `boot`
 */
@injectable({tags: {key: ErrorInterceptor.BINDING_KEY}})
export class ErrorInterceptor implements Provider<Interceptor> {
  static readonly BINDING_KEY = `interceptors.${ErrorInterceptor.name}`;

  /*
  constructor() {}
  */

  /**
   * This method is used by LoopBack context to produce an interceptor function
   * for the binding.
   *
   * @returns An interceptor function
   */
  value() {
    return this.intercept.bind(this);
  }

  /**
   * The logic to intercept an invocation
   * @param invocationCtx - Invocation context
   * @param next - A function to invoke next interceptor or the target method
   */
  async intercept(
    invocationCtx: InvocationContext,
    next: () => ValueOrPromise<InvocationResult>,
  ) {
    try {
      // Add pre-invocation logic here
      const result = await next();
      // Add post-invocation logic here
      return result;
    } catch (err) {
      if (err instanceof HttpErrors) {
        // Create custom error message here
        const customError = {
          message: 'Custom error message',
          statusCode: err.statusCode,
          description: err.message,
        };

        // Throw new HttpError with custom error message
        throw HttpErrors(customError.statusCode, customError.message, customError);
      } else {
        throw err;
      }
    }
  }
}

