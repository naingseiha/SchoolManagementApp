import { Server as HttpServer } from "http";
import { Server as SocketIOServer, Socket } from "socket.io";
import jwt from "jsonwebtoken";

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

class SocketService {
  private io: SocketIOServer | null = null;
  private userSockets: Map<string, string> = new Map(); // userId -> socketId

  /**
   * Initialize Socket.IO server
   */
  init(httpServer: HttpServer): SocketIOServer {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.use(this.authenticateSocket);
    this.io.on("connection", this.handleConnection);

    console.log("✅ Socket.IO server initialized");
    return this.io;
  }

  /**
   * Authenticate socket connection using JWT
   */
  private authenticateSocket = async (
    socket: AuthenticatedSocket,
    next: (err?: Error) => void
  ) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(" ")[1];

      if (!token) {
        return next(new Error("Authentication token missing"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
        userId: string;
      };

      socket.userId = decoded.userId;
      next();
    } catch (error) {
      console.error("Socket authentication error:", error);
      next(new Error("Authentication failed"));
    }
  };

  /**
   * Handle new socket connection
   */
  private handleConnection = (socket: AuthenticatedSocket) => {
    const userId = socket.userId!;
    console.log(`User connected: ${userId} (${socket.id})`);

    // Store user's socket ID
    this.userSockets.set(userId, socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${userId}`);
      this.userSockets.delete(userId);
    });

    // Handle typing indicators (for future chat feature)
    socket.on("typing:start", (data: { postId: string }) => {
      socket.to(`post:${data.postId}`).emit("user:typing", {
        userId,
        postId: data.postId,
      });
    });

    socket.on("typing:stop", (data: { postId: string }) => {
      socket.to(`post:${data.postId}`).emit("user:stopped-typing", {
        userId,
        postId: data.postId,
      });
    });

    // Handle online status
    this.emitOnlineStatus(userId, true);
  };

  /**
   * Send notification to specific user
   */
  sendNotificationToUser(userId: string, notification: any) {
    if (!this.io) {
      console.error("Socket.IO not initialized");
      return;
    }

    this.io.to(`user:${userId}`).emit("notification:new", notification);
    console.log(`Notification sent to user ${userId}`);
  }

  /**
   * Send notification to multiple users
   */
  sendNotificationToUsers(userIds: string[], notification: any) {
    userIds.forEach((userId) => {
      this.sendNotificationToUser(userId, notification);
    });
  }

  /**
   * Broadcast to all connected users
   */
  broadcast(event: string, data: any) {
    if (!this.io) {
      console.error("Socket.IO not initialized");
      return;
    }

    this.io.emit(event, data);
  }

  /**
   * Emit online status change
   */
  emitOnlineStatus(userId: string, isOnline: boolean) {
    if (!this.io) return;

    this.io.emit("user:status", {
      userId,
      isOnline,
      timestamp: new Date(),
    });
  }

  /**
   * Get online users count
   */
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId);
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): SocketIOServer | null {
    return this.io;
  }
}

// Export singleton instance
export const socketService = new SocketService();
