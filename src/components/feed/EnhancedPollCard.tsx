"use client";

import { useState } from "react";
import { Check, Clock, Users, Lock } from "lucide-react";
import { votePoll, PollOption } from "@/lib/api/feed";

interface EnhancedPollCardProps {
  postId: string;
  pollOptions: PollOption[];
  userVotes: string[];
  totalVotes: number;
  pollExpiresAt?: string | null;
  pollAllowMultiple?: boolean;
  pollMaxChoices?: number | null;
  pollIsAnonymous?: boolean;
  isPollExpired?: boolean;
  onVoteSuccess?: (data: any) => void;
}

export default function EnhancedPollCard({
  postId,
  pollOptions: initialOptions,
  userVotes: initialUserVotes = [],
  totalVotes: initialTotalVotes,
  pollExpiresAt,
  pollAllowMultiple = false,
  pollMaxChoices,
  pollIsAnonymous = false,
  isPollExpired = false,
  onVoteSuccess,
}: EnhancedPollCardProps) {
  const [pollOptions, setPollOptions] = useState(initialOptions);
  const [userVotes, setUserVotes] = useState<string[]>(initialUserVotes);
  const [totalVotes, setTotalVotes] = useState(initialTotalVotes);
  const [isVoting, setIsVoting] = useState(false);

  const hasVoted = userVotes.length > 0;

  const handleVote = async (optionId: string) => {
    if (isPollExpired || isVoting) return;

    // If single choice and already voted, don't allow voting again
    if (!pollAllowMultiple && hasVoted) return;

    // If multiple choice, check if max choices reached
    if (pollAllowMultiple && pollMaxChoices && userVotes.length >= pollMaxChoices) {
      // Don't allow adding more votes
      return;
    }

    setIsVoting(true);
    try {
      const response = await votePoll(optionId);

      if (response.success) {
        setPollOptions(response.data.pollOptions);
        setUserVotes(response.data.userVotes || []);
        setTotalVotes(response.data.totalVotes);

        if (onVoteSuccess) {
          onVoteSuccess(response.data);
        }
      }
    } catch (error: any) {
      console.error("Vote error:", error);
      // Show error toast if available
    } finally {
      setIsVoting(false);
    }
  };

  const getPercentage = (votesCount: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votesCount / totalVotes) * 100);
  };

  const maxVotes = Math.max(...pollOptions.map((o) => o.votesCount));

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!pollExpiresAt) return null;
    const now = new Date();
    const expiry = new Date(pollExpiresAt);
    const diff = expiry.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const timeRemaining = getTimeRemaining();

  return (
    <div className="mt-3 space-y-3">
      {/* Poll Info Bar */}
      <div className="flex items-center justify-between text-xs text-gray-600 px-1">
        <div className="flex items-center gap-3">
          {/* Multiple Choice Indicator */}
          {pollAllowMultiple && (
            <div className="flex items-center gap-1">
              <Check className="w-3 h-3" />
              <span>
                Choose {pollMaxChoices ? `up to ${pollMaxChoices}` : "multiple"}
              </span>
            </div>
          )}

          {/* Anonymous Indicator */}
          {pollIsAnonymous && (
            <div className="flex items-center gap-1">
              <Lock className="w-3 h-3" />
              <span>Anonymous</span>
            </div>
          )}
        </div>

        {/* Time Remaining */}
        {pollExpiresAt && (
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span className={isPollExpired ? "text-red-600 font-medium" : ""}>
              {timeRemaining}
            </span>
          </div>
        )}
      </div>

      {/* Poll Options */}
      {pollOptions.map((option) => {
        const percentage = getPercentage(option.votesCount);
        const isUserVote = userVotes.includes(option.id);
        const isWinner = hasVoted && option.votesCount === maxVotes && maxVotes > 0;

        if (hasVoted || isPollExpired) {
          // Show results
          return (
            <div
              key={option.id}
              className={`relative overflow-hidden rounded-xl border-2 transition-all cursor-default ${
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
                  {isWinner && <span className="text-xs">🏆</span>}
                </div>
              </div>
            </div>
          );
        } else {
          // Show vote buttons
          const canVoteMore =
            !pollMaxChoices || userVotes.length < pollMaxChoices;

          return (
            <button
              key={option.id}
              onClick={() => handleVote(option.id)}
              disabled={isVoting || !canVoteMore}
              className={`w-full px-4 py-3 rounded-xl border-2 text-left transition-all ${
                isVoting || !canVoteMore
                  ? "border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed"
                  : "border-gray-200 hover:border-blue-500 bg-white hover:bg-blue-50"
              }`}
            >
              <span className="text-sm font-medium text-gray-900">
                {option.text}
              </span>
            </button>
          );
        }
      })}

      {/* Footer Info */}
      {hasVoted && (
        <div className="flex items-center justify-between text-xs text-gray-500 px-1">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>
              {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
            </span>
          </div>

          {pollAllowMultiple && userVotes.length > 1 && (
            <span className="text-blue-600 font-medium">
              You selected {userVotes.length} option{userVotes.length > 1 ? "s" : ""}
            </span>
          )}
        </div>
      )}

      {/* Max choices warning */}
      {!hasVoted &&
        !isPollExpired &&
        pollAllowMultiple &&
        pollMaxChoices &&
        userVotes.length >= pollMaxChoices && (
          <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            You've reached the maximum number of choices ({pollMaxChoices})
          </div>
        )}

      {/* Expired message */}
      {isPollExpired && !hasVoted && (
        <div className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-center">
          This poll has expired
        </div>
      )}
    </div>
  );
}
