"use client";

import { useState } from "react";
import { Check } from "lucide-react";
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
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votesCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votesCount / totalVotes) * 100);
  };

  const maxVotes = Math.max(...pollOptions.map(o => o.votesCount));

  return (
    <div className="mt-3 space-y-2">
      {pollOptions.map((option) => {
        const percentage = getPercentage(option.votesCount);
        const isUserVote = userVote === option.id;
        const isWinner = hasVoted && option.votesCount === maxVotes && maxVotes > 0;

        if (hasVoted) {
          // Show results - Clean Instagram style
          return (
            <div
              key={option.id}
              className={`relative overflow-hidden rounded-xl border-2 transition-all ${
                isUserVote
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              {/* Progress bar */}
              <div
                className={`absolute inset-y-0 left-0 transition-all duration-500 ${
                  isUserVote ? "bg-blue-100" : "bg-gray-100"
                }`}
                style={{ width: `${percentage}%` }}
              />

              {/* Content */}
              <div className="relative px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-1">
                  {isUserVote && (
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    </div>
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isUserVote ? "text-blue-900" : "text-gray-900"
                    }`}
                  >
                    {option.text}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-bold ${
                      isUserVote ? "text-blue-700" : "text-gray-700"
                    }`}
                  >
                    {percentage}%
                  </span>
                  {isWinner && (
                    <span className="text-xs">🏆</span>
                  )}
                </div>
              </div>
            </div>
          );
        } else {
          // Show vote buttons - Clean style
          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isVoting}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-400 bg-white hover:bg-gray-50 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-sm font-medium text-gray-900">
                {option.text}
              </span>
            </button>
          );
        }
      })}

      {/* Total votes */}
      {hasVoted && (
        <p className="text-xs text-gray-500 mt-2 px-1">
          {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
        </p>
      )}
    </div>
  );
}
