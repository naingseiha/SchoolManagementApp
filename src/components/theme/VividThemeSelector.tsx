"use client";

import React, { memo } from "react";
import { Sparkles, Check, Palette } from "lucide-react";
import { useVividTheme, VividThemeId, VIVID_THEMES } from "@/lib/theme";

interface VividThemeSelectorProps {
  className?: string;
  compact?: boolean;
}

export const VividThemeSelector: React.FC<VividThemeSelectorProps> = memo(
  ({ className = "", compact = false }) => {
    const { themeId, changeTheme, allThemes, currentTheme } = useVividTheme();

    return (
      <div
        className={`bg-white rounded-3xl p-5 shadow-lg border border-gray-100 transition-all ${className}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl bg-gradient-to-br ${currentTheme.gradient} shadow-md text-white flex items-center justify-center transition-all duration-500`}
            >
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-base font-black text-gray-900 flex items-center gap-1.5">
                <span>រូបរាងរស់រវើក • Vivid Theme</span>
                <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" />
              </h4>
              <p className="text-xs text-gray-500 font-medium">
                ជ្រើសរើសស្ទីលពណ៌ និង Gradient សម្រាប់ Profile របស់អ្នក
              </p>
            </div>
          </div>
        </div>

        {/* Theme Grid */}
        <div
          className={`grid ${
            compact
              ? "grid-cols-3 gap-2"
              : "grid-cols-2 sm:grid-cols-3 gap-2.5"
          }`}
        >
          {allThemes.map((theme) => {
            const isSelected = themeId === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                type="button"
                className={`relative group p-3 rounded-2xl border-2 transition-all duration-300 flex flex-col items-center text-center active:scale-95 ${
                  isSelected
                    ? `border-indigo-600 bg-gradient-to-b ${theme.accentBg} shadow-md scale-[1.02]`
                    : "border-gray-100 bg-gray-50/70 hover:bg-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Gradient Preview Swatch */}
                <div
                  className={`w-full h-10 rounded-xl ${theme.previewBg} shadow-sm mb-2 flex items-center justify-center relative overflow-hidden transition-transform duration-300 group-hover:scale-105`}
                >
                  <span className="text-base drop-shadow">{theme.icon}</span>
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/15 flex items-center justify-center">
                      <div className="w-5 h-5 rounded-full bg-white text-gray-900 flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Name */}
                <p className="text-xs font-black text-gray-900 leading-tight mb-0.5">
                  {theme.nameKh}
                </p>
                <p className="text-[10px] text-gray-500 font-medium">
                  {theme.nameEn}
                </p>
              </button>
            );
          })}
        </div>

        {/* Live Active Theme Indicator */}
        <div
          className={`mt-4 px-3.5 py-2.5 rounded-2xl bg-gradient-to-r ${currentTheme.accentBg} border ${currentTheme.accentBorder} flex items-center justify-between text-xs font-semibold`}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{currentTheme.icon}</span>
            <span className="text-gray-800">
              កំពុងប្រើ៖ <span className="font-bold">{currentTheme.nameKh}</span>
            </span>
          </div>
          <span className="text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded-full">
            រក្សាទុកស្វ័យប្រវត្តិ
          </span>
        </div>
      </div>
    );
  },
);

VividThemeSelector.displayName = "VividThemeSelector";

export default VividThemeSelector;
