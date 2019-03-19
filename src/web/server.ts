import * as Koa from "koa";
import { Middleware, Context } from "koa";
import * as bodyParser from "koa-bodyparser";
import * as logger from "koa-logger";
import * as route from "koa-route";
import * as compose from "koa-compose";
import { inspect } from "util";
import { verify } from "./middleware";
import { actions, commands } from "./routes";

const app = new Koa();
app.use(bodyParser());

if (process.env.NODE_ENV === "development") {
  app.use(logger());
}

app.use(async (ctx: Context, next: Function) => {
  try {
    await next();
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = "Internal server error";

    console.log(inspect(err, false, 10));
    ctx.app.emit("error", err, ctx);
  }
});

app.use(route.post("/slack/actions", compose([verify, actions])));
app.use(route.post("/slack/commands", compose([verify, commands])));

export default app;
