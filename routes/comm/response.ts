
import { sign } from 'jsonwebtoken'
import * as monent from 'moment'

import config from '../../config'

export function genJWTBody(uid: string) {
  const expiredAt = monent().add(config.jwt.expiresIn, 's')
  const token = sign(
    {
      exp: expiredAt.unix(),
      data: { uid }
    }, config.secret
  )

  return {
    token,
    expiredAt: expiredAt.toISOString().split('.')[0] + 'Z'
  }
}

export function setJWTBody(token: string, expiredAt: Date) {
  return {
    token,
    expiredAt: expiredAt.toISOString().split('.')[0] + 'Z'
  }
}

export function genErrBody(code: number, message?: string) {
  return {
    code,
    message
  }
}
