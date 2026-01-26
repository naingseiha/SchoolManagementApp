import { Request, Response } from "express";
import { prisma } from "../config/database";
import { storageService } from "../services/storage.service";
import { socialNotificationService } from "../services/social-notification.service";

/**
 * Create a new post
 * POST /api/feed/posts
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    let { content, postType, visibility, pollOptions } = req.body;

    // ✅ Parse pollOptions if it's a JSON string (from FormData)
    if (typeof pollOptions === 'string') {
      try {
        pollOptions = JSON.parse(pollOptions);
      } catch (e) {
        console.error("Failed to parse pollOptions:", e);
        pollOptions = undefined;
      }
    }

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

    // Validate poll options if POLL type
    if (postType === "POLL") {
      if (!pollOptions || !Array.isArray(pollOptions) || pollOptions.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Poll must have at least 2 options",
        });
      }
      if (pollOptions.length > 6) {
        return res.status(400).json({
          success: false,
          message: "Poll can have maximum 6 options",
        });
      }
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

    // Create post with poll options if POLL type
    const post = await prisma.post.create({
      data: {
        authorId: userId!,
        content: content.trim(),
        postType: postType || "ARTICLE",
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

    // Create poll options if POLL type
    if (postType === "POLL" && pollOptions && Array.isArray(pollOptions)) {
      await Promise.all(
        pollOptions.map((optionText: string, index: number) =>
          prisma.pollOption.create({
            data: {
              postId: post.id,
              text: optionText.trim(),
              position: index,
            },
          })
        )
      );
    }

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

    // Get posts with author info and poll options
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

    // Fetch poll options for POLL type posts
    const pollPostIds = posts.filter(p => p.postType === 'POLL').map(p => p.id);
    const pollOptions = pollPostIds.length > 0 
      ? await prisma.pollOption.findMany({
          where: { postId: { in: pollPostIds } },
          orderBy: { position: 'asc' },
          include: {
            _count: {
              select: { votes: true }
            }
          }
        })
      : [];

    // Get user's votes
    const userVotes = userId && pollPostIds.length > 0
      ? await prisma.pollVote.findMany({
          where: { 
            userId,
            option: { postId: { in: pollPostIds } }
          },
          include: { option: { select: { postId: true } } }
        })
      : [];

    // Group poll options by postId
    const pollOptionsByPost = new Map<string, any[]>();
    pollOptions.forEach(option => {
      if (!pollOptionsByPost.has(option.postId)) {
        pollOptionsByPost.set(option.postId, []);
      }
      pollOptionsByPost.get(option.postId)!.push({
        id: option.id,
        text: option.text,
        position: option.position,
        votesCount: option._count.votes,
      });
    });

    // Map user votes by postId
    const userVotesByPost = new Map<string, string>();
    userVotes.forEach(vote => {
      userVotesByPost.set(vote.option.postId, vote.optionId);
    });

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
      // Add poll data if POLL type
      ...(post.postType === 'POLL' && {
        pollOptions: pollOptionsByPost.get(post.id) || [],
        userVote: userVotesByPost.get(post.id) || null,
        totalVotes: (pollOptionsByPost.get(post.id) || [])
          .reduce((sum: number, opt: any) => sum + opt.votesCount, 0),
      }),
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

      // Send real-time notification
      if (post.authorId !== userId) {
        socialNotificationService.notifyPostLike(postId, userId!).catch(console.error);
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
    const userId = req.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sort = (req.query.sort as string) || "new"; // new, old, top
    const skip = (page - 1) * limit;

    // Determine sort order
    let orderBy: any = { createdAt: "desc" }; // Default: newest first
    if (sort === "old") orderBy = { createdAt: "asc" };
    // "top" sorting will be done after fetching reactions

    // Fetch top-level comments (no parentId)
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where: { 
          postId,
          parentId: null, // Only top-level comments
        },
        orderBy,
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
              student: { select: { khmerName: true } },
              teacher: { select: { khmerName: true } },
              parent: { select: { khmerName: true } },
            },
          },
          replies: {
            orderBy: { createdAt: "asc" },
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
              reactions: true,
            },
          },
          reactions: true,
        },
      }),
      prisma.comment.count({ where: { postId, parentId: null } }),
    ]);

    // Calculate reaction counts and user's reaction for each comment
    const enrichedComments = comments.map((comment) => {
      const reactionCounts = {
        LIKE: 0,
        LOVE: 0,
        HELPFUL: 0,
        INSIGHTFUL: 0,
      };
      let userReaction = null;

      comment.reactions.forEach((reaction: any) => {
        reactionCounts[reaction.type as keyof typeof reactionCounts]++;
        if (reaction.userId === userId) {
          userReaction = reaction.type;
        }
      });

      // Process replies with same logic
      const enrichedReplies = comment.replies.map((reply: any) => {
        const replyReactionCounts = {
          LIKE: 0,
          LOVE: 0,
          HELPFUL: 0,
          INSIGHTFUL: 0,
        };
        let replyUserReaction = null;

        reply.reactions.forEach((reaction: any) => {
          replyReactionCounts[reaction.type as keyof typeof replyReactionCounts]++;
          if (reaction.userId === userId) {
            replyUserReaction = reaction.type;
          }
        });

        const { reactions, ...replyWithoutReactions } = reply;
        return {
          ...replyWithoutReactions,
          reactionCounts: replyReactionCounts,
          userReaction: replyUserReaction,
          repliesCount: 0, // Nested replies don't have sub-replies yet
        };
      });

      const { reactions, replies, ...commentWithoutReactions } = comment;
      return {
        ...commentWithoutReactions,
        reactionCounts,
        userReaction,
        replies: enrichedReplies,
        repliesCount: enrichedReplies.length,
      };
    });

    // Sort by "top" if requested (most reactions)
    if (sort === "top") {
      enrichedComments.sort((a, b) => {
        const aTotal = Object.values(a.reactionCounts).reduce((sum: number, count) => sum + count, 0);
        const bTotal = Object.values(b.reactionCounts).reduce((sum: number, count) => sum + count, 0);
        return bTotal - aTotal;
      });
    }

    res.json({
      success: true,
      data: enrichedComments,
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
    const { content, parentId } = req.body;

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

    // If replying, check parent comment exists
    if (parentId) {
      const parentComment = await prisma.comment.findUnique({
        where: { id: parentId },
        include: { author: true },
      });

      if (!parentComment) {
        return res.status(404).json({
          success: false,
          message: "Parent comment not found",
        });
      }

      // Create reply and update comment count
      const [comment] = await prisma.$transaction([
        prisma.comment.create({
          data: {
            postId,
            authorId: userId!,
            content: content.trim(),
            parentId, // Set parent for threading
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

      // Send notification to parent comment author (reply notification)
      if (parentComment.authorId !== userId) {
        socialNotificationService.notifyCommentReply(parentId, userId!, comment.id).catch(console.error);
      }

      return res.status(201).json({
        success: true,
        message: "Reply added successfully",
        data: comment,
      });
    }

    // Create top-level comment and update comment count
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

    // Send real-time notification to post author
    if (post.authorId !== userId) {
      socialNotificationService.notifyPostComment(postId, userId!, comment.id).catch(console.error);
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
 * Toggle comment reaction
 * POST /api/feed/comments/:commentId/react
 */
export const toggleCommentReaction = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { commentId } = req.params;
    const { type } = req.body; // LIKE, LOVE, HELPFUL, INSIGHTFUL

    if (!type || !["LIKE", "LOVE", "HELPFUL", "INSIGHTFUL"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: "Invalid reaction type",
      });
    }

    // Check if comment exists
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    // Check if user already reacted with this type
    const existingReaction = await prisma.commentReaction.findUnique({
      where: {
        commentId_userId_type: {
          commentId,
          userId,
          type,
        },
      },
    });

    if (existingReaction) {
      // Remove reaction (toggle off)
      await prisma.commentReaction.delete({
        where: {
          id: existingReaction.id,
        },
      });

      return res.json({
        success: true,
        message: "Reaction removed",
        action: "removed",
      });
    } else {
      // Add reaction
      await prisma.commentReaction.create({
        data: {
          commentId,
          userId,
          type,
        },
      });

      return res.json({
        success: true,
        message: "Reaction added",
        action: "added",
      });
    }
  } catch (error: any) {
    console.error("Toggle comment reaction error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to toggle reaction",
    });
  }
};

/**
 * Edit a comment
 * PUT /api/feed/comments/:commentId
 */
export const editComment = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const { commentId } = req.params;
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

    // Check if comment exists and user is author
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({
        success: false,
        message: "Comment not found",
      });
    }

    if (comment.authorId !== userId) {
      return res.status(403).json({
        success: false,
        message: "You can only edit your own comments",
      });
    }

    // Update comment
    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: {
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
    });

    res.json({
      success: true,
      message: "Comment updated successfully",
      data: updatedComment,
    });
  } catch (error: any) {
    console.error("Edit comment error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to edit comment",
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

/**
 * Vote on a poll option
 * POST /api/feed/polls/:optionId/vote
 */
export const votePoll = async (req: Request, res: Response) => {
  try {
    const userId = req.userId!;
    const { optionId } = req.params;

    // Check if option exists
    const option = await prisma.pollOption.findUnique({
      where: { id: optionId },
      include: { votes: { where: { userId } } },
    });

    if (!option) {
      return res.status(404).json({
        success: false,
        message: "Poll option not found",
      });
    }

    // Check if user already voted
    if (option.votes.length > 0) {
      return res.status(400).json({
        success: false,
        message: "You have already voted on this poll",
      });
    }

    // Create vote and update count
    await prisma.$transaction([
      prisma.pollVote.create({
        data: {
          optionId,
          userId,
        },
      }),
      prisma.pollOption.update({
        where: { id: optionId },
        data: { votesCount: { increment: 1 } },
      }),
    ]);

    // Get updated poll data
    const updatedOptions = await prisma.pollOption.findMany({
      where: { postId: option.postId },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        text: true,
        position: true,
        votesCount: true,
      },
    });

    const totalVotes = updatedOptions.reduce((sum, opt) => sum + opt.votesCount, 0);

    res.json({
      success: true,
      message: "Vote recorded successfully",
      data: {
        pollOptions: updatedOptions,
        userVote: optionId,
        totalVotes,
      },
    });
  } catch (error: any) {
    console.error("Vote poll error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to record vote",
    });
  }
};
