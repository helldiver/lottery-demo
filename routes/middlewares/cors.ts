
import * as koaCors from '@koa/cors';

export default function cors() {
  return koaCors({
    credentials: true,
  });
}
