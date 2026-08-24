"use client";

import { useState } from "react";
import { ParentProfile } from "@/lib/api/parent-portal";
import {
  User,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Key,
  Users,
  LogOut,
  Edit,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useVividTheme } from "@/lib/theme";
import VividThemeSelector from "@/components/theme/VividThemeSelector";

interface ParentProfileTabProps {
  profile: ParentProfile | null;
  onRefresh: () => Promise<void>;
  onChangePassword: () => void;
}

export default function ParentProfileTab({
  profile,
  onRefresh,
  onChangePassword,
}: ParentProfileTabProps) {
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const { currentTheme } = useVividTheme();

  if (!profile) {
    return (
      <div className="bg-white rounded-3xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600 font-medium">កំពុងផ្ទុកព័ត៌មាន...</p>
      </div>
    );
  }

  const parentInfo = profile.parentInfo;

  const getRelationshipText = (relationship: string) => {
    switch (relationship) {
      case "FATHER":
        return "ឪពុក";
      case "MOTHER":
        return "ម្តាយ";
      case "GUARDIAN":
        return "អាណាព្យាបាល";
      case "STEP_FATHER":
        return "ឪពុកចុង";
      case "STEP_MOTHER":
        return "ម្តាយចុង";
      case "GRANDPARENT":
        return "ជីតា/យាយ";
      case "OTHER":
        return "ផ្សេងៗ";
      default:
        return relationship;
    }
  };

  return (
    <div className="space-y-4 pb-6">
      {/* Vivid Header Card */}
      <div className="bg-white rounded-3xl overflow-hidden border border-gray-200 shadow-lg">
        {/* Cover/Banner */}
        <div className={`relative h-28 bg-gradient-to-br ${currentTheme.heroGradient} transition-all duration-500`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 right-0 w-36 h-36 bg-white rounded-full -translate-y-16 translate-x-16"></div>
            <div className="absolute bottom-0 left-0 w-28 h-28 bg-white rounded-full translate-y-12 -translate-x-12"></div>
          </div>
          {/* Parent ID Badge */}
          {parentInfo.parentId && (
            <div className="absolute top-3 right-3">
              <div className="px-3 py-1 rounded-full flex items-center gap-1.5 bg-white/90 backdrop-blur-sm shadow-sm">
                <span className="text-gray-800 text-xs font-bold">
                  ID: {parentInfo.parentId}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profile Info Section */}
        <div className="px-5 pb-5">
          {/* Avatar */}
          <div className="flex flex-col items-center -mt-14 mb-3">
            <div className="relative mb-3">
              <div className={`w-28 h-28 bg-gradient-to-br ${currentTheme.avatarRing} rounded-full p-1 shadow-xl transition-all duration-500`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  <User className={`w-14 h-14 ${currentTheme.textColor}`} />
                </div>
              </div>
            </div>

            {/* Name & Role */}
            <div className="text-center">
              <h1 className="text-xl font-black text-gray-900 mb-0.5">
                {parentInfo.khmerName}
              </h1>
              {parentInfo.englishName && (
                <p className="text-sm text-gray-600 mb-2">
                  {parentInfo.englishName}
                </p>
              )}
              <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${currentTheme.accentBg} border ${currentTheme.accentBorder} px-3.5 py-1.5 rounded-full shadow-sm`}>
                <Users className={`w-3.5 h-3.5 ${currentTheme.textColor}`} />
                <span className={`text-xs font-bold ${currentTheme.badgeText}`}>
                  {getRelationshipText(parentInfo.relationship)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vivid Theme Selector */}
      <VividThemeSelector />

      {/* Profile Details Information */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-black text-gray-800 flex items-center gap-2">
            <User className={`w-5 h-5 ${currentTheme.textColor}`} />
            <span>ព័ត៌មានលម្អិត • Personal Info</span>
          </h2>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3.5">
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentTheme.accentBg} border ${currentTheme.accentBorder}`}>
              <Phone className={`w-4 h-4 ${currentTheme.textColor}`} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-gray-500 font-medium">លេខទូរសព្ទ • Phone</p>
              <p className="text-sm font-bold text-gray-900">{parentInfo.phone || "—"}</p>
            </div>
          </div>

          {parentInfo.email && (
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentTheme.accentBg} border ${currentTheme.accentBorder}`}>
                <Mail className={`w-4 h-4 ${currentTheme.textColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">អ៊ីមែល • Email</p>
                <p className="text-sm font-bold text-gray-900">{parentInfo.email}</p>
              </div>
            </div>
          )}

          {parentInfo.address && (
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentTheme.accentBg} border ${currentTheme.accentBorder}`}>
                <MapPin className={`w-4 h-4 ${currentTheme.textColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">អាសយដ្ឋាន • Address</p>
                <p className="text-sm font-bold text-gray-900">{parentInfo.address}</p>
              </div>
            </div>
          )}

          {parentInfo.occupation && (
            <div className="flex items-start gap-3">
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${currentTheme.accentBg} border ${currentTheme.accentBorder}`}>
                <Briefcase className={`w-4 h-4 ${currentTheme.textColor}`} />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-medium">មុខរបរ • Occupation</p>
                <p className="text-sm font-bold text-gray-900">{parentInfo.occupation}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Linked Children */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200 shadow-sm">
        <h3 className="text-base font-black text-gray-800 mb-3 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          <span>កូនដែលបានភ្ជាប់ • Children</span>
        </h3>
        {profile.children.length === 0 ? (
          <p className="text-center text-gray-500 py-4 text-xs">មិនមានកូនបានភ្ជាប់</p>
        ) : (
          <div className="space-y-2.5">
            {profile.children.map((child) => (
              <div
                key={child.id}
                className="p-3.5 bg-gray-50/80 border border-gray-100 rounded-2xl hover:bg-gray-100/80 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">
                      {child.khmerName}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 font-medium">
                      {child.class?.name || "មិនមានថ្នាក់"} • {getRelationshipText(child.relationship)}
                    </p>
                    <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                      ID: {child.studentId}
                    </p>
                  </div>
                  {child.isPrimary && (
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[10px] font-bold rounded-full">
                      Primary
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="space-y-2.5 pt-2">
        <button
          onClick={onChangePassword}
          className={`w-full py-3.5 bg-gradient-to-r ${currentTheme.buttonGradient} text-white rounded-2xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2 active:scale-98 shadow-md`}
        >
          <Key className="w-5 h-5" />
          <span>ប្តូរពាក្យសម្ងាត់</span>
        </button>

        <button
          onClick={logout}
          className="w-full py-3.5 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 rounded-2xl font-bold transition-colors flex items-center justify-center gap-2 active:scale-98"
        >
          <LogOut className="w-5 h-5" />
          <span>ចាកចេញ</span>
        </button>
      </div>
    </div>
  );
}
