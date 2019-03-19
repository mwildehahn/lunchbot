import { DocumentClient } from "aws-sdk/clients/dynamodb";
import * as config from "config";

let client: DocumentClient;

function newClient(options?: object): DocumentClient {
  return new DocumentClient({
    region: config.get("aws.region"),
    accessKeyId: config.get("aws.access_key_id"),
    secretAccessKey: config.get("aws.secret_access_key"),
    ...options
  });
}

export function getClient(options?: object): DocumentClient {
  if (client) return client;
  client = newClient(options);
  return client;
}

export default { getClient };
