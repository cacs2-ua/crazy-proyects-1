import React, { createContext, useContext, useState } from 'react';
import type { Tweet, Comment } from '../types';

type TweetContextType = {
  tweets: Tweet[];
  addTweet: (content: string) => void;
  likeTweet: (id: string) => void;
  retweet: (id: string) => void;
  addComment: (tweetId: string, content: string) => void;
  likeComment: (tweetId: string, commentId: string) => void;
};

const TweetContext = createContext<TweetContextType | undefined>(undefined);

const INITIAL_TWEETS: Tweet[] = [
  {
    id: '1',
    content: 'Just deployed my new React project! 🚀 Check it out and let me know what you think! #webdev #reactjs',
    author: {
      name: 'Sarah Developer',
      handle: 'sarahdev',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop'
    },
    timestamp: '2h',
    likes: 142,
    retweets: 24,
    replies: 2,
    isLiked: false,
    isRetweeted: false,
    comments: [
      {
        id: 'c1',
        content: 'Looks amazing! Great work! 👏',
        author: {
          name: 'Alex Tech',
          handle: 'alextech',
          avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
        },
        timestamp: '1h',
        likes: 5,
        isLiked: false
      }
    ]
  },
  {
    id: '2',
    content: 'Beautiful morning for a coffee and some coding ☕️ #coding #developer',
    author: {
      name: 'Alex Tech',
      handle: 'alextech',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop'
    },
    timestamp: '4h',
    likes: 89,
    retweets: 5,
    replies: 0,
    isLiked: false,
    isRetweeted: false,
    comments: []
  }
];

export function TweetProvider({ children }: { children: React.ReactNode }) {
  const [tweets, setTweets] = useState<Tweet[]>(INITIAL_TWEETS);

  const addTweet = (content: string) => {
    const newTweet: Tweet = {
      id: Date.now().toString(),
      content,
      author: {
        name: 'Current User',
        handle: 'currentuser',
        avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop'
      },
      timestamp: 'now',
      likes: 0,
      retweets: 0,
      replies: 0,
      isLiked: false,
      isRetweeted: false,
      comments: []
    };
    setTweets([newTweet, ...tweets]);
  };

  const likeTweet = (id: string) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        return {
          ...tweet,
          likes: tweet.isLiked ? tweet.likes - 1 : tweet.likes + 1,
          isLiked: !tweet.isLiked
        };
      }
      return tweet;
    }));
  };

  const retweet = (id: string) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === id) {
        return {
          ...tweet,
          retweets: tweet.isRetweeted ? tweet.retweets - 1 : tweet.retweets + 1,
          isRetweeted: !tweet.isRetweeted
        };
      }
      return tweet;
    }));
  };

  const addComment = (tweetId: string, content: string) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === tweetId) {
        const newComment: Comment = {
          id: Date.now().toString(),
          content,
          author: {
            name: 'Current User',
            handle: 'currentuser',
            avatar: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=100&h=100&fit=crop'
          },
          timestamp: 'now',
          likes: 0,
          isLiked: false
        };
        return {
          ...tweet,
          replies: tweet.replies + 1,
          comments: [newComment, ...tweet.comments]
        };
      }
      return tweet;
    }));
  };

  const likeComment = (tweetId: string, commentId: string) => {
    setTweets(tweets.map(tweet => {
      if (tweet.id === tweetId) {
        return {
          ...tweet,
          comments: tweet.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
                isLiked: !comment.isLiked
              };
            }
            return comment;
          })
        };
      }
      return tweet;
    }));
  };

  return (
    <TweetContext.Provider value={{ tweets, addTweet, likeTweet, retweet, addComment, likeComment }}>
      {children}
    </TweetContext.Provider>
  );
}

export function useTweets() {
  const context = useContext(TweetContext);
  if (context === undefined) {
    throw new Error('useTweets must be used within a TweetProvider');
  }
  return context;
}