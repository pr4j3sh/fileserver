const {
  errorHandler,
  notFoundHandler,
  logHandler,
  asyncHandler,
  corsHandler,
  initLogger,
  transports,
  streamHandler,
  rateLimitHandler,
} = require("exhandlers");
const express = require("express");

const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
const origins = process.env.ORIGINS;

const server = express();
const logger = initLogger("info", transports);

server.use(express.json());
server.use(corsHandler(origins));
server.use(logHandler("combined", { stream: streamHandler(logger) }));
server.use(rateLimitHandler({ windowMs: 10 * 60 * 1000, limit: 100 }));

server.get(
  "/",
  asyncHandler(async (req, res) => {
    res.status(200).json({
      success: true,
      message: "server online",
    });
  }),
);

server.use(notFoundHandler);
server.use(errorHandler);

server.listen(port, hostname, async () => {
  console.log(`server running @ http://${hostname}:${port}`);
});
