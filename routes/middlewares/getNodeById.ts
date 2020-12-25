
import ERROR_CODE from '../comm/errorCode'
import { FileDao } from '../../model/fileDataBaseDao'

import { IContext } from '../../interface/comm'
import { IOrder } from '../../interface/order'
import { IUser } from '../../interface/user'
import { render, genErrBody } from '../comm'

export async function getUserById(ctx: IContext, next: () => void) {
  const user: IUser = FileDao.db
    .get('users')
    .find({ uid: ctx.params.id })
    .value()

  if (!user) {
    render(ctx, 404, genErrBody(ERROR_CODE.docNotFound))
    return;
  }

  ctx.user = user;

  await next()
}

export async function getOrderById(ctx: IContext, next: () => void) {
  const { uid } = ctx.state
  const order: IOrder = FileDao.db
    .get('orders')
    .find({ uid: ctx.params.id })
    .value()

  if (!order) {
    render(ctx, 404, genErrBody(ERROR_CODE.docNotFound, 'Order not found.'))
    return
  }

  if (order.createdBy !== uid) {
    render(ctx, 403, genErrBody(ERROR_CODE.forbidden))
    return
  }

  ctx.state.order = order

  await next()
}
