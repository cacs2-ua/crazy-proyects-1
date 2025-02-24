import React, { useState } from 'react';
import { Image, Smile, Calendar, MapPin } from 'lucide-react';
import { useTweets } from '../context/TweetContext';

export default function TweetComposer() {
  const [tweet, setTweet] = useState('');
  const { addTweet } = useTweets();

  const handleSubmit = () => {
    if (tweet.trim()) {
      addTweet(tweet);
      setTweet('');
    }
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 p-4">
      <div className="flex gap-4">
        <img
          src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop"
          alt="User avatar"
          className="w-12 h-12 rounded-full"
        />
        <div className="flex-1">
          <textarea
            value={tweet}
            onChange={(e) => setTweet(e.target.value)}
            placeholder="What's happening?"
            className="w-full resize-none outline-none text-xl min-h-[120px] bg-transparent dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
          />
          <div className="flex items-center justify-between mt-4">
            <div className="flex gap-4 text-blue-500">
              <Image className="h-5 w-5 cursor-pointer hover:text-blue-600" />
              <Smile className="h-5 w-5 cursor-pointer hover:text-blue-600" />
              <Calendar className="h-5 w-5 cursor-pointer hover:text-blue-600" />
              <MapPin className="h-5 w-5 cursor-pointer hover:text-blue-600" />
            </div>
            <button
              onClick={handleSubmit}
              disabled={!tweet.trim()}
              className="bg-blue-500 text-white px-4 py-2 rounded-full font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Tweet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}