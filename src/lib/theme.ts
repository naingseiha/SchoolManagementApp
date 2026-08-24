"use client";

import { useState, useEffect, useCallback } from "react";

export type VividThemeId =
  | "aurora"   // Electric Indigo -> Purple -> Pink (Default)
  | "sunset"   // Radiant Rose -> Coral -> Amber
  | "ocean"    // Cyan -> Azure Blue -> Indigo
  | "emerald"  // Emerald Green -> Teal -> Mint
  | "midnight" // Deep Violet -> Fuchsia -> Magenta
  | "cosmic";  // Hot Pink -> Rose -> Gold

export interface VividTheme {
  id: VividThemeId;
  nameKh: string;
  nameEn: string;
  icon: string;
  gradient: string;
  heroGradient: string;
  glowColor: string;
  primaryColor: string;
  textColor: string;
  accentBg: string;
  accentBorder: string;
  buttonGradient: string;
  statCardBg: string;
  badgeBg: string;
  badgeText: string;
  avatarRing: string;
  previewBg: string;
  headerAccent: string;
}

export const VIVID_THEMES: Record<VividThemeId, VividTheme> = {
  aurora: {
    id: "aurora",
    nameKh: "ឥន្ទធនូ រស្មី (Aurora)",
    nameEn: "Vivid Aurora",
    icon: "✨",
    gradient: "from-indigo-600 via-purple-600 to-pink-600",
    heroGradient: "from-indigo-600 via-purple-600 to-pink-600",
    glowColor: "from-yellow-400 to-pink-400",
    primaryColor: "indigo-600",
    textColor: "text-indigo-600",
    accentBg: "from-indigo-50 to-purple-50",
    accentBorder: "border-indigo-200",
    buttonGradient: "from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:to-pink-700",
    statCardBg: "from-indigo-500 to-purple-600",
    badgeBg: "bg-indigo-50 border-indigo-200",
    badgeText: "text-indigo-700",
    avatarRing: "from-indigo-500 via-purple-500 to-pink-500",
    previewBg: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
    headerAccent: "bg-gradient-to-r from-indigo-500 to-purple-600",
  },
  sunset: {
    id: "sunset",
    nameKh: "ថ្ងៃរៀបលិច (Sunset)",
    nameEn: "Vivid Sunset",
    icon: "🌅",
    gradient: "from-rose-500 via-orange-500 to-amber-500",
    heroGradient: "from-rose-600 via-orange-600 to-amber-600",
    glowColor: "from-orange-400 to-rose-400",
    primaryColor: "rose-600",
    textColor: "text-rose-600",
    accentBg: "from-rose-50 to-orange-50",
    accentBorder: "border-rose-200",
    buttonGradient: "from-rose-600 via-orange-500 to-amber-500 hover:from-rose-700 hover:to-amber-600",
    statCardBg: "from-rose-500 to-orange-600",
    badgeBg: "bg-rose-50 border-rose-200",
    badgeText: "text-rose-700",
    avatarRing: "from-rose-500 via-orange-500 to-amber-500",
    previewBg: "bg-gradient-to-r from-rose-500 via-orange-500 to-amber-500",
    headerAccent: "bg-gradient-to-r from-rose-500 to-amber-600",
  },
  ocean: {
    id: "ocean",
    nameKh: "មហាសមុទ្រ (Ocean)",
    nameEn: "Vivid Ocean",
    icon: "🌊",
    gradient: "from-cyan-500 via-blue-600 to-indigo-600",
    heroGradient: "from-cyan-600 via-blue-600 to-indigo-700",
    glowColor: "from-cyan-300 to-blue-400",
    primaryColor: "blue-600",
    textColor: "text-blue-600",
    accentBg: "from-cyan-50 to-blue-50",
    accentBorder: "border-blue-200",
    buttonGradient: "from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-700 hover:to-indigo-700",
    statCardBg: "from-cyan-500 to-blue-600",
    badgeBg: "bg-cyan-50 border-cyan-200",
    badgeText: "text-blue-700",
    avatarRing: "from-cyan-400 via-blue-500 to-indigo-600",
    previewBg: "bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600",
    headerAccent: "bg-gradient-to-r from-cyan-500 to-blue-600",
  },
  emerald: {
    id: "emerald",
    nameKh: "ត្បូងមរកត (Emerald)",
    nameEn: "Vivid Emerald",
    icon: "🌿",
    gradient: "from-emerald-500 via-teal-600 to-cyan-600",
    heroGradient: "from-emerald-600 via-teal-600 to-cyan-700",
    glowColor: "from-emerald-300 to-teal-400",
    primaryColor: "emerald-600",
    textColor: "text-emerald-600",
    accentBg: "from-emerald-50 to-teal-50",
    accentBorder: "border-emerald-200",
    buttonGradient: "from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700",
    statCardBg: "from-emerald-500 to-teal-600",
    badgeBg: "bg-emerald-50 border-emerald-200",
    badgeText: "text-emerald-700",
    avatarRing: "from-emerald-400 via-teal-500 to-cyan-500",
    previewBg: "bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600",
    headerAccent: "bg-gradient-to-r from-emerald-500 to-teal-600",
  },
  midnight: {
    id: "midnight",
    nameKh: "រាត្រីរស្មី (Midnight)",
    nameEn: "Vivid Midnight",
    icon: "🌌",
    gradient: "from-violet-600 via-purple-700 to-fuchsia-600",
    heroGradient: "from-violet-700 via-purple-800 to-fuchsia-700",
    glowColor: "from-fuchsia-400 to-violet-400",
    primaryColor: "purple-600",
    textColor: "text-purple-600",
    accentBg: "from-purple-50 to-fuchsia-50",
    accentBorder: "border-purple-200",
    buttonGradient: "from-violet-600 via-purple-700 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700",
    statCardBg: "from-violet-500 to-fuchsia-600",
    badgeBg: "bg-purple-50 border-purple-200",
    badgeText: "text-purple-700",
    avatarRing: "from-violet-500 via-purple-500 to-fuchsia-500",
    previewBg: "bg-gradient-to-r from-violet-600 via-purple-700 to-fuchsia-600",
    headerAccent: "bg-gradient-to-r from-violet-600 to-fuchsia-600",
  },
  cosmic: {
    id: "cosmic",
    nameKh: "ចក្រវាល (Cosmic)",
    nameEn: "Vivid Cosmic",
    icon: "⚡",
    gradient: "from-pink-600 via-rose-600 to-yellow-500",
    heroGradient: "from-pink-600 via-rose-600 to-yellow-500",
    glowColor: "from-pink-400 to-yellow-400",
    primaryColor: "pink-600",
    textColor: "text-pink-600",
    accentBg: "from-pink-50 to-yellow-50",
    accentBorder: "border-pink-200",
    buttonGradient: "from-pink-600 via-rose-600 to-yellow-500 hover:from-pink-700 hover:to-yellow-600",
    statCardBg: "from-pink-500 to-rose-600",
    badgeBg: "bg-pink-50 border-pink-200",
    badgeText: "text-pink-700",
    avatarRing: "from-pink-500 via-rose-500 to-yellow-400",
    previewBg: "bg-gradient-to-r from-pink-600 via-rose-600 to-yellow-500",
    headerAccent: "bg-gradient-to-r from-pink-500 to-rose-600",
  },
};

export const DEFAULT_VIVID_THEME_ID: VividThemeId = "aurora";
const THEME_STORAGE_KEY = "app_vivid_theme_id";

export function useVividTheme() {
  const [themeId, setThemeId] = useState<VividThemeId>(DEFAULT_VIVID_THEME_ID);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as VividThemeId | null;
      if (saved && VIVID_THEMES[saved]) {
        setThemeId(saved);
      }
    } catch {
      // Ignore localStorage errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const changeTheme = useCallback((newThemeId: VividThemeId) => {
    if (!VIVID_THEMES[newThemeId]) return;
    setThemeId(newThemeId);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newThemeId);
      // Dispatch custom event so other components on page sync immediately
      window.dispatchEvent(
        new CustomEvent("vivid_theme_changed", { detail: { themeId: newThemeId } })
      );
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Listen for external theme changes
  useEffect(() => {
    const handleThemeEvent = (event: any) => {
      const newId = event.detail?.themeId;
      if (newId && VIVID_THEMES[newId as VividThemeId]) {
        setThemeId(newId);
      }
    };

    window.addEventListener("vivid_theme_changed", handleThemeEvent);
    return () => window.removeEventListener("vivid_theme_changed", handleThemeEvent);
  }, []);

  const currentTheme = VIVID_THEMES[themeId] || VIVID_THEMES[DEFAULT_VIVID_THEME_ID];

  return {
    themeId,
    currentTheme,
    changeTheme,
    isLoaded,
    allThemes: Object.values(VIVID_THEMES),
  };
}
