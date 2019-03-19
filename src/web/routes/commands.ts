import { Middleware, Context } from "koa";
import { getOrCreateTeam } from "../../db/team";
import { getOrCreateUser } from "../../db/user";
import { client } from "../../lib/slack";
import { Dialog } from "@slack/client";
import { search } from "../../lib/lunchbot";
import axios from "axios";
import updatePreferredLocation from "../../dialogs/get-preferred-location";

const debug = require("debug")("lunchbot:commands");

export default async function commands(
  ctx: Context
): Promise<Middleware | void> {
  ctx.status = 200;
  const {
    team_id: teamId,
    team_domain: domain,
    user_id: userId,
    text,
    response_url: responseUrl,
    trigger_id: triggerId
  } = ctx.request.body;

  if (!text) {
    ctx.body = {
      response_type: "ephemeral",
      text: "Tell me what you're in the mood for! ie. `/lunchbot sushi`"
    };
    return;
  }

  const team = await getOrCreateTeam({ id: teamId, domain });
  const user = await getOrCreateUser({ id: userId, team_id: team.id });

  if (!user.preferred_location) {
    await updatePreferredLocation(triggerId, responseUrl, text);
    ctx.status = 204;
    return;
  }

  const blocks = await search(user, text);
  ctx.body = { blocks, response_type: "ephemeral" };
}
