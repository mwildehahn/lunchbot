import { WebClient } from "@slack/client";
import * as config from "config";

const token = config.get("app.workspace_token") as string;
const slackHost = config.get("slack_host") as string;
const slackApiUrl = `https://${slackHost}/api/`;

export const client = new WebClient(token, { slackApiUrl });
