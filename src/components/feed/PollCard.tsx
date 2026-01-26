"use client";

import { useState } from "react";
import { Check, BarChart3 } from "lucide-react";
import { votePoll, PollOption } from "@/lib/api/feed";

interface PollCardProps {
  postId: string;
  pollOptions: PollOption[];
  userVote: string | null;
  totalVotes: number;
  onVoteSuccess?: (data: any) => void;
}

export default function PollCard({
  postId,
  pollOptions: initialOptions,
  userVote: initialUserVote,
  totalVotes: initialTotalVotes,
  onVoteSuccess,
}: PollCardProps) {
  const [pollOptions, setPollOptions] = useState(initialOptions);
  const [userVote, setUserVote] = useState(initialUserVote);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [isVoting, setIsVoting] = useState(false);

  const hasVoted = !!userVote;

  const handleVote = async (optionId: string) => {
    if (hasVoted || isVoting) return;

    setIsVoting(true);
    try {
      const response = await votePoll(optionId);
      
      if (response.success) {
        setPollOptions(response.data.pollOptions);
        setUserVote(response.data.userVote);
        setTotalVotes(response.data.totalVotes);
        
        if (onVoteSuccess) {
          onVoteSuccess(response.data);
        }
      }
    } catch (error: any) {
      console.error("Vote error:", error);
      alert(error.message || "Failed to record vote");
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votesCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votesCount / totalVotes) * 100);
  };

  return (
    <div className="mt-4 space-y-3">
      {/* Poll header */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <BarChart3 className="w-4 h-4" />
        <span>{totalVotes} {totalVotes === 1 ? "vote" : "votes"}</span>
      </div>

      {/* Poll options */}
      <div className="space-y-2.5">
        {pollOptions.map((option) => {
          const percentage = getPercentage(option.votesCount);
          const isUserVote = userVote === option.id;

          if (hasVoted) {
            // Show results
            return (
              <div
                key={option.id}
                className={`relative overflow-hidden rounded-lg border-2 p-4 transition-all ${
                  isUserVote
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 bg-gray-50"
                }`}
              >
                {/* Progress bar background */}
                <div
                  className={`absolute inset-0 transition-all duration-500 ${
                    isUserVote ? "bg-blue-100" : "bg-gray-100"
                  }`}
                  style={{ width: `${percentage}%` }}
                />

                {/* Content */}
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1">
                    {isUserVote && (
                      <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                    <span
                      className={`font-medium ${
                        isUserVote ? "text-blue-900" : "text-gray-900"
                      }`}
                    >
                      {option.text}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <span className="text-sm text-gray-600">
                      {option.votesCount}
                    </span>
                    <span
                      className={`font-bold text-lg ${
                        isUserVote ? "text-blue-600" : "text-gray-700"
                      }`}
                    >
                      {percentage}%
                    </span>
                  </div>
                </div>
              </div>
            );
          } else {
            // Show vote buttons
            return (
              <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                disabled={isVoting}
                className="w-full text-left rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-blue-400 hover:bg-blue-50 hover:shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-medium text-gray-900">{option.text}</span>
              </button>
            );
          }
        })}
      </div>

      {/* Voted indicator */}
      {hasVoted && (
        <p className="text-xs text-gray-500 text-center pt-2">
          You voted • Poll results are final
        </p>
      )}
    </div>
  );
}
