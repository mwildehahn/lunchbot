import { Middleware, Context } from "koa";
import { VError } from "verror";
import {
  ActionPayload,
  ActionType,
  BlockActionsPayload,
  DialogSubmissionPayload
} from "../../types/slack";
import { getOrCreateUser, updatePreferredLocation } from "../../db/user";
import { search } from "../../lib/lunchbot";
import getPreferredLocation from "../../dialogs/get-preferred-location";
import axios from "axios";

const debug = require("debug")("lunchbot:actions");

export enum ActionIds {
  UPDATE_LOCATION = "update_location",
  PUBLISH_TO_CHANNEL = "publish_to_channel"
}

export default async function actions(
  ctx: Context
): Promise<Middleware | void> {
  ctx.status = 204;
  let payload = ctx.state.payload as ActionPayload;
  debug("Received Action: %O", payload);

  const {
    team: { id: teamId },
    user: { id: userId },
    type
  } = payload;

  switch (type) {
    case ActionType.BLOCK_ACTIONS:
      const blockActionsPayload = payload as BlockActionsPayload;
      if (!blockActionsPayload.actions) {
        throw new VError(
          {
            info: {
              teamId,
              userId,
              type
            }
          },
          "malformed payload: missing`actions"
        );
      }

      return handleBlockActions(blockActionsPayload);
    case ActionType.DIALOG_SUBMISSION:
      const dialogSubmissionPayload = payload as DialogSubmissionPayload;
      if (!dialogSubmissionPayload.submission) {
        throw new VError(
          {
            info: {
              teamId,
              userId,
              type
            }
          },
          "malformed payload: missing `submission`"
        );
      }
      return handleDialogSubmission(dialogSubmissionPayload);
    default:
      throw new VError(
        {
          info: {
            type,
            teamId,
            userId
          }
        },
        "unknown action"
      );
  }
}

async function handleBlockActions(payload: BlockActionsPayload): Promise<void> {
  const {
    type,
    team: { id: teamId },
    user: { id: userId }
  } = payload;

  const user = await getOrCreateUser({ id: userId, team_id: teamId });

  const promises = payload.actions.map(async action => {
    switch (action.action_id) {
      case ActionIds.UPDATE_LOCATION:
        await getPreferredLocation(
          payload.trigger_id,
          payload.response_url,
          action.value
        );
        return;
      case ActionIds.PUBLISH_TO_CHANNEL:
        const state = JSON.parse(action.value);
        const blocks = await search(user, state.query);

        await axios.post(payload.response_url, {
          blocks,
          delete_original: true,
          response_type: "in_channel"
        });
        return;
      default:
        throw new VError(
          {
            info: {
              type,
              teamId,
              userId,
              action
            }
          },
          "unknown `action_id`"
        );
    }
  });
  await Promise.all(promises);
}

async function handleDialogSubmission(
  payload: DialogSubmissionPayload
): Promise<void> {
  let user = await getOrCreateUser({
    id: payload.user.id,
    team_id: payload.team.id
  });

  user = await updatePreferredLocation(
    user.id,
    user.team_id,
    payload.submission.address
  );
  const state = JSON.parse(payload.state);
  const blocks = await search(user, state.query);
  await axios.post(state.response_url, { blocks, response_type: "ephemeral" });
}
