import { app, seedInitialBooks } from "./app";
import { startKeepAlive } from "./services/keepAlive";

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  startKeepAlive();
  await seedInitialBooks();
});

// Configure Node.js HTTP server for high concurrency and connection reuse
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;
(server as any).maxRequestsPerSocket = 1000;
