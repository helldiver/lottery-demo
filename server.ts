import config from './config';

import * as Koa from 'koa';
import * as koaBodyPaser from 'koa-bodyparser';

import routes from './routes';
import cors from './routes/middlewares/cors';
import { lottery29 } from './cron'

const app = new Koa();

app.keys = [config.secret];

app.use(koaBodyPaser());
app.use(cors());

app.use(routes);
lottery29.start();

export default app;
