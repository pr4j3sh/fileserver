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
  uploadHandler,
} = require("exhandlers");
const express = require("express");
const multer = require("multer");
const crypto = require("crypto");

const port = process.env.PORT;
const hostname = process.env.HOSTNAME;
const origins = process.env.ORIGINS;

const server = express();
const logger = initLogger("info", transports);
const upload = uploadHandler({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, "public"),
    filename: (req, file, cb) => {
      let { part } = req.query;
      if (!part) part = "";
      const hash = crypto
        .createHash("sha1")
        .update(JSON.stringify(file))
        .digest("hex");
      cb(null, hash + "_" + part + "." + file.originalname.split(".").pop());
    },
  }),
});

server.use(express.json());
server.use(express.static("public"));
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

server.post(
  "/api/upload",
  upload.single("file"),
  asyncHandler(async (req, res) => {
    res.json({ file: req.file });
  }),
);

server.use(notFoundHandler);
server.use(errorHandler);

server.listen(port, hostname, async () => {
  console.log(`server running @ http://${hostname}:${port}`);
});
