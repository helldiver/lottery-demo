
import { v4 } from 'uuid'
import { schedule } from 'node-cron'
import { FileDao } from '../model/fileDataBaseDao'

import { genWinningArray, compareResult } from '../utils/lottery'
import { ILottery29 } from '../interface/lottery'
import { IOrder } from '../interface/order'
import { IUser } from '../interface/user'

import config from '../config/index'

export const lottery29 = schedule(config.games.lottery29.interval, () => {
  // get last stage.
  const lastLottery: ILottery29[] = FileDao.db
    .get('lottery29')
    .sortBy('createdAt')
    .reverse()
    .take(1)
    .value()
  
  let currStage: number = 1
  if (lastLottery[0]) {
    currStage = lastLottery[0].stage + 1
  }
  // create new lottery result.
  const newLottery: ILottery29 = {
    uid: v4(),
    stage: currStage,
    createdAt: Date.now(),
    combination: genWinningArray(1, 29, 5),
    winningOrders: []
  }
  console.log('new lottery!:', newLottery.combination)

  // NOTE: Get order list.
  const orderArr: IOrder[] = FileDao.db
    .get('orders')
    .filter({ stage: currStage })
    .filter({ state: 0 })
    .value()

  // NOTE: Update orders.
  for (let i = 0; i < orderArr.length; i++) {
    if (compareResult(newLottery.combination, orderArr[i].combination).length > 1) {
      console.log('order match!!', orderArr[i].uid)
      // NOTE: Update winning order.
      FileDao.db
        .get('orders')
        .find({ uid: orderArr[i].uid })
        .assign({ state: 1 })
        .write()

      // NOTE: Update Winner credit.
      const winner: IUser = FileDao.db
        .get('users')
        .find({ uid: orderArr[i].createdBy })
        .value()
      
      FileDao.db
        .get('users')
        .find({ uid: orderArr[i].createdBy })
        .assign({ credit: winner.credit + config.games.lottery29.bonus })
        .write()

      newLottery.winningOrders.push(orderArr[i].uid)
    }
    // NOTE: Update lose order and set expired.
    FileDao.db
      .get('orders')
      .find({ uid: orderArr[i].uid })
      .assign({ state: -1 })
      .write()
  }

  // NOTE: Write new lottery data to db.
  FileDao.db
    .get('lottery29')
    .push(newLottery)
    .write()
})
