"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gracefulShutdown = exports.stopKeepAlive = exports.startKeepAlive = exports.disconnectDatabase = exports.connectDatabase = exports.prisma = void 0;
const client_1 = require("@prisma/client");
// ✅ Singleton pattern with proper connection management
const globalForPrisma = global;
exports.prisma = globalForPrisma.prisma ||
    new client_1.PrismaClient({
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
    globalForPrisma.prisma = exports.prisma;
}
// ✅ Connection retry logic for Neon cold starts
const connectDatabase = async (maxRetries = 5, retryDelay = 3000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`🔄 Connecting to database (attempt ${attempt}/${maxRetries})...`);
            await exports.prisma.$connect();
            await exports.prisma.$queryRaw `SELECT 1`;
            console.log("✅ Database connected successfully");
            return;
        }
        catch (error) {
            console.log(`❌ Connection attempt ${attempt} failed:`, error.message);
            if (attempt < maxRetries) {
                console.log(`⏳ Retrying in ${retryDelay / 1000}s...`);
                await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
            else {
                console.error(`❌ Failed to connect after ${maxRetries} attempts`);
                throw new Error(`Database connection failed: ${error.message}`);
            }
        }
    }
};
exports.connectDatabase = connectDatabase;
const disconnectDatabase = async () => {
    try {
        await exports.prisma.$disconnect();
        console.log("✅ Database disconnected");
    }
    catch (error) {
        console.error("❌ Error disconnecting database:", error.message);
    }
};
exports.disconnectDatabase = disconnectDatabase;
// ✅ Keep-alive with connection health check
let keepAliveInterval = null;
const startKeepAlive = () => {
    if (keepAliveInterval)
        return;
    console.log("🔄 Starting database keep-alive (ping every 4 minutes)");
    keepAliveInterval = setInterval(async () => {
        try {
            await exports.prisma.$queryRaw `SELECT 1`;
            console.log("💓 Database keep-alive ping successful");
        }
        catch (error) {
            console.error("❌ Keep-alive ping failed:", error.message);
            // Try to reconnect
            try {
                await exports.prisma.$connect();
                console.log("🔄 Reconnected to database");
            }
            catch (reconnectError) {
                console.error("❌ Reconnection failed");
            }
        }
    }, 4 * 60 * 1000); // 4 minutes
};
exports.startKeepAlive = startKeepAlive;
const stopKeepAlive = () => {
    if (keepAliveInterval) {
        clearInterval(keepAliveInterval);
        keepAliveInterval = null;
        console.log("⏹️ Database keep-alive stopped");
    }
};
exports.stopKeepAlive = stopKeepAlive;
// ✅ Graceful shutdown handler
const gracefulShutdown = async () => {
    console.log("🛑 Initiating graceful shutdown...");
    (0, exports.stopKeepAlive)();
    await (0, exports.disconnectDatabase)();
    console.log("✅ Shutdown complete");
};
exports.gracefulShutdown = gracefulShutdown;
exports.default = exports.prisma;
