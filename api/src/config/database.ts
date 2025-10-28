import { PrismaClient } from "@prisma/client";

// Enable connection pooling and configure timeouts
const prisma = new PrismaClient({
  log: ["error", "warn"],
  datasources: {
    db: {
      url: process.env.DIRECT_URL || process.env.DATABASE_URL, // Prefer DIRECT_URL for faster wake-up
    },
  },
});

// Connection retry logic for sleeping database
export const connectDatabase = async (maxRetries = 5, retryDelay = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🔄 Connecting to database (attempt ${attempt}/${maxRetries})...`
      );

      // Connect to database
      await prisma.$connect();

      // Test connection with simple query
      await prisma.$queryRaw`SELECT 1`;

      console.log("✅ Database connected successfully");
      return;
    } catch (error: any) {
      console.log(`❌ Connection attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(
          `⏳ Database might be sleeping. Waiting ${
            retryDelay / 1000
          }s before retry...`
        );
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error(`❌ Failed to connect after ${maxRetries} attempts`);
        console.log(
          "💡 Tip: Neon free tier auto-suspends after 5 min inactivity"
        );
        throw new Error(`Database connection failed: ${error.message}`);
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

// Keep-alive: Ping database every 4 minutes to prevent auto-suspend
let keepAliveInterval: NodeJS.Timeout | null = null;

export const startKeepAlive = () => {
  if (keepAliveInterval) return;

  console.log("🔄 Starting database keep-alive (ping every 4 minutes)");

  keepAliveInterval = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      console.log("💓 Database keep-alive ping successful");
    } catch (error: any) {
      console.error("❌ Keep-alive ping failed:", error.message);
    }
  }, 4 * 60 * 1000); // 4 minutes
};

export const stopKeepAlive = () => {
  if (keepAliveInterval) {
    clearInterval(keepAliveInterval);
    keepAliveInterval = null;
    console.log("⏹️ Database keep-alive stopped");
  }
};

export default prisma;
