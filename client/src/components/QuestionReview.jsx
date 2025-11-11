"use client"

import { useState } from "react"
import { FaChevronDown, FaChevronUp } from "react-icons/fa"

export default function QuestionReview({
  questionNumber,
  question,
  userAnswer,
  preferredAnswer,
  score,
  feedback,
  defaultExpanded = false,
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
  }

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="border border-slate-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow">
      <button
        onClick={toggleExpanded}
        className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center space-x-4 flex-1">
          <span className="font-semibold text-slate-800">
            Question {questionNumber}
          </span>
          <span className="text-slate-700 flex-1">{question}</span>
          {score !== undefined && score !== null && (
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getScoreColor(score)}`}>
              {score}%
            </span>
          )}
        </div>
        {isExpanded ? (
          <FaChevronUp className="w-4 h-4 text-slate-500 ml-4" />
        ) : (
          <FaChevronDown className="w-4 h-4 text-slate-500 ml-4" />
        )}
      </button>

      {isExpanded && (
        <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
          {userAnswer && (
            <div className="bg-slate-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-800 mb-2">Your Answer:</h5>
              <p className="text-sm text-slate-700 leading-relaxed">{userAnswer}</p>
            </div>
          )}

          {preferredAnswer && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h5 className="font-semibold text-slate-800 mb-2">Preferred Answer:</h5>
              <p className="text-sm text-slate-700 leading-relaxed">{preferredAnswer}</p>
            </div>
          )}

          {score !== undefined && score !== null && (
            <div className="bg-white rounded-lg p-4 border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-slate-800">Score: </span>
                <span className={`text-lg font-bold px-3 py-1 rounded-full ${getScoreColor(score)}`}>
                  {score}%
                </span>
              </div>
            </div>
          )}

          {feedback && (
            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
              <h5 className="font-semibold text-slate-800 mb-2">Feedback:</h5>
              <p className="text-sm text-slate-700 leading-relaxed">{feedback}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
