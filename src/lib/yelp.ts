import axios, { AxiosInstance } from "axios";
import * as config from "config";

let _client: AxiosInstance;

function getClient(): AxiosInstance {
  if (_client) return _client;
  _client = axios.create({
    baseURL: config.get("yelp.graphql_endpoint"),
    headers: {
      Authorization: `Bearer ${config.get("yelp.api_key")}`,
      "Content-Type": "application/graphql"
    }
  });
  return _client;
}

async function query(graphql: string): Promise<{ data: any }> {
  const client = getClient();
  const res = await client.post("", graphql);
  return res.data;
}

export async function search(
  term: string,
  location: string
): Promise<{ data: any }> {
  const client = getClient();
  return query(
    `{
        search(term: "${term}", location: "${location}") {
            business {
                name,
                rating,
                categories {
                    title
                },
                location {
                  formatted_address
                },
                price,
                url
            },
            total
        }
    }`
  );
}
