import { IRouterContext } from "koa-router";
import { IUser } from "./user";
import { IOrder } from "./order";

export interface IContext extends IRouterContext {
  user: IUser
  order: IOrder
}
