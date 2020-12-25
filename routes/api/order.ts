
import config from '../../config/index'
import ERROR_CODE from '../comm/errorCode'
import { v4 } from 'uuid'
import { FileDao } from '../../model/fileDataBaseDao'
import { render, isVaildComb, genErrBody } from '../comm'

import { IContext } from '../../interface/comm'
import { IOrder } from '../../interface/order'
import { ILottery29 } from '../../interface/lottery'

// 顯示使用者的訂單列表
export async function list(ctx: IContext) {
  const { uid } = ctx.user
  const rawData: IOrder[] = FileDao.db
    .get('orders')
    .filter({ createdBy: uid })
    .sortBy('createdAt')
    .reverse()
    .value()

  const result = rawData.map(i => ({
    uid: i.uid,
    createdAt: i.createdAt,
    canceledAt: i.canceledAt,
    stage: i.stage,
    gameType: i.gameType,
    combination: i.combination,
    state: i.state
  }))

  render(ctx, 200, result)
}

// 顯示單一訂單內容
export async function show(ctx: IContext) {
  const { createdAt, canceledAt, stage, gameType, combination, state } = ctx.state.order

  const result = {
    gameType,
    stage,
    combination,
    state,
    createdAt,
    canceledAt
  }

  render(ctx, 200, result)
}

// 建立訂單
export async function create(ctx: IContext) {
  const { gameType, combination } = ctx.request.body
  let { stage } = ctx.request.body
  const { uid, credit } = ctx.user

  if (!gameType || !combination || !Array.isArray(combination)) {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, 'gameType、combination 為必填欄位, 且 combination 必須為陣列.'))
    return
  }

  if (gameType !== 'lottery29') {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, '目前只開放 lottery29 的遊戲.'))
    return
  }

  if (!isVaildComb(1, 29, 2, combination)) {
    render(ctx, 400, genErrBody(ERROR_CODE.reqValidationFail, '請選擇在 1~29 間選擇兩個不重複的號碼.'))
    return
  }

  if (credit < config.games.lottery29.stake) {
    render(ctx, 400, genErrBody(ERROR_CODE.creditNotEnough, '帳戶餘額不足, 請加值.'))
    return
  }

  const lastLottery: ILottery29[] = FileDao.db
    .get('lottery29')
    .sortBy('createdAt')
    .reverse()
    .take(1)
    .value()
  
  stage = parseInt(stage)

  if (!stage) {
    stage = lastLottery[0].stage + 1
  } else if (stage < lastLottery[0].stage) {
    render(ctx, 400, genErrBody(ERROR_CODE.unknown, '開獎期數不能小於目前期數.'))
    return
  }

  const newOrder: IOrder = {
    uid: v4(),
    createdAt: Date.now(),
    stage,
    createdBy: uid,
    gameType,
    combination,
    state: 0
  }

  FileDao.db
    .get('orders')
    .push(newOrder)
    .write()

  FileDao.db
    .get('users')
    .find({ uid })
    .assign({ credit: credit - config.games.lottery29.stake })
    .write()

  const result = {
    createdAt: newOrder.createdAt,
    stage: newOrder.stage,
    gameType: newOrder.gameType,
    combination: newOrder.combination
  }
  
  render(ctx, 201, result)
}

// 取消訂單
export async function cancel(ctx: IContext) {
  const { uid, canceledAt, state } = ctx.state.order
  const { credit } = ctx.user

  if (canceledAt || state !== 0) {
    render(ctx, 406, genErrBody(ERROR_CODE.orderCanNotCancel, '訂單過期或已取消.'))
    return
  }

  FileDao.db
    .get('orders')
    .find({ uid })
    .assign({ canceledAt: Date.now() })
    .write()

  FileDao.db
    .get('users')
    .find({ uid })
    .assign({ credit: credit + config.games.lottery29.stake })
    .write()

  render(ctx, 202, { message: '訂單已取消.' })
}
