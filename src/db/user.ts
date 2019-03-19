import * as config from "config";
import { User } from "../types/lunchbot";
import { getClient } from "./client";

const TableName = config.get("table_names.user") as string;

export async function getUser(
  id: string,
  teamId: string
): Promise<User | null> {
  const params = {
    TableName,
    Key: { id, team_id: teamId }
  };

  const client = getClient();
  const res = await client.get(params).promise();

  if (!res.Item) return null;
  return res.Item as User;
}

export async function createUser(user: User): Promise<void> {
  const params = {
    TableName,
    Item: { ...user }
  };

  const client = getClient();
  await client.put(params).promise();
}

export async function getOrCreateUser(user: User): Promise<User> {
  const found = await getUser(user.id, user.team_id);
  if (found) return found;

  await createUser(user);
  return user;
}

export async function updatePreferredLocation(
  id: string,
  teamId: string,
  location: string
): Promise<User> {
  const params = {
    TableName,
    Key: {
      id,
      team_id: teamId
    },
    UpdateExpression: "SET preferred_location = :preferred_location",
    ExpressionAttributeValues: {
      ":preferred_location": location
    },
    ReturnValues: "ALL_NEW"
  };

  const client = getClient();
  const res = await client.update(params).promise();
  return res.Attributes as User;
}
