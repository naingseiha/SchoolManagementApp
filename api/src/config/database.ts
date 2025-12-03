import { PrismaClient } from "@prisma/client";

// ✅ Singleton pattern with proper connection management
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL,
      },
    },
    // ✅ Configure connection pool and timeouts
    // Note: These are client-side settings
  });

// ✅ Prevent multiple instances in development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ✅ Connection retry logic for Neon cold starts
export const connectDatabase = async (maxRetries = 5, retryDelay = 3000) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🔄 Connecting to database (attempt ${attempt}/${maxRetries})...`
      );

      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1`;

      console.log("✅ Database connected successfully");
      return;
    } catch (error: any) {
      console.log(`❌ Connection attempt ${attempt} failed:`, error.message);

      if (attempt < maxRetries) {
        console.log(`⏳ Retrying in ${retryDelay / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      } else {
        console.error(`❌ Failed to connect after ${maxRetries} attempts`);
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

// ✅ Keep-alive with connection health check
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
      // Try to reconnect
      try {
        await prisma.$connect();
        console.log("🔄 Reconnected to database");
      } catch (reconnectError) {
        console.error("❌ Reconnection failed");
      }
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

// ✅ Graceful shutdown handler
export const gracefulShutdown = async () => {
  console.log("🛑 Initiating graceful shutdown...");
  stopKeepAlive();
  await disconnectDatabase();
  console.log("✅ Shutdown complete");
};

export default prisma;
