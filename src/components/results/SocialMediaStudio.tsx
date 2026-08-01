"use client";

import React, { useState, useRef, useEffect } from "react";
import { ArrowLeft, Download, Trophy, Star, Medal, Users, Award, Crown } from "lucide-react";
import * as htmlToImage from "html-to-image";
import { reportsApi, MonthlyReportData } from "@/lib/api/reports";

const GRADES = ["7", "8", "9", "10", "11", "12"];

interface SocialMediaStudioProps {
  onBack: () => void;
  selectedMonth: string;
  selectedYear: number;
}

export default function SocialMediaStudio({
  onBack,
  selectedMonth,
  selectedYear,
}: SocialMediaStudioProps) {
  const [gradeData, setGradeData] = useState<Record<string, MonthlyReportData>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  
  const studioRef = useRef<HTMLDivElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  // Load data for all grades
  useEffect(() => {
    const loadAllGrades = async () => {
      setIsLoading(true);
      try {
        const promises = GRADES.map((grade) =>
          reportsApi.getGradeWideReport(grade, selectedMonth, selectedYear)
        );
        const results = await Promise.all(promises);
        
        const newData: Record<string, MonthlyReportData> = {};
        GRADES.forEach((grade, index) => {
          newData[grade] = results[index];
        });
        
        setGradeData(newData);
      } catch (error) {
        console.error("Error loading grade data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllGrades();
  }, [selectedMonth, selectedYear]);

  // Handle responsive scaling for the fixed 1920x1080 container
  useEffect(() => {
    const handleResize = () => {
      if (previewContainerRef.current) {
        const containerWidth = previewContainerRef.current.clientWidth;
        // The fixed width of our studio is 1920
        const newScale = Math.min(1, (containerWidth - 40) / 1920);
        setScale(newScale);
      }
    };
    
    window.addEventListener("resize", handleResize);
    handleResize(); // Initial call
    
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleExport = async () => {
    if (!studioRef.current) return;
    
    setIsExporting(true);
    try {
      // Temporarily reset transform for perfect export
      const originalTransform = studioRef.current.style.transform;
      studioRef.current.style.transform = "none";
      
      const dataUrl = await htmlToImage.toPng(studioRef.current, {
        quality: 1.0,
        pixelRatio: 2, // High resolution for social media
        backgroundColor: '#0F172A',
        width: 1920,
        height: 1080,
        style: {
          transform: "none",
        }
      });
      
      studioRef.current.style.transform = originalTransform;
      
      const link = document.createElement("a");
      link.download = `កិត្តិយស_កម្រិតរួម_${selectedMonth}_${selectedYear}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting image:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const getTopStudent = (grade: string) => {
    const data = gradeData[grade];
    if (!data || !data.students || data.students.length === 0) return null;
    
    // Ensure we get the actual Rank 1 (highest average)
    const sorted = [...data.students].sort((a, b) => parseFloat(b.average) - parseFloat(a.average));
    return sorted[0];
  };

  const getGradeIcon = (grade: string) => {
    const numGrade = parseInt(grade);
    if (numGrade >= 11) return <Crown className="w-8 h-8 text-yellow-400" />;
    if (numGrade >= 9) return <Trophy className="w-8 h-8 text-blue-400" />;
    return <Star className="w-8 h-8 text-emerald-400" />;
  };

  return (
    <div className="flex flex-col min-h-0 h-full bg-slate-50">
      {/* Header Toolbar */}
      <div className="flex items-center justify-between p-6 bg-white border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-black text-gray-900" style={{ fontFamily: "Khmer OS Muol Light" }}>
              Social Media Studio
            </h1>
            <p className="text-sm text-gray-500 font-medium font-khmer-body">
              កម្រិតរួម (ថ្នាក់ទី ៧ ដល់ ១២) • {selectedMonth} {selectedYear}
            </p>
          </div>
        </div>
        
        <button
          onClick={handleExport}
          disabled={isLoading || isExporting}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all font-bold disabled:opacity-50 font-khmer-body"
        >
          {isExporting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Download className="w-5 h-5" />
          )}
          <span>នាំចេញរូបភាព (Export)</span>
        </button>
      </div>

      {/* Preview Area */}
      <div 
        ref={previewContainerRef}
        className="flex-1 overflow-auto bg-slate-200 flex items-center justify-center p-8"
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-indigo-600 font-bold font-khmer-body">កំពុងទាញយកទិន្នន័យកម្រិតទាំងអស់...</p>
          </div>
        ) : (
          <div 
            style={{ 
              width: 1920, 
              height: 1080, 
              transform: `scale(${scale})`, 
              transformOrigin: 'center center',
              transition: 'transform 0.2s ease-out'
            }}
            className="shadow-2xl flex-shrink-0"
          >
            {/* The Actual 1920x1080 Template - Premium Dark Theme */}
            <div 
              ref={studioRef}
              className="w-[1920px] h-[1080px] bg-slate-900 relative overflow-hidden font-sans"
            >
              {/* Vibrant Abstract Gradients */}
              <div className="absolute top-0 left-0 w-full h-full opacity-40">
                <div className="absolute top-[-30%] left-[-10%] w-[60%] h-[70%] bg-blue-600 rounded-full blur-[180px] mix-blend-screen" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[80%] bg-indigo-700 rounded-full blur-[180px] mix-blend-screen" />
                <div className="absolute top-[30%] right-[30%] w-[40%] h-[50%] bg-purple-500 rounded-full blur-[180px] mix-blend-screen" />
              </div>
              
              {/* Grid Overlay */}
              <div 
                className="absolute inset-0 opacity-[0.03]" 
                style={{ 
                  backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                  backgroundSize: '60px 60px' 
                }} 
              />

              {/* Content Container */}
              <div className="relative z-10 w-full h-full flex flex-col p-16">
                
                {/* Header */}
                <div className="flex justify-between items-end mb-16">
                  <div>
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-white/5 backdrop-blur-md rounded-full mb-6 border border-white/10">
                      <Medal className="w-6 h-6 text-yellow-400" />
                      <span className="text-white text-xl font-bold tracking-widest uppercase">Honors Board</span>
                    </div>
                    <h1 
                      className="text-[5.5rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-indigo-200 leading-tight mb-4 drop-shadow-lg"
                      style={{ fontFamily: "Khmer OS Muol Light" }}
                    >
                      សិស្សឆ្នើមប្រចាំកម្រិត
                    </h1>
                    <p className="text-3xl text-blue-200/80 font-medium tracking-wide font-khmer-body">
                      លទ្ធផលប្រចាំខែ {selectedMonth} ឆ្នាំសិក្សា {selectedYear}-{selectedYear + 1}
                    </p>
                  </div>
                  
                  <div className="text-right flex flex-col items-end">
                    <div className="w-32 h-32 bg-white/5 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shadow-[0_0_40px_rgba(79,70,229,0.3)] mb-6">
                      <Award className="w-16 h-16 text-yellow-400" />
                    </div>
                    <p className="text-3xl font-bold text-white tracking-widest" style={{ fontFamily: "Khmer OS Muol Light" }}>
                      វិទ្យាល័យ ហ៊ុន សែនស្វាយធំ
                    </p>
                  </div>
                </div>

                {/* Grade Cards Grid (2 rows x 3 cols) */}
                <div className="grid grid-cols-3 gap-10 flex-1">
                  {GRADES.map((grade) => {
                    const topStudent = getTopStudent(grade);
                    return (
                      <div 
                        key={grade} 
                        className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10 flex flex-col justify-between overflow-hidden shadow-2xl"
                      >
                        {/* Inner subtle glow */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                        
                        <div className="relative z-10">
                          <div className="flex justify-between items-start mb-10">
                            <div className="bg-white/10 p-5 rounded-2xl border border-white/10 shadow-inner">
                              {getGradeIcon(grade)}
                            </div>
                            <div className="px-6 py-2.5 bg-gradient-to-r from-blue-600/60 to-indigo-600/60 rounded-full border border-white/10 backdrop-blur-md shadow-lg">
                              <span className="text-2xl font-bold text-white tracking-wide" style={{ fontFamily: "Khmer OS Muol Light" }}>
                                ថ្នាក់ទី {grade}
                              </span>
                            </div>
                          </div>
                          
                          {topStudent ? (
                            <div className="mt-4">
                              <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-lg mb-6 shadow-sm">
                                <span className="text-yellow-400 font-bold text-lg uppercase tracking-wider">Rank #1</span>
                              </div>
                              <h3 
                                className="text-[2.75rem] font-black text-white mb-6 leading-normal drop-shadow-md"
                                style={{ fontFamily: "Khmer OS Muol Light" }}
                              >
                                {topStudent.studentName}
                              </h3>
                              <div className="flex items-center gap-3">
                                <span className="text-2xl text-blue-200/70 font-khmer-body">ថ្នាក់៖</span>
                                <span className="text-3xl font-black text-white px-5 py-2 bg-white/10 rounded-xl shadow-sm border border-white/5">{topStudent.className}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="mt-8 flex flex-col items-center justify-center h-40 opacity-40">
                              <Users className="w-16 h-16 text-white mb-4" />
                              <p className="text-white text-2xl font-bold" style={{ fontFamily: "Khmer OS Muol Light" }}>មិនទាន់មានទិន្នន័យ</p>
                            </div>
                          )}
                        </div>

                        {/* Footer Score */}
                        {topStudent && (
                          <div className="relative z-10 mt-10 pt-8 border-t border-white/10 flex justify-between items-end">
                            <div>
                              <p className="text-blue-300/80 text-xl mb-2 font-khmer-body uppercase tracking-wider">មធ្យមភាគ / Average</p>
                              <div className="flex items-baseline gap-2">
                                <span className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-300 to-emerald-400 drop-shadow-sm">
                                  {topStudent.average}
                                </span>
                              </div>
                            </div>
                            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-green-400/20 to-emerald-500/20 border border-green-400/30 flex items-center justify-center shadow-lg">
                              <span className="text-4xl font-black text-green-400">{topStudent.gradeLevel}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
