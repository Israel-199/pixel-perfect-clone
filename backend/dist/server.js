"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = require("./app");
const keepAlive_1 = require("./services/keepAlive");
const PORT = process.env.PORT || 5000;
const server = app_1.app.listen(PORT, async () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
    (0, keepAlive_1.startKeepAlive)();
    await (0, app_1.seedInitialBooks)();
});
// Configure Node.js HTTP server for high concurrency and connection reuse
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
server.maxRequestsPerSocket = 1000;
