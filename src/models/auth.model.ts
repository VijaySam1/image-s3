import {Entity, model, property} from '@loopback/repository';
import {nanoId} from '../uitils/nanoid';

@model()
export class Auth extends Entity {
  @property({
    type: 'string',
    id: true,
    default: () => nanoId(),
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    index: {unique: true, }
  })
  userName: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      maxLength: 10,
      minLength: 8,
      pattern: "(?=.*[A-Z])(?=.*[!@#$&*])(?=.*[0-9])(?=.*[a-z])^.*$",
},
  })
  password: string;

  @property.array(String)
  permissions: string[];

  constructor(data?: Partial<Auth>) {
    super(data);
  }
}

export interface AuthRelations {
  // describe navigational properties here
}

export type AuthWithRelations = Auth & AuthRelations;
