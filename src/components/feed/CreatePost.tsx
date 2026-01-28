"use client";

import { useState, useRef, memo } from "react";
import Image from "next/image"; // ✅ ADDED: Next.js Image
import {
  Image as ImageIcon,
  X,
  Loader2,
  FileText,
  GraduationCap,
  Brain,
  HelpCircle,
  ClipboardCheck,
  Megaphone,
  BookOpen,
  BarChart3,
  FolderOpen,
  Send,
  ChevronDown,
  Globe,
  Users,
  Lock,
  User,
  Briefcase,
  Book,
  Microscope,
  Trophy,
  Lightbulb,
  Plus,
  Minus,
} from "lucide-react";
import {
  createPost,
  updatePost,
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
  editMode?: boolean;
  editPost?: {
    id: string;
    content: string;
    postType: PostType;
    visibility: PostVisibility;
    media?: string[];
    pollOptions?: Array<{ id: string; text: string }>;
  };
}

const POST_TYPES: {
  type: PostType;
  icon: React.ElementType;
  label: string;
  labelKh: string;
}[] = [
  { type: "ARTICLE", icon: FileText, label: "Article", labelKh: "អត្ថបទ" },
  {
    type: "COURSE",
    icon: GraduationCap,
    label: "Course",
    labelKh: "វគ្គសិក្សា",
  },
  { type: "QUIZ", icon: Brain, label: "Quiz", labelKh: "សំណួរក្លាយ" },
  { type: "QUESTION", icon: HelpCircle, label: "Question", labelKh: "សំណួរ" },
  { type: "EXAM", icon: ClipboardCheck, label: "Exam", labelKh: "ប្រឡង" },
  {
    type: "ANNOUNCEMENT",
    icon: Megaphone,
    label: "Announcement",
    labelKh: "ប្រកាស",
  },
  {
    type: "ASSIGNMENT",
    icon: BookOpen,
    label: "Assignment",
    labelKh: "កិច្ចការផ្ទះ",
  },
  { type: "POLL", icon: BarChart3, label: "Poll", labelKh: "មតិ" },
  { type: "RESOURCE", icon: FolderOpen, label: "Resource", labelKh: "ធនធាន" },
  { type: "PROJECT", icon: Briefcase, label: "Project", labelKh: "គម្រោង" },
  { type: "TUTORIAL", icon: Book, label: "Tutorial", labelKh: "មេរៀន" },
  {
    type: "RESEARCH",
    icon: Microscope,
    label: "Research",
    labelKh: "ការស្រាវជ្រាវ",
  },
  {
    type: "ACHIEVEMENT",
    icon: Trophy,
    label: "Achievement",
    labelKh: "សមិទ្ធិផល",
  },
  {
    type: "REFLECTION",
    icon: Lightbulb,
    label: "Reflection",
    labelKh: "ការពិចារណា",
  },
  {
    type: "COLLABORATION",
    icon: Users,
    label: "Collaboration",
    labelKh: "កិច្ចសហការ",
  },
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
  editMode = false,
  editPost,
}: CreatePostProps) {
  const [isExpanded, setIsExpanded] = useState(editMode); // Auto-expand if editing
  const [content, setContent] = useState(editPost?.content || "");
  const [postType, setPostType] = useState<PostType>(editPost?.postType || "ARTICLE");
  const [visibility, setVisibility] = useState<PostVisibility>(editPost?.visibility || "SCHOOL");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>(editPost?.media || []);
  const [isPosting, setIsPosting] = useState(false);
  const [showVisibilitySelector, setShowVisibilitySelector] = useState(false);

  // Poll-specific state
  const [pollOptions, setPollOptions] = useState<string[]>(
    editPost?.pollOptions?.map(opt => opt.text) || ["", ""]
  );
  const [pollDuration, setPollDuration] = useState<number>(7); // days

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleExpand = () => {
    setIsExpanded(true);
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  const handleCollapse = () => {
    if (editMode) {
      // In edit mode, just close the modal
      onPostCreated?.(); // This will close the modal
      return;
    }
    
    if (content.trim() || mediaFiles.length > 0) {
      if (!confirm("តើអ្នកពិតជាចង់បោះបង់ការផ្សាយនេះមែនទេ?")) return;
    }
    resetForm();
  };

  const resetForm = () => {
    setIsExpanded(false);
    setContent("");
    setPostType("ARTICLE");
    setMediaFiles([]);
    setMediaPreviews([]);
    setShowVisibilitySelector(false);
    setPollOptions(["", ""]);
    setPollDuration(7);
  };

  // Poll option handlers
  const addPollOption = () => {
    if (pollOptions.length < 6) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
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
    // Validation
    if (!content.trim() && mediaFiles.length === 0 && mediaPreviews.length === 0) {
      onError?.("សូមបញ្ចូលខ្លឹមសារឬរូបភាព");
      return;
    }

    // Poll validation
    if (postType === "POLL") {
      const validOptions = pollOptions.filter((opt) => opt.trim());
      if (validOptions.length < 2) {
        onError?.("សូមបញ្ចូលជម្រើសយ៉ាងតិច ២");
        return;
      }
    }

    setIsPosting(true);

    try {
      if (editMode && editPost) {
        // Update existing post
        await updatePost(editPost.id, {
          content: content.trim(),
          visibility,
        });
      } else {
        // Create new post
        const postData: any = {
          content: content.trim(),
          postType,
          visibility,
          media: mediaFiles.length > 0 ? mediaFiles : undefined,
        };

        // Add poll options if POLL type
        if (postType === "POLL") {
          postData.pollOptions = pollOptions.filter((opt) => opt.trim());
        }

        await createPost(postData);
      }

      resetForm();
      onPostCreated?.();
    } catch (error: any) {
      console.error("Failed to save post:", error);
      onError?.(error.message || "មិនអាចរក្សាទុកការផ្សាយបានទេ");
    } finally {
      setIsPosting(false);
    }
  };

  const selectedType = POST_TYPE_INFO[postType];
  const selectedVisibility = VISIBILITY_OPTIONS.find(
    (v) => v.value === visibility,
  );
  const VisibilityIcon = selectedVisibility?.icon || Globe;

  if (!isExpanded) {
    return (
      <button
        onClick={handleExpand}
        className="w-full bg-white rounded-2xl shadow-card hover:shadow-card-hover p-4 flex items-center gap-3 transition-all duration-300"
      >
        {/* Avatar with gradient border */}
        <div className="relative p-[2px] bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all flex-shrink-0">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-white">
            {userProfilePicture ? (
              <Image
                src={userProfilePicture}
                alt={userName}
                width={40}
                height={40}
                className="w-full h-full object-cover"
                unoptimized // ✅ Skip optimization for R2 URLs
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 text-left">
          <p className="text-gray-400 font-medium">
            តើអ្នកកំពុងគិតអ្វី <span className="text-gray-600">{userName}</span>
            ?
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="p-2.5 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-colors">
            <ImageIcon className="w-5 h-5 text-green-600" />
          </div>
        </div>
      </button>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card overflow-hidden animate-fade-in">
      {/* Beautiful Header with gradient */}
      <div className="relative px-4 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-pink-50">
        <div className="flex items-center justify-between">
          <h4 className="font-bold font-koulen text-gray-900 text-lg">
            {editMode ? "កែសម្រួលការផ្សាយ" : "បង្កើតការផ្សាយ"}
          </h4>
          <button
            onClick={handleCollapse}
            className="p-2 hover:bg-white/80 rounded-full transition-all"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Author with gradient avatar */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="relative p-[2px] bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 rounded-full flex-shrink-0">
          <div className="w-11 h-11 rounded-full overflow-hidden bg-white">
            {userProfilePicture ? (
              <img
                src={userProfilePicture}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-gray-900">{userName}</p>
        </div>
      </div>

      {/* Post Type Selector - Modern cards with proper spacing */}
      <div className="px-4 pb-4 bg-gradient-to-b from-gray-50/50 to-transparent">
        <p className="text-sm font-semibold text-gray-700 mb-3">
          Select post type:
        </p>
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 px-1 -mx-1 hide-scrollbar">
          {POST_TYPES.map(({ type, icon: Icon, labelKh }) => {
            const typeInfo = POST_TYPE_INFO[type];
            const isSelected = postType === type;
            return (
              <button
                key={type}
                onClick={() => setPostType(type)}
                className={`flex flex-col items-center gap-2 px-4 py-3 rounded-2xl flex-shrink-0 transition-all duration-300 ${
                  isSelected
                    ? "shadow-lg scale-105 ring-2"
                    : "hover:bg-gray-50 hover:shadow-md hover:scale-102 bg-white border border-gray-100"
                }`}
                style={{
                  backgroundColor: isSelected
                    ? `${typeInfo.color}15`
                    : undefined,
                  ringColor: isSelected ? typeInfo.color : undefined,
                  borderColor: isSelected ? typeInfo.color : undefined,
                }}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                    isSelected ? "shadow-md" : ""
                  }`}
                  style={{
                    backgroundColor: typeInfo.color,
                  }}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span
                  className="text-xs font-semibold whitespace-nowrap"
                  style={{ color: isSelected ? typeInfo.color : "#6b7280" }}
                >
                  {labelKh}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Type Badge & Visibility */}
      <div className="px-4 pt-2 pb-3 flex items-center gap-3">
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white shadow-md"
          style={{ backgroundColor: selectedType.color }}
        >
          {POST_TYPES.find((t) => t.type === postType)?.icon &&
            (() => {
              const Icon = POST_TYPES.find((t) => t.type === postType)?.icon!;
              return <Icon className="w-4 h-4" />;
            })()}
          {selectedType.labelKh}
        </div>

        {/* Visibility Selector - Modern */}
        <div className="relative">
          <button
            onClick={() => setShowVisibilitySelector(!showVisibilitySelector)}
            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
          >
            <VisibilityIcon className="w-4 h-4" />
            {selectedVisibility?.labelKh}
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showVisibilitySelector && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowVisibilitySelector(false)}
              />
              <div className="absolute left-0 top-12 w-44 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 animate-fade-in">
                {VISIBILITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setVisibility(option.value);
                      setShowVisibilitySelector(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors ${
                      visibility === option.value
                        ? "bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700"
                        : "text-gray-700 hover:bg-gray-50"
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

      {/* Content - Beautiful textarea */}
      <div className="px-4 py-2">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={
            postType === "QUESTION"
              ? "សួរសំណួរ..."
              : postType === "ACHIEVEMENT"
                ? "ចែករំលែកសមិទ្ធផល..."
                : postType === "POLL"
                  ? "សួរសំណួរមតិ..."
                  : "តើអ្នកកំពុងគិតអ្វី?"
          }
          className="w-full min-h-[140px] resize-none border-0 focus:ring-0 text-gray-900 placeholder-gray-400 text-base p-3 bg-gray-50 rounded-xl"
          maxLength={2000}
        />
      </div>

      {/* Poll Options - Show only when POLL type is selected */}
      {postType === "POLL" && (
        <div className="px-4 pb-3 space-y-3">
          <div className="flex items-center justify-between mb-2 bg-gradient-to-r from-indigo-50 to-purple-50 px-3 py-2 rounded-xl">
            <p className="text-sm font-semibold text-gray-700">ជម្រើសមតិ:</p>
            <span className="text-xs font-medium text-indigo-600 bg-white px-2 py-1 rounded-full">
              {pollOptions.length}/6
            </span>
          </div>

          {pollOptions.map((option, index) => (
            <div key={index} className="flex items-center gap-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updatePollOption(index, e.target.value)}
                  placeholder={`ជម្រើសទី ${index + 1}`}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium transition-all"
                  maxLength={100}
                />
              </div>
              {pollOptions.length > 2 && (
                <button
                  onClick={() => removePollOption(index)}
                  className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                  type="button"
                >
                  <Minus className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}

          {pollOptions.length < 6 && (
            <button
              onClick={addPollOption}
              className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all border-2 border-dashed border-indigo-200 hover:border-indigo-300 w-full justify-center"
              type="button"
            >
              <Plus className="w-4 h-4" />
              បន្ថែមជម្រើស
            </button>
          )}
        </div>
      )}

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

      {/* Actions - Beautiful footer */}
      <div className="px-4 py-4 bg-gradient-to-t from-gray-50/50 to-transparent flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={mediaFiles.length >= 4}
            className="p-3 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
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

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-gray-400 bg-gray-100 px-3 py-1.5 rounded-full">
            {content.length}/2000
          </span>
          <button
            onClick={handlePost}
            disabled={isPosting || (!content.trim() && mediaFiles.length === 0 && mediaPreviews.length === 0)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {isPosting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{editMode ? "កំពុងរក្សាទុក..." : "កំពុងផ្សាយ..."}</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>{editMode ? "រក្សាទុក" : "ផ្សាយ"}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(CreatePost);
