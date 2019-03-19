import { Middleware, Context } from "koa";
import * as config from "config";

const debug = require("debug")("lunchbot:middleware");

export function verify(ctx: Context, next: Function): Middleware {
  if (!ctx.request.body) return next();

  const body: {
    token?: string;
    payload?: string;
  } = ctx.request.body;

  let { token, payload } = body;
  if (!token && payload) {
    const parsed = JSON.parse(payload);
    ctx.state.payload = parsed;
    token = parsed.token;
  }

  ctx.assert(token === config.get("app.verification_token"), 403);
  return next();
}

export function challenge(ctx: Context, next: Function): Middleware | void {
  if (!ctx.request.body) return next();

  const body: {
    challenge?: string;
  } = ctx.request.body;

  const { challenge } = body;
  if (challenge) {
    ctx.status = 200;
    ctx.body = challenge;
    return;
  }

  return next();
}
