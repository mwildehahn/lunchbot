import { client } from "../lib/slack";
import { Dialog } from "@slack/client";

export default async (
  triggerId: string,
  responseUrl: string,
  query: string
): Promise<void> => {
  const dialog: Dialog = {
    callback_id: "update_preferred_location",
    title: "Configure Location",
    submit_label: "Add",
    state: JSON.stringify({ response_url: responseUrl, query }),
    elements: [
      {
        type: "text",
        label: "Set your preferred address to search around",
        name: "address"
      }
    ]
  };

  await client.dialog.open({ trigger_id: triggerId, dialog });
};
