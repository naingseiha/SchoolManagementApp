import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error", "warn"],
});

export const connectDatabase = async (maxRetries = 5, retryDelay = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🔄 Attempting to connect to database (attempt ${attempt}/${maxRetries})...`
      );

      await prisma.$connect();

      // Test connection with a simple query
      await prisma.$queryRaw`SELECT 1`;

      console.log("✅ Database connected successfully");
      return;
    } catch (error: any) {
      console.log(`❌ Connection attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`⏳ Waiting ${retryDelay / 1000} seconds before retry...`);
        console.log(
          "💡 Database might be sleeping (Neon free tier). Waking up..."
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error(
          "❌ Database connection failed after",
          maxRetries,
          "attempts"
        );
        throw new Error(`Failed to connect to database: ${error.message}`);
      }
    }
  }
};

export const disconnectDatabase = async () => {
  try {
    await prisma.$disconnect();
    console.log("✅ Database disconnected");
  } catch (error: any) {
    console.error("❌ Error disconnecting database:", error.message);
  }
};

export default prisma;
