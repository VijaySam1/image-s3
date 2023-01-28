import {Entity, model, property} from '@loopback/repository';

@model()
export class Login extends Entity {
  @property({
    type: 'string',
    required: true,
  })
  userName: string;

  @property({
    type: 'string',
    required: true,
    minLength:8,
  })
  password: string;


  constructor(data?: Partial<Login>) {
    super(data);
  }
}

export interface LoginRelations {
  // describe navigational properties here
}

export type LoginWithRelations = Login & LoginRelations;
