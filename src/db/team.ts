import * as config from "config";
import { Team } from "../types/lunchbot";
import { getClient } from "./client";

const TableName = config.get("table_names.team") as string;

export async function getTeam(id: string): Promise<Team | null> {
  const params = {
    TableName,
    Key: { id }
  };

  const client = getClient();
  const res = await client.get(params).promise();

  if (!res.Item) return null;
  return res.Item as Team;
}

export async function createTeam(team: Team): Promise<void> {
  const params = {
    TableName,
    Item: { ...team }
  };

  const client = getClient();
  await client.put(params).promise();
}

export async function getOrCreateTeam(team: Team): Promise<Team> {
  const found = await getTeam(team.id);
  if (found) return found;

  await createTeam(team);
  return team;
}
