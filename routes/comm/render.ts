import { IContext } from '../../interface/comm';

export function render(ctx: IContext, status: number, body?: any) {

  if (typeof body === 'object') {
    ctx.response.type = 'json';
  }

  ctx.status = status;
  ctx.body = body;
}
