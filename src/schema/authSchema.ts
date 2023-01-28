

export const loginSchema={
  type:'object',
  required:['userName','password'],
  properties:{
    userName:{
      type:'string'
    },
    password:{
      type:'string',
      minLength:8,

    }
  }
}
