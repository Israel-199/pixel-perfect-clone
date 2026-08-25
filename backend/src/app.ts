import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";
import bookRoutes from "./routes/bookRoutes";
import requestRoutes from "./routes/requestRoutes";
import adminRoutes from "./routes/adminRoutes";
import { prisma } from "./config/prisma";

dotenv.config();

export const app = express();

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Route Mounts
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/requests", requestRoutes);
app.use("/api/admin", adminRoutes);

// Healthcheck
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Seed Initial Database Items
export async function seedInitialBooks() {
  try {
    const count = await prisma.book.count();
    if (count === 0) {
      console.log("Seeding initial spiritual books into database...");

      const booksToSeed = [
        {
          title: "ከእምነት ወደ እምነት",
          author: "መጋቢ ካስሁብ መሰሎን",
          description: "ከእምነት ወደ እምነት የሚያደርስ መንፈሳዊ ጉዞ እና የእግዚአብሔር ቃል ጥናት መመሪያ።",
          price: 250,
          coverUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop",
          mediaType: "BOOK",
          sampleContent: `ክፍል 1: የእምነት መሠረት

እምነት ተስፋ ስለምናደርገው ነገር የሚያስረዳ፥ የማናየውንም ነገር የሚያስረዳ ነው። (ዕብራውያን 11:1)

በዚህ ምዕራፍ የምንማረው ስለ እምነት ሕይወት፣ በእግዚአብሔር ቃል ላይ ስለመቆም እና በየዕለቱ እምነታችንን ስለማደስ ነው። 

ገጽ 1:
እግዚአብሔርን ማመን ለሰው ልጅ ሕይወት ትልቁ ቁልፍ ነው። እምነት በቃል ውስጥ የሚገኝና የሚበቅል ዘር ነው። ቃሉን ባነበብንና በሰማን ቁጥር እምነታችን ያድጋል።

ገጽ 2:
በፈተና ጊዜ እምነታችን ይፈተናል። እንደ አብርሃም በእግዚአብሔር ተስፋ ላይ ማመን ማለት የማይቻለውን የሚችል አምላክ እንዳለን ማወቅ ነው።

ገጽ 3:
የእምነት ፍሬዎች፡ ሰላም፣ እረፍት፣ እና በክርስቶስ ያለን ሙሉ እርግጠኝነት ናቸው።

--- Sample Preview End ---`,
          fullContent: `ክፍል 1: የእምነት መሠረት

እምነት ተስፋ ስለምናደርገው ነገር የሚያስረዳ፥ የማናየውንም ነገር የሚያስረዳ ነው። (ዕብራውያን 11:1)

በዚህ ምዕራፍ የምንማረው ስለ እምነት ሕይወት፣ በእግዚአብሔር ቃል ላይ ስለመቆም እና በየዕለቱ እምነታችንን ስለማደስ ነው። 

ገጽ 1:
እግዚአብሔርን ማመን ለሰው ልጅ ሕይወት ትልቁ ቁልፍ ነው። እምነት በቃል ውስጥ የሚገኝና የሚበቅል ዘር ነው። ቃሉን ባነበብንና በሰማን ቁጥር እምነታችን ያድጋል።

ገጽ 2:
በፈተና ጊዜ እምነታችን ይፈተናል። እንደ አብርሃም በእግዚአብሔር ተስፋ ላይ ማመን ማለት የማይቻለውን የሚችል አምላክ እንዳለን ማወቅ ነው።

ገጽ 3:
የእምነት ፍሬዎች፡ ሰላም፣ እረፍት፣ እና በክርስቶስ ያለን ሙሉ እርግጠኝነት ናቸው።

================ UNLOCKED FULL CONTENT ================

ምዕራፍ 2: የእግዚአብሔር ድምፅ ማዳመጥ
በመንፈስ ቅዱስ አምራችነት መመራት እንዴት ይቻላል? የእግዚአብሔር ድምፅ የሰላም፣ የእውነት እና የብርሃን ድምፅ ነው።

ምዕራፍ 3: የጸሎት ኃይል
ጸሎት ከእግዚአብሔር ጋር የምናደርገው ጥልቅ ውይይት ነው። በጸሎት ሕይወትህ ውስጥ የሚከሰቱ ታላላቅ ተአምራት።

ምዕራፍ 4: በድል የመኖር ምስጢር
ክርስቶስ ባደረገልን መስዋዕትነት የተነሳ እኛ አሸናፊዎች ነን! በሕይወትህ ውስጥ ሁሉንም தடைகள் የሚሰብረው የእግዚአብሔር ቃል ኃይል ነው።`,
        },
        {
          title: "የጸሎት ሕይወትና ምስጢር",
          author: "RABBI Ministry",
          description: "ከእግዚአብሔር ጋር ጥልቅ ህብረት ለማድረግ የሚረዳ የጸሎት ትምህርት።",
          price: 200,
          coverUrl: "https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=600&auto=format&fit=crop",
          mediaType: "BOOK",
          sampleContent: `የጸሎት መግቢያ፡
ጸሎት የመንፈስ ቅዱስ እስትንፋስ ነው። ያለ ጸሎት መንፈሳዊ ሕይወት ሊኖር አይችልም።

ገጽ 1:
ጸሎት ማለት ለምንጸልየው አምላክ ልባችንን መክፈት ነው።`,
          fullContent: `የጸሎት መግቢያ፡
ጸሎት የመንፈስ ቅዱስ እስትንፋስ ነው። ያለ ጸሎት መንፈሳዊ ሕይወት ሊኖር አይችልም።

ገጽ 1:
ጸሎት ማለት ለምንጸልየው አምላክ ልባችንን መክፈት ነው።

================ UNLOCKED FULL CONTENT ================

ምዕራፍ 1: የጸሎት ዓይነቶች
1. የምስጋና ጸሎት
2. የንስሐ ጸሎት
3. የማልዶ ጸሎት

ምዕራፍ 2: የጸሎት መሰናክሎችና መፍትሔዎቻቸው
ትኩረት ማጣት፣ መጠራጠር እና በእምነት አለመቆም የጸሎት መሰናክሎች ናቸው።`,
        },
        {
          title: "የእሁድ ትምህርት - ቪዲዮና ድምፅ",
          author: "RABBI Academy",
          description: "የእሁድ መንፈሳዊ ትምህርት ሙሉ ቪዲዮ እና ድምፅ ክምችት።",
          price: 300,
          coverUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=600&auto=format&fit=crop",
          mediaType: "VIDEO",
          sampleContent: "የቪዲዮና ኦዲዮ ትምህርት አጭር መግለጫ። ሙሉውን ለመመልከት እና ለማዳመጥ መጀመሪያ ግዢውን ያረጋግጡ።",
          fullContent: "እንኳን ደስ አለዎት! ሙሉውን የትምህርት ቪዲዮ እና ኦዲዮ ከታች ይመልከቱ።",
          videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
          audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
        },
      ];

      for (const b of booksToSeed) {
        await prisma.book.create({ data: b });
      }

      console.log("Initial books seeded successfully!");
    }
  } catch (e) {
    console.error("Seeding Error:", e);
  }
}
