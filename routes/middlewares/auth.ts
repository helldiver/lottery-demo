
import config from '../../config'
import { FileDao } from '../../model/fileDataBaseDao'
import { render } from '../comm'
import { AuthErrType } from '../comm/errorCode'
import { JWTErr } from '../middlewares/errorHandlers/jwtErr'

import { IMiddleware } from 'koa-router'
import { verify, decode } from 'jsonwebtoken'

import { IContext } from '../../interface/comm'
import { IUser } from '../../interface/user'

export function isAuth(): IMiddleware {
  return async (ctx: IContext, next: () => void) => {
    let token = ctx.headers.authorization

    try {
      token = token.split(' ')[1]
      verify(token, config.secret)
    } catch (err) {
      throw new JWTErr(AuthErrType.unauthorized, 'Headers without JWT.')
    }

    const uid = decode(token, { json: true }).data.uid
    const user: IUser = FileDao.db
      .get('users')
      .find({ uid })
      .value()

    if (!user) {
      render(ctx, 403, { message: 'Warning! User is not exist.' })
      return
    }

    if (!user.tokens.includes(token)) {
      render(ctx, 403, { message: 'Invalid token.' })
      return
    }

    ctx.user = user

    await next()
  }
}

// NOTE: 驗證權限測試用
export async function isVIP(ctx: IContext, next: () => void) {
  if (!ctx.user.isVIP) {
    render(ctx, 403, { message: '權限不足.' })
    return
  }

  await next();
}
