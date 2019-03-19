import * as config from "config";

import server from "./server";

server.listen(config.get("port"), () => {
  console.log(`> server running on localhost:${config.get("port")}`);
});
