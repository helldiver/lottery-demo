
import config from '../../config'
import { FileDao } from '../../model/fileDataBaseDao';
import { cryptPwd } from '../../utils/comm'
import { render, setJWTBody, genErrBody } from '../comm'
import ERROR_CODE from '../comm/errorCode'

import { v4 } from 'uuid'
import { sign, verify } from 'jsonwebtoken'
import * as joi from '@hapi/joi'
import * as monent from 'moment'

import { IContext } from '../../interface/comm';
import { IUser } from '../../interface/user'

const userSchema = joi.object({
  email: joi.string().email(),
  password: joi.string().min(3).max(30)
})

// 登入驗證，並回傳 JWT
export async function login(ctx: IContext) {
  const { email, password } = ctx.request.body;

  if (!email || !password) {
    render(ctx, 403, genErrBody(ERROR_CODE.reqValidationFail, 'Email and password is required.'))
    return;
  };

  const validator = userSchema.validate({ email, password })

  if (validator.error) {
    render(ctx, 403, genErrBody(ERROR_CODE.reqValidationFail, 'Invalid email or password.'))
    return
  }

  const user: IUser = FileDao.db.get('users')
    .find({ email })
    .value()

  if (!user || user.password !== cryptPwd(password)) {
    render(ctx, 403, genErrBody(ERROR_CODE.reqValidationFail, 'Invalid password.'))
    return;
  };

  const expiredAt = monent().add(config.jwt.expiresIn, 's')
  const token = sign(
    {
      exp: expiredAt.unix(),
      data: { uid: user.uid }
    },
    config.secret
  )
  const tokens = user.tokens.filter(t => verify(t, config.secret, (err) => {
      if (err) {
        return false
      }
      return !Boolean(err)
    }))
  tokens.push(token)

  FileDao.db
    .get('users')
    .find({ uid: user.uid })
    .assign({ tokens })
    .write()

  render(ctx, 200, setJWTBody(token, expiredAt.toDate()))
}

// 登出
export async function logout(ctx: IContext) {
  let { user } = ctx
  const token: string = ctx.headers.authorization.split(' ')[1]
  const index = user.tokens.indexOf(token)

  if (index !== -1) {
    user.tokens.splice(index, 1)
  }

  FileDao.db.get('users')
    .find({ uid: user.uid })
    .assign({ tokens: user.tokens })
    .write()

  render(ctx, 204);
}

// 更新 Token
export async function refreshToken(ctx: IContext) {
  let { user } = ctx
  const token: string = ctx.headers.authorization.split(' ')[1]
  const index = user.tokens.indexOf(token)

  if (index !== -1) {
    user.tokens.splice(index, 1)
  }

  const expiredAt = monent().add(config.jwt.expiresIn, 's')
  const newToken = sign(
    {
      exp: expiredAt.unix(),
      data: { uid: user.uid }
    },
    config.secret
  )
  
  user.tokens.push(newToken)
  
  FileDao.db.get('users')
    .find({ uid: user.uid })
    .assign({ tokens: user.tokens })
    .write()

  render(ctx, 200, setJWTBody(token, expiredAt.toDate()))
}

// 建立使用者，並回傳 JWT
export async function register(ctx: IContext) {
  const { email, password } = ctx.request.body

  if (!email || !password) {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, 'Email and Password is required.'))
    return
  }

  const validator = userSchema.validate({ email, password })

  if (validator.error) {
    const errMsg = 'Must be valid email and password length should between 3 to 30.'
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, errMsg))
    return
  }

  const user = FileDao.db
    .get('users')
    .find({ email })
    .value()

  if (user) {
    render(ctx, 400, genErrBody(ERROR_CODE.usernameExisted, 'Email already taken.'))
    return
  }

  const createdAt = Date.now()
  const uid = v4()
  const newUser: IUser = {
    uid,
    createdAt,
    email,
    password: cryptPwd(ctx.request.body.password),
    name: '',
    isVIP: false,
    gender: 'unknown',
    credit: config.user.initCredit,
    tokens: []
  }
  const expiredAt = monent().add(config.jwt.expiresIn, 's')
  const token = sign(
    {
      exp: expiredAt.unix(),
      data: { uid: newUser.uid }
    },
    config.secret
  )

  FileDao.db
    .get('users')
    .push(newUser)
    .write()

  render(ctx, 201, setJWTBody(token, expiredAt.toDate()))
}

// 顯示使用者列表
export async function list(ctx: IContext) {
  const rawData = FileDao.db.get('users').value();

  const result = rawData.map(i => ({
    email: rawData.email,
    uid: rawData.uid
  }))

  render(ctx, 200, result);
}

// 顯示個人資料
export async function showMe(ctx: IContext) {
  const result = {
    name: ctx.user.name,
    email: ctx.user.email,
    gender: ctx.user.gender,
    isVIP: ctx.user.isVIP,
    credit: ctx.user.credit
  }

  render(ctx, 200, result)
}

// 顯示完整的使用者資料
export async function showUserInfo(ctx: IContext) {
  const result = {
    uid: ctx.user.uid,
    createdAt: ctx.user.createdAt,
    name: ctx.user.name,
    email: ctx.user.email,
    gender: ctx.user.gender,
    isVIP: ctx.user.isVIP,
    credit: ctx.user.credit,
    remark: ctx.user.remark
  }

  render(ctx, 200, result)
}

// 更新使用者名稱
export async function updateInfo(ctx: IContext) {
  const { name } = ctx.request.body;

  if (!name) {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, 'Name field is required.'))
    return;
  }

  FileDao.db.get('users')
  .find({ uid: ctx.user.uid })
  .assign({ name })
  .write()

  render(ctx, 200, name);
}

// 更新密碼
export async function updatePwd(ctx: IContext) {
  const { password , new_password } = ctx.request.body;
  const originalPassword = ctx.user.password

  if (!new_password || !password) {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, 'All fields is required.'))
    return
  }

  if (cryptPwd(password) !== originalPassword) {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, 'Password is not correct.'))
    return
  }

  const newPassword = cryptPwd(new_password)

  FileDao.db.get('users')
    .find({ uid: ctx.user.uid })
    .assign({ password: newPassword })
    .write()

  render(ctx, 204);
}

// 儲值
export async function addCredit(ctx: IContext) {
  let { value } = ctx.request.body;
  value = parseInt(value)

  if (!value || isNaN(value) || value < 1) {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, 'Value field is required and must be number.'))
    return
  }

  const credit = ctx.user.credit + value

  FileDao.db.get('users')
    .find({ uid: ctx.user.uid })
    .assign({ credit })
    .write()

  render(ctx, 202, { message: `Add credit ${value}.` });
}
