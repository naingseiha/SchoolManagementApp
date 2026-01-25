import { Request, Response } from "express";
import { prisma } from "../config/database";
import { storageService } from "../services/storage.service";

/**
 * Create a new post
 * POST /api/feed/posts
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { content, postType, visibility } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Post content is required",
      });
    }

    if (content.length > 2000) {
      return res.status(400).json({
        success: false,
        message: "Post content must be 2000 characters or less",
      });
    }

    // Handle media uploads if present
    let mediaUrls: string[] = [];
    let mediaKeys: string[] = [];

    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const result = await storageService.uploadPostMedia(
          file.buffer,
          userId!,
          file.originalname,
          file.mimetype
        );
        if (result.success && result.url && result.key) {
          mediaUrls.push(result.url);
          mediaKeys.push(result.key);
        }
      }
    }

    const post = await prisma.post.create({
      data: {
        authorId: userId!,
        content: content.trim(),
        postType: postType || "STATUS",
        visibility: visibility || "SCHOOL",
        mediaUrls,
        mediaKeys,
      },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            role: true,
            student: {
              select: {
                khmerName: true,
                class: {
                  select: {
                    name: true,
                    grade: true,
                  },
                },
              },
            },
            teacher: {
              select: {
                khmerName: true,
                position: true,
              },
            },
            parent: {
              select: {
                khmerName: true,
              },
            },
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      data: {
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLiked: false,
      },
    });
  } catch (error: any) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create post",
    });
  }
};

/**
 * Get feed posts (paginated)
 * GET /api/feed/posts
 */
export const getFeedPosts = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const postType = req.query.postType as string;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      OR: [
        { visibility: "PUBLIC" },
        { visibility: "SCHOOL" },
        { authorId: userId }, // Always show own posts
      ],
    };

    if (postType && postType !== "ALL") {
      where.postType = postType;
    }

    // Get posts with author info
    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: [
          { isPinned: "desc" },
          { createdAt: "desc" },
        ],
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
              role: true,
              student: {
                select: {
                  khmerName: true,
                  class: {
                    select: {
                      name: true,
                      grade: true,
                    },
                  },
                },
              },
              teacher: {
                select: {
                  khmerName: true,
                  position: true,
                },
              },
              parent: {
                select: {
                  khmerName: true,
                },
              },
            },
          },
          _count: {
            select: {
              likes: true,
              comments: true,
            },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Check if current user liked each post
    const postIds = posts.map((p) => p.id);
    const userLikes = await prisma.like.findMany({
      where: {
        userId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });
    const likedPostIds = new Set(userLikes.map((l) => l.postId));

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: likedPostIds.has(post.id),
    }));

    res.json({
      success: true,
      data: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error("Get feed posts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get feed",
    });
  }
};

/**
 * Get single post by ID
 * GET /api/feed/posts/:postId
 */
export const getPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            role: true,
            student: {
              select: {
                khmerName: true,
                class: { select: { name: true, grade: true } },
              },
            },
            teacher: {
              select: { khmerName: true, position: true },
            },
            parent: {
              select: { khmerName: true },
            },
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user liked the post
    const like = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: userId!,
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...post,
        likesCount: post._count.likes,
        commentsCount: post._count.comments,
        isLiked: !!like,
      },
    });
  } catch (error: any) {
    console.error("Get post error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get post",
    });
  }
};

/**
 * Update a post
 * PUT /api/feed/posts/:postId
 */
export const updatePost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;
    const { content, visibility } = req.body;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own posts",
      });
    }

    const updateData: any = { isEdited: true };
    if (content !== undefined) updateData.content = content.trim();
    if (visibility !== undefined) updateData.visibility = visibility;

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            profilePictureUrl: true,
            role: true,
          },
        },
        _count: {
          select: { likes: true, comments: true },
        },
      },
    });

    res.json({
      success: true,
      message: "Post updated successfully",
      data: {
        ...updatedPost,
        likesCount: updatedPost._count.likes,
        commentsCount: updatedPost._count.comments,
      },
    });
  } catch (error: any) {
    console.error("Update post error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update post",
    });
  }
};

/**
 * Delete a post
 * DELETE /api/feed/posts/:postId
 */
export const deletePost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if user is author or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (post.authorId !== userId && user?.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    // Delete media from R2
    for (const key of post.mediaKeys) {
      await storageService.deleteFile(key);
    }

    await prisma.post.delete({
      where: { id: postId },
    });

    res.json({
      success: true,
      message: "Post deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete post error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete post",
    });
  }
};

/**
 * Like/Unlike a post
 * POST /api/feed/posts/:postId/like
 */
export const toggleLike = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Check if already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId: userId!,
        },
      },
    });

    let isLiked: boolean;
    let likesCount: number;

    if (existingLike) {
      // Unlike
      await prisma.$transaction([
        prisma.like.delete({
          where: { id: existingLike.id },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { decrement: 1 } },
        }),
      ]);
      isLiked = false;
      likesCount = post.likesCount - 1;
    } else {
      // Like
      await prisma.$transaction([
        prisma.like.create({
          data: {
            postId,
            userId: userId!,
          },
        }),
        prisma.post.update({
          where: { id: postId },
          data: { likesCount: { increment: 1 } },
        }),
      ]);
      isLiked = true;
      likesCount = post.likesCount + 1;

      // Create notification for post author (if not self)
      if (post.authorId !== userId) {
        await prisma.notification.create({
          data: {
            recipientId: post.authorId,
            actorId: userId,
            type: "LIKE",
            title: "New Like",
            message: "Someone liked your post",
            link: `/feed/posts/${postId}`,
          },
        });
      }
    }

    res.json({
      success: true,
      data: {
        isLiked,
        likesCount,
      },
    });
  } catch (error: any) {
    console.error("Toggle like error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle like",
    });
  }
};

/**
 * Get comments for a post
 * GET /api/feed/posts/:postId/comments
 */
export const getComments = async (req: Request, res: Response) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { postId },
        orderBy: { createdAt: "asc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
              role: true,
              student: {
                select: { khmerName: true },
              },
              teacher: {
                select: { khmerName: true },
              },
              parent: {
                select: { khmerName: true },
              },
            },
          },
        },
      }),
      prisma.comment.count({ where: { postId } }),
    ]);

    res.json({
      success: true,
      data: comments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error("Get comments error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get comments",
    });
  }
};

/**
 * Add a comment to a post
 * POST /api/feed/posts/:postId/comments
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Comment content is required",
      });
    }

    if (content.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Comment must be 500 characters or less",
      });
    }

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Create comment and update comment count
    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          postId,
          authorId: userId!,
          content: content.trim(),
        },
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
              role: true,
              student: { select: { khmerName: true } },
              teacher: { select: { khmerName: true } },
              parent: { select: { khmerName: true } },
            },
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    // Create notification for post author (if not self)
    if (post.authorId !== userId) {
      await prisma.notification.create({
        data: {
          recipientId: post.authorId,
          actorId: userId,
          type: "COMMENT",
          title: "New Comment",
          message: "Someone commented on your post",
          link: `/feed/posts/${postId}`,
        },
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      data: comment,
    });
  } catch (error: any) {
    console.error("Add comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add comment",
    });
  }
};

/**
 * Delete a comment
 * DELETE /api/feed/comments/:commentId
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { commentId } = req.params;

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: { post: true },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user is comment author, post author, or admin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const canDelete =
      comment.authorId === userId ||
      comment.post.authorId === userId ||
      user?.role === "ADMIN";

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        message: "You cannot delete this comment",
      });
    }

    // Delete comment and update count
    await prisma.$transaction([
      prisma.comment.delete({
        where: { id: commentId },
      }),
      prisma.post.update({
        where: { id: comment.postId },
        data: { commentsCount: { decrement: 1 } },
      }),
    ]);

    res.json({
      success: true,
      message: "Comment deleted successfully",
    });
  } catch (error: any) {
    console.error("Delete comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete comment",
    });
  }
};

/**
 * Get user's posts
 * GET /api/feed/users/:userId/posts
 */
export const getUserPosts = async (req: Request, res: Response) => {
  try {
    const currentUserId = req.userId;
    const { userId: targetUserId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const isOwnProfile = currentUserId === targetUserId;

    // Build visibility filter
    const where: any = {
      authorId: targetUserId,
    };

    if (!isOwnProfile) {
      where.OR = [
        { visibility: "PUBLIC" },
        { visibility: "SCHOOL" },
      ];
    }

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              profilePictureUrl: true,
              role: true,
              student: {
                select: {
                  khmerName: true,
                  class: { select: { name: true, grade: true } },
                },
              },
              teacher: { select: { khmerName: true, position: true } },
              parent: { select: { khmerName: true } },
            },
          },
          _count: {
            select: { likes: true, comments: true },
          },
        },
      }),
      prisma.post.count({ where }),
    ]);

    // Check if current user liked each post
    const postIds = posts.map((p) => p.id);
    const userLikes = await prisma.like.findMany({
      where: {
        userId: currentUserId,
        postId: { in: postIds },
      },
      select: { postId: true },
    });
    const likedPostIds = new Set(userLikes.map((l) => l.postId));

    const postsWithLikeStatus = posts.map((post) => ({
      ...post,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: likedPostIds.has(post.id),
    }));

    res.json({
      success: true,
      data: postsWithLikeStatus,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasMore: page * limit < total,
      },
    });
  } catch (error: any) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get user posts",
    });
  }
};
