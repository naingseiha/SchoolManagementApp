"use client";

import { useState } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  MoreVertical,
  FileText,
  GraduationCap,
  Brain,
  HelpCircle,
  ClipboardCheck,
  Megaphone,
  BookOpen,
  BarChart3,
  FolderOpen,
  Edit,
  Trash2,
  Flag,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  Book,
  Microscope,
  Trophy,
  Lightbulb,
  Users,
  Clock,
  Calendar,
  ExternalLink,
  Play,
  Send,
  AlertCircle,
  Star,
} from "lucide-react";
import { Post, PostType, toggleLike, deletePost, POST_TYPE_INFO } from "@/lib/api/feed";
import { formatDistanceToNow } from "date-fns";
import PollCard from "./PollCard";

interface PostCardProps {
  post: Post;
  currentUserId?: string;
  onPostDeleted?: (postId: string) => void;
  onCommentClick?: (postId: string) => void;
  onProfileClick?: (userId: string) => void;
}

const POST_TYPE_ICONS: Record<PostType, React.ElementType> = {
  ARTICLE: FileText,
  COURSE: GraduationCap,
  QUIZ: Brain,
  QUESTION: HelpCircle,
  EXAM: ClipboardCheck,
  ANNOUNCEMENT: Megaphone,
  ASSIGNMENT: BookOpen,
  POLL: BarChart3,
  RESOURCE: FolderOpen,
  PROJECT: Briefcase,
  TUTORIAL: Book,
  RESEARCH: Microscope,
  ACHIEVEMENT: Trophy,
  REFLECTION: Lightbulb,
  COLLABORATION: Users,
};

export default function PostCard({
  post,
  currentUserId,
  onPostDeleted,
  onCommentClick,
  onProfileClick,
}: PostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked);
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showFullContent, setShowFullContent] = useState(false);

  const isOwnPost = currentUserId === post.authorId;
  const PostTypeIcon = POST_TYPE_ICONS[post.postType];
  const postTypeInfo = POST_TYPE_INFO[post.postType];

  const getAuthorName = () => {
    if (post.author.student?.khmerName) return post.author.student.khmerName;
    if (post.author.teacher?.khmerName) return post.author.teacher.khmerName;
    if (post.author.parent?.khmerName) return post.author.parent.khmerName;
    return `${post.author.firstName} ${post.author.lastName}`;
  };

  const getAuthorSubtitle = () => {
    if (post.author.teacher?.position) return post.author.teacher.position;
    if (post.author.student?.class) {
      return `${post.author.student.class.name}`;
    }
    return post.author.role;
  };

  const getTimeAgo = () => {
    return formatDistanceToNow(new Date(post.createdAt), { addSuffix: true });
  };

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);
    try {
      await toggleLike(post.id);
      setIsLiked(!isLiked);
      setLikesCount(isLiked ? likesCount - 1 : likesCount + 1);
    } catch (error) {
      console.error("Toggle like error:", error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setIsDeleting(true);
    try {
      await deletePost(post.id);
      if (onPostDeleted) onPostDeleted(post.id);
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === post.mediaUrls.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? post.mediaUrls.length - 1 : prev - 1
    );
  };

  // Render type-specific features
  const renderTypeSpecificContent = () => {
    switch (post.postType) {
      case "POLL":
        if (post.pollOptions && post.pollOptions.length > 0) {
          return (
            <PollCard
              postId={post.id}
              pollOptions={post.pollOptions}
              userVote={post.userVote || null}
              totalVotes={post.totalVotes || 0}
            />
          );
        }
        break;

      case "QUESTION":
        return (
          <div className="mt-4">
            <button className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Answer This Question
            </button>
          </div>
        );

      case "COURSE":
        return (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                12 weeks
              </span>
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                234 enrolled
              </span>
            </div>
            <button className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <GraduationCap className="w-4 h-4" />
              Enroll Now
            </button>
          </div>
        );

      case "QUIZ":
        return (
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-gray-600">10 questions • 15 min</span>
            <button className="py-2 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
              <Play className="w-4 h-4" />
              Take Quiz
            </button>
          </div>
        );

      case "ASSIGNMENT":
        return (
          <div className="mt-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-orange-600">
              <Calendar className="w-4 h-4" />
              <span className="font-medium">Due: March 15</span>
            </div>
            <button className="py-2 px-4 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-lg transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Submit
            </button>
          </div>
        );

      case "ANNOUNCEMENT":
        return (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <span className="text-sm font-medium text-red-900">Important Announcement</span>
          </div>
        );

      case "PROJECT":
        return (
          <div className="mt-4">
            <button className="w-full py-2.5 px-4 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4" />
              View Project
            </button>
          </div>
        );

      case "ACHIEVEMENT":
        return (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
              <Trophy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Achievement Unlocked!</h4>
              <p className="text-sm text-gray-600">Celebrate this milestone</p>
            </div>
          </div>
        );
    }
    return null;
  };

  const contentText = post.content;
  const isLongContent = contentText.length > 300;
  const displayContent = isLongContent && !showFullContent
    ? contentText.slice(0, 300) + "..."
    : contentText;

  return (
    <article className="bg-white">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {/* Author Info */}
          <div className="flex gap-3 flex-1 min-w-0">
            <button
              onClick={() => onProfileClick?.(post.authorId)}
              className="flex-shrink-0"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                {getAuthorName().charAt(0).toUpperCase()}
              </div>
            </button>
            
            <div className="flex-1 min-w-0">
              <button
                onClick={() => onProfileClick?.(post.authorId)}
                className="font-semibold text-gray-900 hover:underline text-[15px] block truncate"
              >
                {getAuthorName()}
              </button>
              <p className="text-xs text-gray-500">{getTimeAgo()}</p>
            </div>
          </div>

          {/* Post Type Badge & Menu */}
          <div className="flex items-center gap-2 ml-3">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <PostTypeIcon className="w-4 h-4" style={{ color: postTypeInfo.color }} />
                <span className="text-xs font-semibold" style={{ color: postTypeInfo.color }}>
                  {postTypeInfo.label}
                </span>
              </div>
              <span className="text-[10px] text-gray-500">0 Reads</span>
            </div>

            {/* Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20 min-w-[160px]">
                    {isOwnPost ? (
                      <>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                          onClick={() => setShowMenu(false)}
                        >
                          <Edit className="w-4 h-4" />
                          Edit Post
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 flex items-center gap-3 text-red-600"
                          onClick={handleDelete}
                          disabled={isDeleting}
                        >
                          <Trash2 className="w-4 h-4" />
                          {isDeleting ? "Deleting..." : "Delete Post"}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                          onClick={() => setShowMenu(false)}
                        >
                          <Flag className="w-4 h-4" />
                          Report Post
                        </button>
                        <button
                          className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-3 text-gray-700"
                          onClick={() => setShowMenu(false)}
                        >
                          <Bookmark className="w-4 h-4" />
                          Save Post
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery - Full Width, No Padding */}
      {post.mediaUrls && post.mediaUrls.length > 0 && (
        <div className="relative w-full bg-gray-100" style={{ aspectRatio: '16/9' }}>
          <img
            src={post.mediaUrls[currentImageIndex]}
            alt="Post media"
            className="w-full h-full object-cover"
          />
          
          {post.mediaUrls.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all"
              >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-md flex items-center justify-center hover:bg-white transition-all"
              >
                <ChevronRight className="w-5 h-5 text-gray-800" />
              </button>
              
              {/* Dots Indicator */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {post.mediaUrls.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentImageIndex
                        ? 'bg-orange-500 w-6'
                        : 'bg-white/70 w-1.5'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Content Section */}
      <div className="px-4 py-4">
        {/* Title - No Icon */}
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1">
            {post.content.split('\n')[0] || postTypeInfo.label}
          </h3>
          <p className="text-xs text-gray-500">
            {getAuthorSubtitle()}
          </p>
        </div>

        {/* Description */}
        {post.content.split('\n').slice(1).join('\n') && (
          <div>
            <p className="text-[15px] text-gray-600 leading-relaxed">
              {displayContent.split('\n').slice(1).join('\n')}
            </p>
            {isLongContent && (
              <button
                onClick={() => setShowFullContent(!showFullContent)}
                className="text-blue-600 hover:underline text-sm mt-2"
              >
                {showFullContent ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        )}

        {/* Type-Specific Content */}
        {renderTypeSpecificContent()}

        {/* Feature/Insights Buttons for Article/Course */}
        {(post.postType === 'ARTICLE' || post.postType === 'COURSE') && (
          <div className="flex gap-2 mt-4">
            <button className="flex-1 py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5 transition-colors">
              <Star className="w-4 h-4" />
              Feature
            </button>
            <button className="flex-1 py-2 px-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-lg text-sm font-medium text-gray-700 flex items-center justify-center gap-1.5 transition-colors">
              <BarChart3 className="w-4 h-4" />
              Insights
            </button>
          </div>
        )}
      </div>

      {/* Engagement Section */}
      <div className="px-4 pb-4 pt-3 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center gap-1.5 text-gray-600 hover:text-red-500 transition-colors"
          >
            <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
            <span className="text-sm font-medium">{likesCount}</span>
          </button>

          <button
            onClick={() => onCommentClick?.(post.id)}
            className="flex items-center gap-1.5 text-gray-600 hover:text-blue-500 transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-sm font-medium">{post.commentsCount}</span>
          </button>

          <button className="flex items-center gap-1.5 text-gray-600 hover:text-green-500 transition-colors">
            <Share2 className="w-5 h-5" />
            <span className="text-sm font-medium">{post.sharesCount}</span>
          </button>

          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="text-gray-600 hover:text-yellow-500 transition-colors"
          >
            <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-yellow-500 text-yellow-500' : ''}`} />
          </button>
        </div>
      </div>
    </article>
  );
}
