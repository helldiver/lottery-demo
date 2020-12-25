import { merge } from 'lodash';

const NodeEnv = process.env.NODE_ENV || 'development';

export interface IConfig {
  env?: string
  secret: string
  showUnknowErrLog: boolean
  port: number
  staticFile: {
    path: string
    maxAge?: number
  }
  FileDao: {
    path: string
  }
  user: {
    initCredit: number
  }
  jwt: {
    expiresIn: number
  }
  games: {
    lottery29: {
      interval: string
      stake: number
      bonus: number
    }
  }
}

const config: IConfig = {
  env: NodeEnv,
  secret: process.env.SECRET || '2e@*AtOt9iCh*f$uN3Pr',
  port: process.env.SERVER_PORT ? parseInt(process.env.SERVER_PORT, 10) : 3000,
  showUnknowErrLog: false,
  staticFile: {
    path: 'public',
    maxAge: 1000 * 60 * 60 // 1 hr
  },
  FileDao: {
    path: '../database/db.json'
  },
  user: {
    initCredit: parseInt(process.env.INIT_CREDIT, 10) || 5000
  },
  jwt: {
    expiresIn: parseInt(process.env.EXPIRES_IN) || 60 * 60 * 24
  },
  games: {
    lottery29: {
      interval: '*/5 9-18 * * *', // 每天9:00~18:00之間每五分鐘開獎一次
      stake: 100,
      bonus: 200
    }
  }
}

try {
  merge(config, require(`./${NodeEnv}`).config);
  console.info(`Using customize config file ./${NodeEnv}`);
} catch (error) {
  console.info(`Env ${NodeEnv} customize config not found`);
}

export default config;
