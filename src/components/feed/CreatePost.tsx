"use client";

import { useState, useRef, memo } from "react";
import {
  Image as ImageIcon,
  X,
  Loader2,
  Award,
  Target,
  BookOpen,
  HelpCircle,
  Megaphone,
  MessageSquare,
  User,
  Send,
  ChevronDown,
  Globe,
  Users,
  Lock,
} from "lucide-react";
import {
  createPost,
  PostType,
  PostVisibility,
  POST_TYPE_INFO,
} from "@/lib/api/feed";
import { compressImage } from "@/lib/utils/imageCompression";

interface CreatePostProps {
  userProfilePicture?: string | null;
  userName: string;
  onPostCreated?: () => void;
  onError?: (error: string) => void;
}

const POST_TYPES: { type: PostType; icon: React.ElementType }[] = [
  { type: "STATUS", icon: MessageSquare },
  { type: "ACHIEVEMENT", icon: Award },
  { type: "LEARNING_GOAL", icon: Target },
  { type: "RESOURCE_SHARE", icon: BookOpen },
  { type: "QUESTION", icon: HelpCircle },
  { type: "ANNOUNCEMENT", icon: Megaphone },
];

const VISIBILITY_OPTIONS: {
  value: PostVisibility;
  label: string;
  labelKh: string;
  icon: React.ElementType;
}[] = [
  { value: "SCHOOL", label: "School", labelKh: "សាលារៀន", icon: Users },
  { value: "PUBLIC", label: "Public", labelKh: "សាធារណៈ", icon: Globe },
  { value: "CLASS", label: "Class", labelKh: "ថ្នាក់រៀន", icon: Users },
  { value: "PRIVATE", label: "Private", labelKh: "ឯកជន", icon: Lock },
];

function CreatePost({
  userProfilePicture,
  userName,
  onPostCreated,
  onError,
}: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<PostType>("STATUS");
  const [visibility, setVisibility] = useState<PostVisibility>("SCHOOL");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([]);
  const [isPosting, setIsPosting] = useState(false);
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const [showVisibilitySelector, setShowVisibilitySelector] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    if (content.trim() || mediaFiles.length > 0) {
      if (!confirm("តើអ្នកពិតជាចង់បោះបង់ការផ្សាយនេះមែនទេ?")) return;
    }
    resetForm();
  };

  const resetForm = () => {
    setIsExpanded(false);
    setContent("");
    setPostType("STATUS");
    setMediaFiles([]);
    setMediaPreviews([]);
    setShowTypeSelector(false);
    setShowVisibilitySelector(false);
  };

  const handleMediaSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Limit to 4 images
    const remainingSlots = 4 - mediaFiles.length;
    const filesToAdd = files.slice(0, remainingSlots);

    for (const file of filesToAdd) {
      if (!file.type.startsWith("image/")) continue;

      try {
        // Compress image
        const compressed = await compressImage(file, {
          maxWidth: 1920,
          maxHeight: 1920,
          quality: 0.85,
          outputFormat: "image/jpeg",
        });

        // Convert data URL to File
        const response = await fetch(compressed);
        const blob = await response.blob();
        const compressedFile = new File([blob], file.name, {
          type: "image/jpeg",
        });

        setMediaFiles((prev) => [...prev, compressedFile]);
        setMediaPreviews((prev) => [...prev, compressed]);
      } catch (error) {
        console.error("Error processing image:", error);
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles((prev) => prev.filter((_, i) => i !== index));
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePost = async () => {
    if (!content.trim() && mediaFiles.length === 0) {
      onError?.("សូមបញ្ចូលខ្លឹមសារឬរូបភាព");
      return;
    }

    setIsPosting(true);

    try {
      await createPost({
        content: content.trim(),
        postType,
        visibility,
        media: mediaFiles.length > 0 ? mediaFiles : undefined,
      });

      resetForm();
      onPostCreated?.();
    } catch (error: any) {
      console.error("Failed to create post:", error);
      onError?.(error.message || "មិនអាចបង្កើតការផ្សាយបានទេ");
    } finally {
      setIsPosting(false);
    }
  };

  const selectedType = POST_TYPE_INFO[postType];
  const selectedVisibility = VISIBILITY_OPTIONS.find(
    (v) => v.value === visibility
  );
  const VisibilityIcon = selectedVisibility?.icon || Globe;

  if (!isExpanded) {
    return (
      <button
        onClick={handleExpand}
        className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3 hover:shadow-md transition-shadow"
      >
        {userProfilePicture ? (
          <img
            src={userProfilePicture}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1 text-left">
          <p className="text-gray-500">តើអ្នកកំពុងគិតអ្វី {userName}?</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-green-50 rounded-full">
            <ImageIcon className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <h3 className="font-bold text-gray-900">បង្កើតការផ្សាយ</h3>
        <button
          onClick={handleCollapse}
          className="p-1.5 hover:bg-gray-100 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Author & Post Type */}
      <div className="px-4 py-3 flex items-center gap-3">
        {userProfilePicture ? (
          <img
            src={userProfilePicture}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="flex-1">
          <p className="font-bold text-gray-900">{userName}</p>
          <div className="flex items-center gap-2 mt-1">
            {/* Post Type Selector */}
            <div className="relative">
              <button
                onClick={() => setShowTypeSelector(!showTypeSelector)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${selectedType.color} text-white`}
              >
                {POST_TYPES.find((t) => t.type === postType)?.icon &&
                  (() => {
                    const Icon = POST_TYPES.find((t) => t.type === postType)
                      ?.icon!;
                    return <Icon className="w-3 h-3" />;
                  })()}
                {selectedType.labelKh}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showTypeSelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowTypeSelector(false)}
                  />
                  <div className="absolute left-0 top-8 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    {POST_TYPES.map(({ type, icon: Icon }) => (
                      <button
                        key={type}
                        onClick={() => {
                          setPostType(type);
                          setShowTypeSelector(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 ${
                          postType === type ? "bg-indigo-50 text-indigo-700" : ""
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{POST_TYPE_INFO[type].labelKh}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Visibility Selector */}
            <div className="relative">
              <button
                onClick={() => setShowVisibilitySelector(!showVisibilitySelector)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
              >
                <VisibilityIcon className="w-3 h-3" />
                {selectedVisibility?.labelKh}
                <ChevronDown className="w-3 h-3" />
              </button>

              {showVisibilitySelector && (
                <>
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setShowVisibilitySelector(false)}
                  />
                  <div className="absolute left-0 top-8 w-40 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                    {VISIBILITY_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setVisibility(option.value);
                          setShowVisibilitySelector(false);
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-gray-50 ${
                          visibility === option.value
                            ? "bg-indigo-50 text-indigo-700"
                            : ""
                        }`}
                      >
                        <option.icon className="w-4 h-4" />
                        <span>{option.labelKh}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            postType === "QUESTION"
              ? "សួរសំណួរ..."
              : postType === "ACHIEVEMENT"
                ? "ចែករំលែកសមិទ្ធផល..."
                : postType === "LEARNING_GOAL"
                  ? "កំណត់គោលដៅសិក្សា..."
                  : "តើអ្នកកំពុងគិតអ្វី?"
          }
          className="w-full min-h-[120px] resize-none border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-base"
          maxLength={2000}
        />
      </div>

      {/* Media Previews */}
      {mediaPreviews.length > 0 && (
        <div className="px-4 pb-3">
          <div
            className={`grid gap-2 ${
              mediaPreviews.length === 1
                ? "grid-cols-1"
                : mediaPreviews.length === 2
                  ? "grid-cols-2"
                  : "grid-cols-2"
            }`}
          >
            {mediaPreviews.map((preview, index) => (
              <div
                key={index}
                className={`relative rounded-xl overflow-hidden ${
                  mediaPreviews.length === 3 && index === 0 ? "col-span-2" : ""
                }`}
              >
                <img
                  src={preview}
                  alt={`Preview ${index + 1}`}
                  className="w-full h-32 object-cover"
                />
                <button
                  onClick={() => removeMedia(index)}
                  className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={mediaFiles.length >= 4}
            className="p-2.5 bg-green-50 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50"
          >
            <ImageIcon className="w-5 h-5 text-green-600" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleMediaSelect}
            className="hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">{content.length}/2000</span>
          <button
            onClick={handlePost}
            disabled={isPosting || (!content.trim() && mediaFiles.length === 0)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full font-medium hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>កំពុងផ្សាយ...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>ផ្សាយ</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CreatePost);
