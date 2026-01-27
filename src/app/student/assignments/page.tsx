"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MobileBottomNav from "@/components/layout/MobileBottomNav";
import {
  PenTool,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Upload,
  Eye,
  TrendingUp,
} from "lucide-react";

interface Assignment {
  id: string;
  title: string;
  titleKh: string;
  course: string;
  dueDate: string;
  status: "pending" | "submitted" | "graded" | "overdue";
  grade?: number;
  totalPoints: number;
  description: string;
  attachments: number;
  color: string;
}

const mockAssignments: Assignment[] = [
  {
    id: "1",
    title: "Chemical Reactions Lab Report",
    titleKh: "របាយការណ៍ពន្យល់ប្រតិកម្មគីមី",
    course: "STEM Fundamentals",
    dueDate: "2026-01-30",
    status: "pending",
    totalPoints: 100,
    description: "Complete the lab report on chemical reactions",
    attachments: 2,
    color: "from-orange-400 to-yellow-500",
  },
  {
    id: "2",
    title: "English Essay: My Future Career",
    titleKh: "សេចក្តី​និពន្ធ: អាជីព​ដែល​ខ្ញុំ​ចង់​ធ្វើ",
    course: "English Communication",
    dueDate: "2026-01-28",
    status: "submitted",
    totalPoints: 50,
    description: "Write a 500-word essay about your future career goals",
    attachments: 1,
    color: "from-blue-400 to-indigo-500",
  },
  {
    id: "3",
    title: "Math Problem Set Chapter 5",
    titleKh: "លំហាត់គណិតវិទ្យាជំពូកទី៥",
    course: "Mathematics Advanced",
    dueDate: "2026-01-25",
    status: "overdue",
    totalPoints: 75,
    description: "Solve all problems from chapter 5",
    attachments: 0,
    color: "from-purple-400 to-pink-500",
  },
  {
    id: "4",
    title: "Physics Quiz",
    titleKh: "តេស្តរូបវិទ្យា",
    course: "STEM Fundamentals",
    dueDate: "2026-01-20",
    status: "graded",
    grade: 85,
    totalPoints: 100,
    description: "Online quiz covering chapters 1-3",
    attachments: 0,
    color: "from-orange-400 to-yellow-500",
  },
];

export default function AssignmentsPage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();
  const [assignments] = useState<Assignment[]>(mockAssignments);
  const [filter, setFilter] = useState<"all" | "pending" | "submitted" | "graded">("all");

  useEffect(() => {
    if (!loading && (!currentUser || currentUser.role !== "STUDENT")) {
      router.push("/feed");
    }
  }, [currentUser, loading, router]);

  if (loading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  const filteredAssignments = assignments.filter(
    (a) => filter === "all" || a.status === filter
  );

  const stats = {
    pending: assignments.filter((a) => a.status === "pending").length,
    submitted: assignments.filter((a) => a.status === "submitted").length,
    overdue: assignments.filter((a) => a.status === "overdue").length,
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      pending: { text: "Pending", icon: Clock, color: "bg-yellow-100 text-yellow-700 border-yellow-200" },
      submitted: { text: "Submitted", icon: CheckCircle2, color: "bg-blue-100 text-blue-700 border-blue-200" },
      graded: { text: "Graded", icon: CheckCircle2, color: "bg-green-100 text-green-700 border-green-200" },
      overdue: { text: "Overdue", icon: AlertCircle, color: "bg-red-100 text-red-700 border-red-200" },
    };
    return badges[status as keyof typeof badges];
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header - Fixed */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
              <PenTool className="w-6 h-6 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 font-koulen">កិច្ចការ</h1>
              <p className="text-xs text-gray-500">Assignments & Tasks</p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {[
              { key: "all", label: "All", count: assignments.length },
              { key: "pending", label: "Pending", count: stats.pending },
              { key: "submitted", label: "Submitted", count: stats.submitted },
              { key: "graded", label: "Graded", count: assignments.filter((a) => a.status === "graded").length },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as any)}
                className={`px-4 py-2 rounded-xl font-bold text-sm whitespace-nowrap transition-all duration-300 ${
                  filter === tab.key
                    ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg scale-105"
                    : "bg-white text-gray-600 hover:bg-gray-50 shadow-sm"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.pending}</p>
              <p className="text-[10px] text-gray-500 font-medium">Pending</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-6 h-6 text-blue-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.submitted}</p>
              <p className="text-[10px] text-gray-500 font-medium">Submitted</p>
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-lg text-center">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mx-auto mb-2">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <p className="text-2xl font-black text-gray-900">{stats.overdue}</p>
              <p className="text-[10px] text-gray-500 font-medium">Overdue</p>
            </div>
          </div>

          {/* Assignments List */}
          <div className="space-y-4">
            {filteredAssignments.map((assignment) => {
              const badge = getStatusBadge(assignment.status);
              const Icon = badge.icon;
              const daysUntilDue = Math.ceil(
                (new Date(assignment.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
              );

              return (
                <div
                  key={assignment.id}
                  className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  {/* Assignment Header */}
                  <div className={`bg-gradient-to-br ${assignment.color} p-5 relative`}>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-black text-white mb-1 font-koulen">
                          {assignment.titleKh}
                        </h3>
                        <p className="text-sm text-white/90 mb-2">{assignment.title}</p>
                        <p className="text-xs text-white/80 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1 inline-block">
                          {assignment.course}
                        </p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-xl ${badge.color} border flex items-center gap-1.5 shadow-sm`}>
                        <Icon className="w-4 h-4" />
                        <span className="text-xs font-bold">{badge.text}</span>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Details */}
                  <div className="p-5">
                    <p className="text-sm text-gray-600 mb-3">{assignment.description}</p>

                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                        <Calendar className="w-4 h-4" />
                        {new Date(assignment.dueDate).toLocaleDateString()}
                      </span>
                      {assignment.attachments > 0 && (
                        <span className="flex items-center gap-1.5 bg-gray-50 px-3 py-1.5 rounded-lg">
                          <FileText className="w-4 h-4" />
                          {assignment.attachments} files
                        </span>
                      )}
                    </div>

                    {assignment.status === "graded" && assignment.grade !== undefined ? (
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-bold text-green-700">Your Grade</span>
                            <div className="flex items-center gap-2 mt-1">
                              <TrendingUp className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-600">Great work!</span>
                            </div>
                          </div>
                          <span className="text-3xl font-black text-green-700">
                            {assignment.grade}/{assignment.totalPoints}
                          </span>
                        </div>
                      </div>
                    ) : assignment.status === "pending" ? (
                      <div className="flex gap-2">
                        <button className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2">
                          <Upload className="w-5 h-5" />
                          Submit Work
                        </button>
                        <button className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors">
                          <Eye className="w-5 h-5 text-gray-600" />
                        </button>
                      </div>
                    ) : assignment.status === "submitted" ? (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 text-center">
                        <CheckCircle2 className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <p className="text-sm font-bold text-blue-700">Submitted successfully</p>
                        <p className="text-xs text-blue-600 mt-1">Waiting for grading...</p>
                      </div>
                    ) : assignment.status === "overdue" ? (
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-2xl p-4">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="w-8 h-8 text-red-600" />
                          <div>
                            <p className="text-sm font-bold text-red-700">Assignment Overdue</p>
                            <p className="text-xs text-red-600">{Math.abs(daysUntilDue)} days past deadline</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAssignments.length === 0 && (
            <div className="text-center py-12 bg-white rounded-3xl shadow-sm">
              <PenTool className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-gray-900 mb-2">No assignments found</h3>
              <p className="text-sm text-gray-600">You're all caught up!</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <MobileBottomNav />
    </div>
  );
}
