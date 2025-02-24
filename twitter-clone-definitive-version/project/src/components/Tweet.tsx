import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat, Share } from 'lucide-react';
import type { Tweet as TweetType } from '../types';
import { useTweets } from '../context/TweetContext';
import Comment from './Comment';

interface TweetProps {
  tweet: TweetType;
}

export default function Tweet({ tweet }: TweetProps) {
  const { likeTweet, retweet, addComment } = useTweets();
  const [isCommenting, setIsCommenting] = useState(false);
  const [commentText, setCommentText] = useState('');

  const handleAddComment = () => {
    if (commentText.trim()) {
      addComment(tweet.id, commentText);
      setCommentText('');
      setIsCommenting(false);
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer">
        <div className="flex gap-4">
          <img
            src={tweet.author.avatar}
            alt={tweet.author.name}
            className="w-12 h-12 rounded-full"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold dark:text-white">{tweet.author.name}</span>
              <span className="text-gray-500 dark:text-gray-400">@{tweet.author.handle}</span>
              <span className="text-gray-500 dark:text-gray-400">·</span>
              <span className="text-gray-500 dark:text-gray-400">{tweet.timestamp}</span>
            </div>
            <p className="mt-2 text-gray-900 dark:text-gray-100">{tweet.content}</p>
            <div className="flex justify-between mt-4 max-w-md">
              <button 
                onClick={() => setIsCommenting(!isCommenting)}
                className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group"
              >
                <MessageCircle className="h-5 w-5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900 rounded-full p-1" />
                <span>{tweet.replies}</span>
              </button>
              <button 
                onClick={() => retweet(tweet.id)}
                className={`flex items-center gap-2 ${
                  tweet.isRetweeted ? 'text-green-500' : 'text-gray-500 dark:text-gray-400'
                } hover:text-green-500 group`}
              >
                <Repeat className="h-5 w-5 group-hover:bg-green-50 dark:group-hover:bg-green-900 rounded-full p-1" />
                <span>{tweet.retweets}</span>
              </button>
              <button 
                onClick={() => likeTweet(tweet.id)}
                className={`flex items-center gap-2 ${
                  tweet.isLiked ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                } hover:text-red-500 group`}
              >
                <Heart className={`h-5 w-5 group-hover:bg-red-50 dark:group-hover:bg-red-900 rounded-full p-1 ${
                  tweet.isLiked ? 'fill-current' : ''
                }`} />
                <span>{tweet.likes}</span>
              </button>
              <button className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-blue-500 group">
                <Share className="h-5 w-5 group-hover:bg-blue-50 dark:group-hover:bg-blue-900 rounded-full p-1" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isCommenting && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-3">
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
              alt="Current user"
              className="w-10 h-10 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Tweet your reply"
                className="w-full resize-none outline-none bg-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[80px]"
              />
              <div className="flex justify-end mt-2">
                <button
                  onClick={handleAddComment}
                  disabled={!commentText.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Reply
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {tweet.comments.length > 0 && (
        <div className="border-t border-gray-200 dark:border-gray-700">
          {tweet.comments.map(comment => (
            <Comment key={comment.id} comment={comment} tweetId={tweet.id} />
          ))}
        </div>
      )}
    </div>
  );
}