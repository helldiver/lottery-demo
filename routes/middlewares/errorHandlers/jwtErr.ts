
import { IContext } from '../../../interface/comm'
import { render, genErrBody } from '../../comm'
import ERROR_CODE from '../../comm/errorCode'
import AuthError from '../../comm/errorCode'

const JWTErrorHandlerTypes = Object.keys(AuthError)

export class JWTErr extends Error {
  type: string
  msg: string
  constructor(type: string, msg: string) {
    super()
    this.type = type
    this.msg = msg
  }
}

class JWTErrorHandler {
  public shouldHandleErr(err: any) {
    return JWTErrorHandlerTypes.indexOf(err.type) !== -1
  }

  public handle(ctx: IContext, err: any) {
    render(ctx, 401, genErrBody(ERROR_CODE[err.type], err.msg || 'Unknown jwt error.'))
  }
}

export default new JWTErrorHandler()
