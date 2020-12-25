
import config from '../../config'
import { render, genJWTBody } from '../comm'

import { verify, decode } from 'jsonwebtoken'

import { IContext } from '../../interface/comm'


// 更新 JWT
export async function refreshToken(ctx: IContext) {
  const token = decode(ctx.headers.authorization.split(' ')[1], { json: true })

  render(ctx, 200, genJWTBody(token.data.uid))
}

// 工具: 產生測試用的 JWT
export async function genToken(ctx: IContext) {
  let uid = ctx.request.body.uid
  
  if (!uid) {
    uid = null
  }

  render(ctx, 200, genJWTBody(uid))
}

// 工具: 驗證 JWT 狀態與內容
export async function verifyToken(ctx: IContext) {
  if (!ctx.headers || !ctx.headers.authorization) {
    render(ctx, 403)
    return
  }

  const token = ctx.headers.authorization.split(' ')[1]

  try {
    render(ctx, 200, verify(token, config.secret))
  } catch (err) {
    render(ctx, 403, err)
  }
}
