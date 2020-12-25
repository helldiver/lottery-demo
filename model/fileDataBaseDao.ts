
import config from '../config'

import * as path from 'path';
import * as lowdb from 'lowdb';
import * as FileAsync from 'lowdb/adapters/FileAsync';

import { IUser } from '../interface/user';

interface IData {
  users: IUser[]
};


interface IFileDataBaseDao {
  db: lowdb.LowdbFpSync<IData>;
  load: () => void;
};

class FileDataBaseDao implements IFileDataBaseDao {

  public db;
  private adapter;

  constructor() {
    this.adapter = new FileAsync<IData>(
      path.join(__dirname, config.FileDao.path)
    );
  }

  public async load() {
    console.log('Loading database file...')
    this.db = await lowdb(this.adapter);
  }
}

export const FileDao = new FileDataBaseDao();

(async () => {
  try {
    await FileDao.load();
  } catch (err) {
    console.log('Load database file fail:', err);
    process.exit();
  }
})();