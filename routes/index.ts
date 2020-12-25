
import * as KoaRouter from 'koa-router';

import { errorHandlers } from './middlewares/errorHandlers'
import api from './api';

const router = new KoaRouter();

router.use(errorHandlers)
router.use('/api/v1', api);

export default router.routes();
