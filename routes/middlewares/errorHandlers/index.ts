
import { IContext } from '../../../interface/comm'
import defaultErrHandler from './defaultErr'
import jwtErrorHandler from './jwtErr'

const errHandlers = [
  jwtErrorHandler,
  defaultErrHandler
]

function handleError(ctx: IContext, err: any ) {
  for (const h of errHandlers) {
    if (h.shouldHandleErr(err)) {
      h.handle(ctx, err)
      break
    }
  }
}

export async function errorHandlers(ctx: IContext, next: () => void) {
  try {
    await next()
  } catch (err) {
    handleError(ctx, err)
  }
}
