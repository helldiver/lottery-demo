
import config from '../config'
import { createHash } from 'crypto'

const SECRET = config.secret

export function cryptPwd(password: string) {
  return createHash('sha256').update(password + ':' + SECRET).digest('hex');
}
