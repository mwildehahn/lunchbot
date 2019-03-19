import { PlainTextElement } from "@slack/client";

export interface ActionPayload {
  type: ActionType;
  team: Team;
  user: User;
  channel?: Channel;
  api_app_id: string;
  trigger_id: string;
  response_url: string;
}

export interface BlockActionsPayload extends ActionPayload {
  type: ActionType.BLOCK_ACTIONS;
  actions: Action[];
}

export interface DialogSubmissionPayload extends ActionPayload {
  type: ActionType.DIALOG_SUBMISSION;
  submission: any;
  callback_id: string;
  response_url: string;
  state: string;
}

export type Action = ButtonAction;

export interface ButtonAction {
  block_id: string;
  action_id: string;
  action_ts: string;
  value: string;
  text: PlainTextElement;
}

export enum ActionType {
  BLOCK_ACTIONS = "block_actions",
  DIALOG_SUBMISSION = "dialog_submission"
}

export interface Team {
  id: string;
  domain: string;
}

export interface User {
  id: string;
  username: string;
}

export interface Channel {
  id: string;
  name: string;
}
