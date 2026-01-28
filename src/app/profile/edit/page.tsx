"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Save, MapPin, Link as LinkIcon, Eye, Tag, Briefcase, Loader2, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateBio } from "@/lib/api/profile";
import { toast } from "react-hot-toast";
import MobileBottomNav from "@/components/layout/MobileBottomNav";

export default function EditProfilePage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    bio: "",
    headline: "",
    location: "",
    interests: [] as string[],
    socialLinks: {
      facebook: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
    profileVisibility: "PUBLIC",
  });

  const [interestsInput, setInterestsInput] = useState("");

  useEffect(() => {
    if (user) {
      setFormData({
        bio: user.bio || "",
        headline: user.headline || "",
        location: user.location || "",
        interests: user.interests || [],
        socialLinks: user.socialLinks || {
          facebook: "",
          linkedin: "",
          github: "",
          portfolio: "",
        },
        profileVisibility: user.profileVisibility || "PUBLIC",
      });
      setInterestsInput((user.interests || []).join(", "));
    }
  }, [user]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (saving) return;

    try {
      setSaving(true);

      // Parse interests from comma-separated string
      const interests = interestsInput
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean);

      await updateBio({
        bio: formData.bio || undefined,
        headline: formData.headline || undefined,
        location: formData.location || undefined,
        interests,
        socialLinks: formData.socialLinks,
        profileVisibility: formData.profileVisibility,
      });

      await refreshUser();
      toast.success("✨ Profile updated successfully!");
      router.back();
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-b from-gray-50 to-white">
      {/* Sticky Header */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm z-50"
      >
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            disabled={saving}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Back</span>
          </button>
          
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Edit Profile
          </h1>
          
          <button
            onClick={() => handleSubmit()}
            disabled={saving}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="hidden sm:inline">Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span className="hidden sm:inline">Save</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto px-4 py-8 space-y-6 pb-32"
        >
        {/* Headline Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Briefcase className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900">
                Headline
              </label>
              <p className="text-xs text-gray-500">Your professional title or role</p>
            </div>
          </div>
          <input
            type="text"
            value={formData.headline}
            onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="e.g., Grade 12 Student | STEM Enthusiast"
            maxLength={100}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              Appears below your name on your profile
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {formData.headline.length}/100
            </p>
          </div>
        </motion.div>

        {/* Bio Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900">
                About Me
              </label>
              <p className="text-xs text-gray-500">Tell others about yourself</p>
            </div>
          </div>
          <textarea
            rows={5}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none transition-all"
            placeholder="Write a brief bio about yourself, your interests, achievements, and goals..."
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-gray-400">
              Share your story with the community
            </p>
            <p className="text-xs text-gray-500 font-medium">
              {formData.bio.length}/500
            </p>
          </div>
        </motion.div>

        {/* Location Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <MapPin className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900">Location</label>
              <p className="text-xs text-gray-500">Where are you based?</p>
            </div>
          </div>
          <input
            type="text"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="e.g., Phnom Penh, Cambodia"
          />
        </motion.div>

        {/* Interests Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-pink-100 rounded-lg">
              <Tag className="w-5 h-5 text-pink-600" />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900">Interests</label>
              <p className="text-xs text-gray-500">What are you passionate about?</p>
            </div>
          </div>
          <input
            type="text"
            value={interestsInput}
            onChange={(e) => setInterestsInput(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="e.g., Programming, Mathematics, Reading, Music"
          />
          <p className="text-xs text-gray-400 mt-2">
            💡 Separate multiple interests with commas
          </p>
        </motion.div>

        {/* Social Links Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <LinkIcon className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900">Social Links</label>
              <p className="text-xs text-gray-500">Connect your social profiles</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Facebook */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Facebook
              </label>
              <input
                type="url"
                value={formData.socialLinks.facebook}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, facebook: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://facebook.com/username"
              />
            </div>

            {/* LinkedIn */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LinkedIn
              </label>
              <input
                type="url"
                value={formData.socialLinks.linkedin}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, linkedin: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            {/* GitHub */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GitHub
              </label>
              <input
                type="url"
                value={formData.socialLinks.github}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, github: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://github.com/username"
              />
            </div>

            {/* Portfolio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Portfolio Website
              </label>
              <input
                type="url"
                value={formData.socialLinks.portfolio}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, portfolio: e.target.value },
                  })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="https://yourwebsite.com"
              />
            </div>
          </div>
        </motion.div>

        {/* Privacy Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Eye className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <label className="block text-base font-bold text-gray-900">
                Profile Visibility
              </label>
              <p className="text-xs text-gray-500">Who can see your profile?</p>
            </div>
          </div>
          <select
            value={formData.profileVisibility}
            onChange={(e) =>
              setFormData({ ...formData, profileVisibility: e.target.value })
            }
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white"
          >
            <option value="PUBLIC">🌍 Public - Anyone can view your profile</option>
            <option value="SCHOOL">🏫 School - Only school members can view</option>
            <option value="CLASS">👥 Class - Only your classmates can view</option>
            <option value="PRIVATE">🔒 Private - Only you can view</option>
          </select>
        </motion.div>

        {/* Mobile Save Button (Floating) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="md:hidden"
        >
          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-3xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {saving ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save className="w-6 h-6" />
                Save Changes
              </>
            )}
          </button>
        </motion.div>
      </motion.form>
      </div>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
