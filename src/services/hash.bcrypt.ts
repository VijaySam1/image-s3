import {inject} from '@loopback/core';
import {compare, genSalt, hash} from 'bcryptjs';
import {PasswordBindings} from '../keys';

export interface passwordHash<T=string>{
  hashPassWord(password:T):Promise<T>;
  comparePassword(inputPassword:T,storedPass:T):Promise<boolean>
}

export class BcryptHash implements passwordHash<string>{
  async comparePassword(inputPassword: string, storedPass: string): Promise<boolean> {
    const passwordMatched=await compare(inputPassword,storedPass);
    return passwordMatched;
  }
  @inject(PasswordBindings.rounds)
  public readonly rounds:number;
  async hashPassWord(password: string): Promise<string> {

   const salt =await genSalt(this.rounds);
   return await hash(password,salt)
  }
}
