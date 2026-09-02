import { app, seedInitialBooks } from "./app";
import { startKeepAlive } from "./services/keepAlive";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  startKeepAlive();
  await seedInitialBooks();
});

