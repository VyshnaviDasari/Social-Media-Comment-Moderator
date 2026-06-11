export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
    role?: "moderator" | "user" | "developer";
  };
  timestamp: string;
  text: string;
  
  // Moderation analysis results
  isNegative: boolean;
  severity: number; // 0-100
  sentiment: "positive" | "neutral" | "negative";
  category: "harassment" | "hate_speech" | "profanity" | "constructive_critique" | "spam" | "positive_feedback" | "neutral_unrelated";
  explanation: string;
  suggestion?: string;
  moderator: string;
  executionTimeMs: number;
  
  // User flag overrides
  isManuallyApproved?: boolean;
  isManuallyHidden?: boolean;
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
    handle: string;
  };
  timestamp: string;
  content: string;
  likes: number;
  shares: number;
  commentsCount: number;
  tags: string[];
}

export interface ModeratorConfig {
  mode: "keywords" | "heuristics" | "gemini";
  customKeywords: string[];
  threshold: number; // 0-100
  maskStyle: "hide" | "blur" | "flag";
}
