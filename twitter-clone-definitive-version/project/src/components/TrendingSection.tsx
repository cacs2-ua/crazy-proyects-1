import React from 'react';
import { Settings } from 'lucide-react';

const trends = [
  { category: 'Technology', title: '#React', tweets: '125K' },
  { category: 'Sports', title: 'Champions League', tweets: '85K' },
  { category: 'Entertainment', title: '#NewMovie', tweets: '65K' },
  { category: 'Politics', title: '#Elections2024', tweets: '200K' },
];

export default function TrendingSection() {
  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold dark:text-white">Trends for you</h2>
        <Settings className="h-5 w-5 text-gray-600 dark:text-gray-400 cursor-pointer" />
      </div>
      
      {trends.map((trend, index) => (
        <div key={index} className="py-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer">
          <p className="text-sm text-gray-500 dark:text-gray-400">{trend.category}</p>
          <p className="font-bold dark:text-white">{trend.title}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{trend.tweets} Tweets</p>
        </div>
      ))}
      
      <a href="#" className="text-blue-500 hover:text-blue-600 block mt-4">
        Show more
      </a>
    </div>
  );
}