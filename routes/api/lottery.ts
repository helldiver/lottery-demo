
import { FileDao } from '../../model/fileDataBaseDao'
import { render } from '../comm'

import { findIndex } from 'lodash'

import { IContext } from '../../interface/comm'
import { IOrder } from '../../interface/order'

export async function list(ctx: IContext) {
  let { page, limit, before } = ctx.query
  page = parseInt(page)
  limit = parseInt(limit)
  before = String(before)

  if (!page && page !== 0) {
    page = 1
  }
  if (!limit || limit < 0 || limit > 10) {
    limit = 10
  }
  if (before === 'undefined' || before === 'null') {
    before = null
  }

  // NOTE: lowdb 在這邊有個坑，如果取資料不排序的話，資料排序每次會不一樣，原因待查。
  let lottery29: IOrder[] = FileDao.db
    .get('lottery29')
    .sortBy('createdAt')
    .reverse()
    .value()

  const indexOfBefore: number = findIndex(lottery29, x => x.uid == before)
  let begin = (page - 1) * limit

  if (page <= 1) {
    begin = 0
  }
  if (indexOfBefore !== -1) {
    begin = begin + indexOfBefore
  }

  let end = begin + limit

  if (page === 0) {
    end = lottery29.length
  }

  lottery29.slice(begin, end)

  const result = lottery29.map(i => ({
    stage: i.stage,
    createdAt: i.createdAt,
    combination: i.combination
  }))

  render(ctx, 200, { message: lottery29.length, result })
}
