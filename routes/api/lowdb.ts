
import { FileDao } from '../../model/fileDataBaseDao'
import { IContext } from '../../interface/comm';
import { render } from '../comm';
import { initData } from '../../database/initData'

export async function getState(ctx: IContext) {
  const data = FileDao.db.getState()

  render(ctx, 200, { data })
}

export async function init(ctx: IContext) {
  FileDao.db
    .setState(initData)
    .write()

  render(ctx, 200, { message: 'Database is reset as default.' })
}
