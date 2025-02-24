export interface Comment {
  id: string;
  content: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export interface Tweet {
  id: string;
  content: string;
  author: {
    name: string;
    handle: string;
    avatar: string;
  };
  timestamp: string;
  likes: number;
  retweets: number;
  replies: number;
  isLiked?: boolean;
  isRetweeted?: boolean;
  comments: Comment[];
}