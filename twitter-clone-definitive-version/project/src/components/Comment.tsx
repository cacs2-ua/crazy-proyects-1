import React from 'react';
import { Heart } from 'lucide-react';
import type { Comment as CommentType } from '../types';
import { useTweets } from '../context/TweetContext';

interface CommentProps {
  comment: CommentType;
  tweetId: string;
}

export default function Comment({ comment, tweetId }: CommentProps) {
  const { likeComment } = useTweets();

  return (
    <div className="pl-12 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex gap-3">
        <img
          src={comment.author.avatar}
          alt={comment.author.name}
          className="w-10 h-10 rounded-full"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-bold dark:text-white">{comment.author.name}</span>
            <span className="text-gray-500 dark:text-gray-400">@{comment.author.handle}</span>
            <span className="text-gray-500 dark:text-gray-400">·</span>
            <span className="text-gray-500 dark:text-gray-400">{comment.timestamp}</span>
          </div>
          <p className="text-gray-900 dark:text-gray-100 mt-1">{comment.content}</p>
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => likeComment(tweetId, comment.id)}
              className={`flex items-center gap-1 ${
                comment.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
              } hover:text-red-500 group`}
            >
              <Heart className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">{comment.likes}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}