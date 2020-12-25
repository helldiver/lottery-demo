
import * as KoaRouter from 'koa-router'
import * as user from './user'
import * as order from './order'
import * as lottery from './lottery'

import * as auth from '../middlewares/auth'
import { getOrderById } from '../middlewares/getNodeById'


const router = new KoaRouter()

router.post('/user/login',
  user.login
)

router.post('/user/logout',
  auth.isAuth(),
  user.logout
)

router.post('/user/register',
  user.register
)

router.post('/user/refresh_token',
  auth.isAuth(),
  user.refreshToken
)

router.get('/user/list',
  auth.isAuth(),
  user.list
)

router.get('/user/me',
  auth.isAuth(),
  user.showMe
)

router.put('/user/me',
  auth.isAuth(),
  user.updateInfo
)

router.put('/user/password',
  auth.isAuth(),
  user.updatePwd
)

router.put('/user/credit',
  auth.isAuth(),
  user.addCredit
)

// orders

router.get('/user/orders',
  auth.isAuth(),
  order.list
)

router.post('/user/orders',
  auth.isAuth(),
  order.create
)

router.get('/user/orders/:id',
  auth.isAuth(),
  order.show
)

router.put('/user/orders/:id',
  auth.isAuth(),
  getOrderById,
  order.cancel
)

// lottery

router.get('/lottery/29',
  auth.isAuth(),
  lottery.list
)

export default router.routes()
