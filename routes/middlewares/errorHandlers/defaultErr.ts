
import config from '../../../config'
import { IContext } from '../../../interface/comm'
import { render, genErrBody } from '../../comm'
import ERROR_CODE from '../../comm/errorCode'

class DefaultErrorHandler {

  public handle(ctx: IContext, err: any) {
    
    if (config.showUnknowErrLog) {
      console.error(err)
    }

    render(ctx, 500, genErrBody(ERROR_CODE.unknown, 'Unknown server error.'))
  }

  public shouldHandleErr(err: any) {
    return true
  }
}

export default new DefaultErrorHandler()
