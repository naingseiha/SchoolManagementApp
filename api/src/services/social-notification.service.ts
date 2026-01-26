import { prisma } from "../config/database";
import { socketService } from "./socket.service";

export enum SocialNotificationType {
  LIKE = "LIKE",
  COMMENT = "COMMENT",
  REPLY = "REPLY",
  MENTION = "MENTION",
  FOLLOW = "FOLLOW",
  COURSE_ENROLL = "COURSE_ENROLL",
  ASSIGNMENT_DUE = "ASSIGNMENT_DUE",
  POLL_RESULT = "POLL_RESULT",
  ACHIEVEMENT = "ACHIEVEMENT",
}

interface CreateSocialNotificationData {
  recipientId: string;
  actorId?: string;
  type: SocialNotificationType;
  title: string;
  message: string;
  link?: string;
  postId?: string;
  commentId?: string;
}

class SocialNotificationService {
  /**
   * Create and send a notification
   */
  async create(data: CreateSocialNotificationData) {
    try {
      const notification = await prisma.notification.create({
        data: {
          recipientId: data.recipientId,
          actorId: data.actorId,
          type: data.type as any,
          title: data.title,
          message: data.message,
          link: data.link,
          postId: data.postId,
          commentId: data.commentId,
        },
        include: {
          actor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
              role: true,
            },
          },
        },
      });

      // Send real-time notification via Socket.IO
      socketService.sendNotificationToUser(data.recipientId, notification);

      return notification;
    } catch (error) {
      console.error("Failed to create notification:", error);
      throw error;
    }
  }

  /**
   * Notify when someone likes your post
   */
  async notifyPostLike(postId: string, likerId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          authorId: true,
          content: true,
        },
      });

      if (!post || post.authorId === likerId) return; // Don't notify self

      const liker = await prisma.user.findUnique({
        where: { id: likerId },
        select: { firstName: true, lastName: true },
      });

      await this.create({
        recipientId: post.authorId,
        actorId: likerId,
        type: SocialNotificationType.LIKE,
        title: "New Like",
        message: `${liker?.firstName} ${liker?.lastName} liked your post`,
        link: `/feed?post=${postId}`,
        postId,
      });
    } catch (error) {
      console.error("Failed to notify post like:", error);
    }
  }

  /**
   * Notify when someone comments on your post
   */
  async notifyPostComment(postId: string, commenterId: string, commentId: string) {
    try {
      const post = await prisma.post.findUnique({
        where: { id: postId },
        select: {
          id: true,
          authorId: true,
        },
      });

      if (!post || post.authorId === commenterId) return;

      const commenter = await prisma.user.findUnique({
        where: { id: commenterId },
        select: { firstName: true, lastName: true },
      });

      await this.create({
        recipientId: post.authorId,
        actorId: commenterId,
        type: SocialNotificationType.COMMENT,
        title: "New Comment",
        message: `${commenter?.firstName} ${commenter?.lastName} commented on your post`,
        link: `/feed?post=${postId}&comment=${commentId}`,
        postId,
        commentId,
      });
    } catch (error) {
      console.error("Failed to notify post comment:", error);
    }
  }

  /**
   * Notify when someone replies to your comment
   */
  async notifyCommentReply(commentId: string, replierId: string, replyId: string) {
    try {
      const parentComment = await prisma.comment.findUnique({
        where: { id: commentId },
        select: {
          id: true,
          authorId: true,
          postId: true,
        },
      });

      if (!parentComment || parentComment.authorId === replierId) return;

      const replier = await prisma.user.findUnique({
        where: { id: replierId },
        select: { firstName: true, lastName: true },
      });

      await this.create({
        recipientId: parentComment.authorId,
        actorId: replierId,
        type: SocialNotificationType.REPLY,
        title: "New Reply",
        message: `${replier?.firstName} ${replier?.lastName} replied to your comment`,
        link: `/feed?post=${parentComment.postId}&comment=${replyId}`,
        postId: parentComment.postId,
        commentId: replyId,
      });
    } catch (error) {
      console.error("Failed to notify comment reply:", error);
    }
  }

  /**
   * Notify when someone mentions you
   */
  async notifyMention(mentionedUserId: string, mentionerId: string, postId: string, commentId?: string) {
    try {
      if (mentionedUserId === mentionerId) return;

      const mentioner = await prisma.user.findUnique({
        where: { id: mentionerId },
        select: { firstName: true, lastName: true },
      });

      const link = commentId 
        ? `/feed?post=${postId}&comment=${commentId}`
        : `/feed?post=${postId}`;

      await this.create({
        recipientId: mentionedUserId,
        actorId: mentionerId,
        type: SocialNotificationType.MENTION,
        title: "You were mentioned",
        message: `${mentioner?.firstName} ${mentioner?.lastName} mentioned you in a ${commentId ? "comment" : "post"}`,
        link,
        postId,
        commentId,
      });
    } catch (error) {
      console.error("Failed to notify mention:", error);
    }
  }

  /**
   * Notify when someone follows you
   */
  async notifyFollow(followedId: string, followerId: string) {
    try {
      if (followedId === followerId) return;

      const follower = await prisma.user.findUnique({
        where: { id: followerId },
        select: { firstName: true, lastName: true },
      });

      await this.create({
        recipientId: followedId,
        actorId: followerId,
        type: SocialNotificationType.FOLLOW,
        title: "New Follower",
        message: `${follower?.firstName} ${follower?.lastName} started following you`,
        link: `/profile/${followerId}`,
      });
    } catch (error) {
      console.error("Failed to notify follow:", error);
    }
  }

  /**
   * Get notifications for a user
   */
  async getNotifications(userId: string, page: number = 1, limit: number = 20, unreadOnly: boolean = false) {
    try {
      const skip = (page - 1) * limit;

      const where: any = {
        recipientId: userId,
      };

      if (unreadOnly) {
        where.isRead = false;
      }

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where,
          include: {
            actor: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                profilePictureUrl: true,
                role: true,
              },
            },
          },
          orderBy: { createdAt: "desc" },
          skip,
          take: limit,
        }),
        prisma.notification.count({ where }),
      ]);

      const unreadCount = await prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

      return {
        data: notifications,
        unreadCount,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: skip + notifications.length < total,
        },
      };
    } catch (error) {
      console.error("Failed to get notifications:", error);
      throw error;
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string, userId: string) {
    try {
      const notification = await prisma.notification.updateMany({
        where: {
          id: notificationId,
          recipientId: userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return notification.count > 0;
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
      throw error;
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId: string) {
    try {
      await prisma.notification.updateMany({
        where: {
          recipientId: userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
      throw error;
    }
  }

  /**
   * Delete notification
   */
  async delete(notificationId: string, userId: string) {
    try {
      await prisma.notification.deleteMany({
        where: {
          id: notificationId,
          recipientId: userId,
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to delete notification:", error);
      throw error;
    }
  }

  /**
   * Get unread count
   */
  async getUnreadCount(userId: string) {
    try {
      const count = await prisma.notification.count({
        where: {
          recipientId: userId,
          isRead: false,
        },
      });

      return count;
    } catch (error) {
      console.error("Failed to get unread count:", error);
      return 0;
    }
  }
}

export const socialNotificationService = new SocialNotificationService();
