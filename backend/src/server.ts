import { app, seedInitialBooks } from "./app";

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
  await seedInitialBooks();
});
