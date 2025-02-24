import React from 'react';
import Sidebar from './components/Sidebar';
import TweetComposer from './components/TweetComposer';
import Tweet from './components/Tweet';
import TrendingSection from './components/TrendingSection';
import { ThemeProvider } from './context/ThemeContext';
import { TweetProvider } from './context/TweetContext';
import { useTweets } from './context/TweetContext';

function Timeline() {
  const { tweets } = useTweets();
  
  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {tweets.map(tweet => (
        <Tweet key={tweet.id} tweet={tweet} />
      ))}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <TweetProvider>
        <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
          <div className="max-w-7xl mx-auto flex">
            {/* Sidebar */}
            <div className="w-[275px] xl:w-[300px]">
              <Sidebar />
            </div>

            {/* Main Content */}
            <main className="flex-1 border-x border-gray-200 dark:border-gray-700 min-h-screen">
              <h1 className="text-xl font-bold p-4 border-b border-gray-200 dark:border-gray-700">Home</h1>
              <TweetComposer />
              <Timeline />
            </main>

            {/* Right Sidebar */}
            <div className="hidden lg:block w-[350px] pl-8 py-4">
              <div className="sticky top-4">
                <div className="bg-gray-100 dark:bg-gray-800 rounded-full mb-4">
                  <input
                    type="text"
                    placeholder="Search Twitter"
                    className="w-full px-6 py-3 bg-transparent outline-none dark:text-white dark:placeholder-gray-400"
                  />
                </div>
                <TrendingSection />
              </div>
            </div>
          </div>
        </div>
      </TweetProvider>
    </ThemeProvider>
  );
}

export default App;