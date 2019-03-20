import { flatten } from "lodash";

import { User } from "../types/lunchbot";
import * as yelp from "./yelp";
import { CognitoIdentity } from "aws-sdk/clients/all";
import { ActionIds } from "../web/routes/actions";

const debug = require("debug")("lunchbot:lunchbot");

export async function search(user: User, query: string): Promise<any> {
  const res = await yelp.search(query, user.preferred_location as string);

  // You can put blocks together in whatever way that makes sense for your app.
  // Here we build the main items from the search results, then construct a
  // header and a footer and combine it at the end.

  const items = res.data.search.business.slice(0, 5).map((biz: any) => [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*<${biz.url}|${biz.name}>*\nPrice: ${biz.price} • Rated: ${
          biz.rating
        }\nCategories: ${biz.categories
          .map((category: any) => category.title)
          .join(", ")}`
      }
    },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: biz.location.formatted_address
        }
      ]
    },
    {
      type: "divider"
    }
  ]);

  const header = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `Top ${items.length} results for *"${query}"* near *${
          user.preferred_location
        }*`
      }
    },
    {
      type: "divider"
    }
  ];

  const footer = [
    {
      type: "actions",
      elements: [
        {
          type: "button",
          action_id: ActionIds.PUBLISH_TO_CHANNEL,
          text: {
            type: "plain_text",
            text: "Publish to Channel"
          },
          value: JSON.stringify({ query })
        },
        {
          type: "button",
          // Use `action_id` to trigger a specific behavior when the user clicks the button
          action_id: ActionIds.UPDATE_LOCATION,
          // Store additional information you might need within the `value`. In
          // this case, we pass the original `query` so we can search it again
          // after the user submits the dialog.
          value: query,
          text: {
            type: "plain_text",
            text: "Change Location"
          }
        }
      ]
    }
  ];

  // We return a single array of blocks here
  return header.concat(flatten(items)).concat(footer);
}
