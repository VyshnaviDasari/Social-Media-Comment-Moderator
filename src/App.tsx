import React, { useState, useEffect } from "react";
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  Trash2, 
  Settings, 
  Activity, 
  Heart, 
  Share2, 
  MessageSquare, 
  Send, 
  RefreshCw, 
  Sliders, 
  Info, 
  Lock, 
  Unlock, 
  ThumbsUp, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  X, 
  Eye, 
  EyeOff, 
  Flame,
  MessageCircle,
  HelpCircle
} from "lucide-react";
import { Post, Comment, ModeratorConfig } from "./types";
import { INITIAL_POSTS, INITIAL_COMMENTS } from "./data";

export default function App() {
  const [posts] = useState<Post[]>(INITIAL_POSTS);
  const [selectedPostId, setSelectedPostId] = useState<string>("post-1");
  const [comments, setComments] = useState<Comment[]>([]);
  
  // Custom moderator config settings
  const [config, setConfig] = useState<ModeratorConfig>({
    mode: "gemini",
    customKeywords: ["junk", "terrible", "worthless"],
    threshold: 50,
    maskStyle: "blur"
  });

  // UI States
  const [commentInput, setCommentInput] = useState<string>("");
  const [keywordInput, setKeywordInput] = useState<string>("");
  const [selectedCommentId, setSelectedCommentId] = useState<string>("cmt-3"); // Pre-select a toxic comment for visual inspection on first load
  const [viewPersona, setViewPersona] = useState<"audience" | "moderator">("moderator");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<"connecting" | "online" | "offline">("connecting");
  const [averageLatency, setAverageLatency] = useState<number>(115);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState<boolean>(false);

  // Fetch initial logs on load from server
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch("/api/history");
      if (response.ok) {
        const data = await response.json();
        const serverLogs: any[] = data.history;
        
        // Match mock initial comments with any updated backend history logs
        const mergedComments = [...INITIAL_COMMENTS];
        
        // Append unique server items that might have been processed
        serverLogs.forEach((log: any, index: number) => {
          if (!mergedComments.some(c => c.id === log.id)) {
            let author = {
              name: "System Auditor",
              handle: "@system_audit",
              avatar: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80",
              role: undefined as any
            };
            
            if (log.category === "spam") {
              author = {
                name: "CryptoProBot",
                handle: "@crypto_pro_bot",
                avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80",
                role: "user"
              };
            } else if (log.category === "harassment" || log.category === "profanity") {
              author = {
                name: "AngryUser77",
                handle: "@angry_user77",
                avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
                role: "user"
              };
            } else if (log.category === "positive_feedback") {
              author = {
                name: "Happy Coder",
                handle: "@happy_coder",
                avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
                role: "user"
              };
            } else {
              author = {
                name: `Community Guest ${index + 1}`,
                handle: `@guest_${index + 1}`,
                avatar: `https://images.unsplash.com/photo-${1502400000000 + (index * 15000)}?w=150&auto=format&fit=crop&q=80`,
                role: "user"
              };
            }

            mergedComments.unshift({
              ...log,
              postId: "post-1", // Default mock link
              author: log.author || author
            });
          }
        });
        
        setComments(mergedComments);
        setBackendStatus("online");
      } else {
        setBackendStatus("offline");
      }
    } catch (err) {
      console.error("Error connecting to backend API:", err);
      setBackendStatus("offline");
      // Fallback: stay client side with standard mock defaults
      setComments(INITIAL_COMMENTS);
    }
  };

  // Handle comment submit
  const handleAddComment = async (textToPost: string) => {
    const activeText = textToPost.trim();
    if (!activeText) return;

    setIsSubmitting(true);
    setApiError(null);

    try {
      const response = await fetch("/api/moderate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: activeText,
          mode: config.mode,
          customKeywords: config.customKeywords,
          threshold: config.threshold
        })
      });

      if (!response.ok) {
        throw new Error("Failed to process comment on server.");
      }

      const moderatedComment = await response.json();
      
      const newCommentObj: Comment = {
        ...moderatedComment,
        postId: selectedPostId,
        author: {
          name: "Anonymous Interviewer",
          handle: "@interviewer_guest",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          role: "developer"
        }
      };

      setComments(prev => [newCommentObj, ...prev]);
      setSelectedCommentId(newCommentObj.id); // Auto inspect
      setCommentInput("");

      // Update interactive average latency
      if (newCommentObj.executionTimeMs > 0) {
        setAverageLatency(prev => Math.round((prev * 4 + newCommentObj.executionTimeMs) / 5));
      }
    } catch (err: any) {
      setApiError(err.message || "Something went wrong. Running offline fallback.");
      
      // Fallback in case of server failure: emulate heuristics locally
      const localSeverity = activeText.toLowerCase().includes("garbage") || activeText.toLowerCase().includes("sucks") ? 85 : 10;
      const fallbackObj: Comment = {
        id: "fallback-" + Math.random().toString(36).substring(2, 9),
        postId: selectedPostId,
        author: {
          name: "Anonymous (Local Fallback)",
          handle: "@offline_mode",
          avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
          role: "user"
        },
        timestamp: "Just now",
        text: activeText,
        isNegative: localSeverity >= config.threshold,
        severity: localSeverity,
        sentiment: localSeverity > 50 ? "negative" : "neutral",
        category: localSeverity > 50 ? "harassment" : "neutral_unrelated",
        explanation: "Processed on local fallback. Server connection is resting or starting up.",
        moderator: "Local Sentiment Heuristics",
        executionTimeMs: 1
      };
      setComments(prev => [fallbackObj, ...prev]);
      setSelectedCommentId(fallbackObj.id);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a quick phrase from the interview testing template
  const selectQuickPrompt = (phrase: string) => {
    setCommentInput(phrase);
  };

  // Add custom keyword blacklist element
  const handleAddKeyword = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanWord = keywordInput.trim().toLowerCase();
    if (cleanWord && !config.customKeywords.includes(cleanWord)) {
      setConfig(prev => ({
        ...prev,
        customKeywords: [...prev.customKeywords, cleanWord]
      }));
      setKeywordInput("");
    }
  };

  const handleRemoveKeyword = (word: string) => {
    setConfig(prev => ({
      ...prev,
      customKeywords: prev.customKeywords.filter(k => k !== word)
    }));
  };

  // Manual Moderator actions
  const overrideApprove = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, isManuallyApproved: true, isManuallyHidden: false } : c));
  };

  const overrideHide = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, isManuallyHidden: true, isManuallyApproved: false } : c));
  };

  const overrideReset = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, isManuallyApproved: undefined, isManuallyHidden: undefined } : c));
  };

  const flagComment = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { 
      ...c, 
      isManuallyHidden: true, 
      isNegative: true, 
      category: "harassment", 
      severity: 99, 
      explanation: "This comment was reported as abusive/harmful by a community member and has been hidden.",
      moderator: "Community Flag"
    } : c));
  };

  // Adopt rephrasingsuggestion live!
  const adoptHealthySuggestion = (id: string, suggestion: string) => {
    if (!suggestion) return;
    setComments(prev => prev.map(c => {
      if (c.id === id) {
        return {
          ...c,
          text: suggestion,
          isNegative: false,
          severity: 5,
          sentiment: "neutral",
          category: "neutral_unrelated",
          explanation: "Abusive content was voluntarily reframed by the user using Gemini's intelligent critique guidance.",
          suggestion: undefined,
          isManuallyApproved: true
        };
      }
      return c;
    }));
  };

  // Reset entire simulation to mock dataset
  const resetEntireSession = async () => {
    try {
      await fetch("/api/history/clear", { method: "POST" });
    } catch (e) {
      console.error(e);
    }
    setComments(INITIAL_COMMENTS);
  };

  // Filter and process active post
  const activePost = posts.find(p => p.id === selectedPostId) || posts[0];
  const activePostComments = comments.filter(c => c.postId === activePost.id);

  // Computations for Analytics Card
  const totalCommentsCount = activePostComments.length;
  const filteredCount = activePostComments.filter(c => {
    if (c.isManuallyApproved) return false;
    if (c.isManuallyHidden) return true;
    return c.isNegative;
  }).length;
  const safeCount = totalCommentsCount - filteredCount;

  // Sentiment percentages
  const positiveRating = activePostComments.filter(c => c.sentiment === "positive").length;
  const negativeRating = activePostComments.filter(c => c.sentiment === "negative").length;
  const neutralRating = activePostComments.filter(c => c.sentiment === "neutral").length;

  const pctPositive = totalCommentsCount > 0 ? Math.round((positiveRating / totalCommentsCount) * 100) : 0;
  const pctNegative = totalCommentsCount > 0 ? Math.round((negativeRating / totalCommentsCount) * 100) : 0;
  const pctNeutral = totalCommentsCount > 0 ? Math.round((neutralRating / totalCommentsCount) * 105) : 0;

  // Category statistics breakdown
  const categoriesMap = {
    harassment: activePostComments.filter(c => c.category === "harassment").length,
    hate_speech: activePostComments.filter(c => c.category === "hate_speech").length,
    profanity: activePostComments.filter(c => c.category === "profanity").length,
    constructive_critique: activePostComments.filter(c => c.category === "constructive_critique").length,
    spam: activePostComments.filter(c => c.category === "spam").length,
    positive_feedback: activePostComments.filter(c => c.category === "positive_feedback").length,
    neutral_unrelated: activePostComments.filter(c => c.category === "neutral_unrelated").length,
  };

  const inspectedComment = comments.find(c => c.id === selectedCommentId);

  // Quick demonstration comments templates representing exact real scenarios
  const INTERVIEW_PRESETS = [
    { label: "Positive Appreciation", emoji: "🌟", text: "Incredible speed! The bundle size was compressed down instantly with zero setup pain." },
    { label: "Telugu Appreciation", emoji: "❤️", text: "ఈ ప్రాజెక్ట్ చాలా అద్భుతంగా ఉంది! రన్ స్పీడ్ మరియు డిజైన్ చాలా నచ్చాయి!" },
    { label: "Telugu Hostility", emoji: "🤬", text: "ఈ చెత్త అప్లికేషన్ పని చేయట్లేదు, దీన్ని తయారు చేసినోడు కూడా ఒక పెద్ద మూర్ఖుడు!" },
    { label: "Cryptocurrency Spam", emoji: "💸", text: "🎁 DEPOSIT BTC TO EARN BIG CASH $$$ WE OFFER 500% DAILY PAYOUTS IMMEDIATELY 💸" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      
      {/* HEADER NAVIGATION */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-xs px-4 py-3">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          
          <div className="flex items-center gap-3">
            <div className="bg-rose-100 text-rose-600 p-2 rounded-lg">
              <Shield className="w-6 h-6 stroke-[2]" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg tracking-tight text-slate-900">
                Social Media Comment Moderator
              </h1>
              <p className="text-xs text-slate-500 font-mono">
                System Interface / Evaluation Playground
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            
            {/* Backend connection state badges */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border border-slate-200">
              <span className={`w-2 h-2 rounded-full ${
                backendStatus === "online" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`} />
              <span className="text-xs font-mono font-medium text-slate-700 capitalize">
                Server: {backendStatus === "online" ? "Live" : "Limited Fallback"}
              </span>
            </div>

            {/* Clear history sandbox */}
            <button
              onClick={resetEntireSession}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-705 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
              title="Reset Simulated Data to original default comments"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset Logs
            </button>
            
            {/* Settings trigger */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Configure Community Rules"
            >
              <Settings className="w-3.5 h-3.5 text-indigo-500" />
              Settings
            </button>

            {/* Analytics trigger */}
            <button
              onClick={() => setIsAnalyticsOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
              title="Launch Moderation Analytics"
            >
              <Activity className="w-3.5 h-3.5 text-indigo-500" />
              Analytics
            </button>

            {/* View state selector toggle */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-150 border border-slate-200 text-xs">
              <button 
                onClick={() => setViewPersona("audience")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  viewPersona === "audience" 
                    ? "bg-white text-slate-900 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                Audience View
              </button>
              <button 
                onClick={() => setViewPersona("moderator")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md transition-all font-medium cursor-pointer ${
                  viewPersona === "moderator" 
                    ? "bg-white text-rose-600 shadow-xs" 
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Moderator Room
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* COMPACT MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* CONTAINER FLOW BY PERSONA */}
        {viewPersona === "audience" ? (
          /* AUDIENCE VIEW CONTEXT */
          <div className="grid grid-cols-1 gap-6">
            
            {/* SELECT DEMO POST SCENARIO TAB CONTROLS */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs mb-2">
              <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-xs font-semibold tracking-wider text-slate-400 uppercase font-mono flex items-center gap-1.5">
                  <MessageCircle className="w-4 h-4 text-indigo-500" />
                  Select Demo Post Scenario
                </h3>
              </div>
              {/* Grid layout to prevent horizontal overflow or cutoff on screen sizes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {posts.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setSelectedPostId(p.id)}
                    className={`text-left p-3.5 rounded-lg border transition-all relative flex flex-col justify-between h-28 cursor-pointer ${
                      selectedPostId === p.id 
                        ? "bg-indigo-50/50 shadow-xs border-indigo-200 text-indigo-955 font-medium" 
                        : "bg-white border-slate-200 hover:border-slate-300 text-slate-600"
                    }`}
                  >
                    <div className="w-full">
                      <div className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                        <img src={p.author.avatar} className="w-5 h-5 rounded-full object-cover" alt="" referrerPolicy="no-referrer" />
                        <span className="truncate">{p.author.name}</span>
                      </div>
                      <div className="text-xs line-clamp-2 text-slate-500 leading-snug h-8 overflow-hidden pr-2">
                        {p.content}
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] text-indigo-600 font-mono font-medium">
                      {p.tags.slice(0, 2).map(t => `#${t}`).join(' ')}
                    </div>
                    {selectedPostId === p.id && (
                      <div className="absolute right-3 top-3 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>
            
            {/* PRIMARY ACTIVE POST CARD and COMMENTS FEED */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Post Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={activePost.author.avatar} 
                      alt="" 
                      className="w-10 h-10 rounded-full object-cover border border-slate-100"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-semibold text-slate-950 leading-tight">
                        {activePost.author.name}
                      </div>
                      <div className="text-xs text-slate-500 font-mono">
                        {activePost.author.handle} • {activePost.timestamp}
                      </div>
                    </div>
                  </div>
                  
                  {/* Category Status Indicator of Filter Mode */}
                  <span className="text-xs font-mono bg-slate-200/60 text-slate-700 px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Settings className="w-3 h-3" />
                    Mode: {config.mode === "gemini" ? "Gemini Shield" : config.mode === "heuristics" ? "Heuristics" : "Keywords"}
                  </span>
                </div>

                <div className="mt-4 text-slate-800 text-sm leading-relaxed whitespace-pre-line font-display">
                  {activePost.content}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {activePost.tags.map(tag => (
                    <span key={tag} className="text-xs text-indigo-600 font-medium bg-indigo-50 px-2 py-0.5 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Social Counter Icons */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-start gap-6 text-xs text-slate-500 font-mono">
                  <span className="flex items-center gap-1.5 hover:text-rose-500 cursor-pointer transition-colors">
                    <Heart className="w-4 h-4" /> {activePost.likes} Likes
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-indigo-500 cursor-pointer transition-colors">
                    <Share2 className="w-4 h-4" /> {activePost.shares} Shares
                  </span>
                  <span className="flex items-center gap-1.5 hover:text-emerald-500 cursor-pointer transition-colors">
                    <MessageSquare className="w-4 h-4" /> {activePostComments.length} Comments
                  </span>
                </div>
              </div>

              {/* COMMENTS LOG FEED */}
              <div className="p-5 space-y-4 max-h-[500px] overflow-y-auto bg-slate-50/20">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono flex items-center justify-between pb-1 border-b border-slate-100">
                  <span>Comments ({filteredCount} hidden, {safeCount} visible)</span>
                  <span className="text-slate-550 underline decoration-dotted capitalize">
                    Audience Feed (Abusive remarks auto-hidden)
                  </span>
                </div>

                {activePostComments.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-mono">
                    No comments found. Type a comment in the input below to start the conversation!
                  </div>
                ) : (
                  activePostComments.map(comment => {
                    const isLocallyHidden = comment.isManuallyHidden || (comment.isNegative && !comment.isManuallyApproved);
                    
                    // In audience persona, don't show the comment if it is negative and not approved
                    if (isLocallyHidden) {
                      return (
                        <div 
                          key={comment.id} 
                          className="p-3 border border-slate-150 rounded-lg bg-slate-100/50 text-slate-400 text-xs font-mono flex items-center gap-2"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                          <span>This comment was filtered automatically by the safety community settings.</span>
                        </div>
                      );
                    }

                    return (
                      <div 
                        key={comment.id}
                        className="group p-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50/50 transition-all duration-250 shadow-xxs"
                      >
                        
                        {/* Header of comment */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <img 
                              src={comment.author?.avatar || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80"} 
                              alt="" 
                              className="w-8 h-8 rounded-full object-cover border border-slate-100"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                                {comment.author?.name || "Anonymous"}
                                {comment.author?.role === "developer" && (
                                  <span className="text-[9px] px-1 py-0.2 rounded bg-indigo-100 text-indigo-700 font-mono">
                                    Author
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                {comment.author?.handle || "@anonymous"} • {comment.timestamp}
                              </div>
                            </div>
                          </div>

                          {/* Report/Flag abusive comment as Audience */}
                          <button
                            onClick={() => flagComment(comment.id)}
                            className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 px-2.5 py-1 rounded-md flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="Flag this comment as abusive or offensive"
                          >
                            <ShieldAlert className="w-3 h-3 text-rose-500" />
                            Report Abusive
                          </button>
                        </div>

                        {/* Comment Body */}
                        <div className="mt-3 text-slate-800 text-sm whitespace-pre-line leading-relaxed pl-1">
                          {comment.text}
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* LIVE COMMENT INPUT FOR PUBLIC AUDIENCE */}
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="mb-3">
                <h3 className="font-display font-semibold text-slate-800 text-sm flex items-center gap-1.5">
                  <MessageSquare className="w-4.5 h-4.5 text-indigo-500" />
                  Add public comment to thread
                </h3>
              </div>

              {apiError && (
                <div className="p-3 mb-4 rounded-lg bg-orange-100 text-orange-800 text-xs border border-orange-200">
                  ⚠️ {apiError}
                </div>
              )}

              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Share a civil response (తెలుగు మరియు ఇంగ్లీష్)..."
                  onKeyDown={(e) => {
                     if (e.key === "Enter" && !isSubmitting) handleAddComment(commentInput);
                  }}
                  className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-sm focus:outline-hidden transition-all placeholder:text-slate-400"
                  disabled={isSubmitting}
                />
                <button
                  onClick={() => handleAddComment(commentInput)}
                  disabled={isSubmitting || !commentInput.trim()}
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Auditing...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit
                    </>
                  )}
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* MODERATOR ROOM (PLAYGROUND + AUDIT SEQUENTIAL DESIGN) */
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* 1. Live Interview Analysis Bench (Playground) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="mb-4">
                <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase mb-2">
                  Auditor Console Active
                </div>
                <h3 className="font-display font-bold text-slate-900 text-lg flex items-center gap-1.5 leading-snug">
                  <Sliders className="w-5.5 h-5.5 text-indigo-500" />
                  Live Interview Analysis Bench (Playground)
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Evaluate custom comments in real-time. Test how the keyword matching, heuristic sentiment checks, and active Gemini 3.5 LLM models react.
                </p>
              </div>

              {/* QUICK PRESET TEMPLATES GRID */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 mb-4">
                {INTERVIEW_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => selectQuickPrompt(preset.text)}
                    className="p-3 text-left bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 hover:border-indigo-200 rounded-lg transition-all text-xs cursor-pointer h-16 flex flex-col justify-between"
                  >
                    <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                      <span>{preset.emoji}</span>
                      <span className="truncate">{preset.label}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 truncate italic w-full">"{preset.text}"</div>
                  </button>
                ))}
              </div>

              {/* API Error Notification */}
              {apiError && (
                <div className="p-3 mb-4 rounded-lg bg-orange-105 text-orange-800 text-xs border border-orange-200">
                  ⚠️ {apiError}
                </div>
              )}

              {/* Input section */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Type or click a preset above, then hit Evaluate..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !isSubmitting) handleAddComment(commentInput);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 focus:border-indigo-400 focus:bg-white rounded-xl text-sm focus:outline-hidden transition-all placeholder:text-slate-400"
                  disabled={isSubmitting}
                />
                <button
                  onClick={() => handleAddComment(commentInput)}
                  disabled={isSubmitting || !commentInput.trim()}
                  className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-xl text-sm font-semibold tracking-wide flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Evaluate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 2. AI Cognition Investigator */}
            <div className="bg-slate-900 text-white rounded-xl border border-slate-800 p-6 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 translate-x-3 -translate-y-3 opacity-10">
                <Flame className="w-32 h-32 text-rose-400" />
              </div>
              
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4.5 h-4.5 text-rose-400" />
                  <h3 className="font-display font-bold text-slate-100 text-sm tracking-widest uppercase font-mono">
                    AI Cognition Investigator
                  </h3>
                </div>
                <span className="text-[10px] font-mono bg-rose-500/20 text-rose-300 border border-rose-500/30 px-2.5 py-0.5 rounded">
                  Live Audit Output
                </span>
              </div>

              {inspectedComment ? (
                <div className="space-y-4">
                  
                  {/* Investigated Input Segment */}
                  <div>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1.5">
                      Evaluated String
                    </span>
                    <p className="text-sm text-slate-200 bg-slate-950/75 p-3.5 rounded-lg border border-slate-850 font-mono leading-relaxed whitespace-pre-line">
                      "{inspectedComment.text}"
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Severity meter */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-center">
                      <span className="block text-[8px] text-slate-400 font-mono uppercase tracking-widest mb-1.5">
                        Severity Score
                      </span>
                      <div className={`text-2xl font-bold ${
                        inspectedComment.severity > 75 
                          ? "text-rose-400" 
                          : inspectedComment.severity > 40 
                            ? "text-amber-400" 
                            : "text-emerald-400"
                      }`}>
                        {inspectedComment.severity}%
                      </div>
                      <div className="text-[9px] text-slate-400 font-mono mt-1">
                        {inspectedComment.isNegative ? "Shield Locked (Hidden)" : "Display Approved"}
                      </div>
                    </div>

                    {/* Assigned Category */}
                    <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-center">
                      <span className="block text-[8px] text-slate-400 font-mono uppercase tracking-widest mb-1.5">
                        Assigned Category
                      </span>
                      <div className="text-sm font-bold text-indigo-305 truncate tracking-wide capitalize">
                        {inspectedComment.category.replace("_", " ")}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1">
                        Engine: {inspectedComment.moderator}
                      </div>
                    </div>

                  </div>

                  {/* AI Explanation Text */}
                  <div>
                    <span className="block text-[10px] text-slate-400 font-mono uppercase tracking-widest mb-1.5">
                      Reasoning Rationale
                    </span>
                    <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-3.5 rounded-lg border border-slate-850">
                      {inspectedComment.explanation}
                    </p>
                  </div>

                  {/* Healthy alternative */}
                  {inspectedComment.suggestion && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                      <span className="block text-[10px] text-rose-300 font-mono uppercase tracking-widest mb-1.5">
                        Constructive Reframe Suggestion (ముద్దుగా తెలుగులో)
                      </span>
                      <p className="text-sm text-rose-100 italic leading-relaxed font-sans">
                        "{inspectedComment.suggestion}"
                      </p>
                    </div>
                  )}

                  {/* Manual Override Settings within Investigator */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono">
                      Manual Moderator Adjust:
                    </span>
                    <div className="flex gap-2">
                      {inspectedComment.isNegative ? (
                        <button
                          onClick={() => overrideApprove(inspectedComment.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer"
                        >
                          Override Approve
                        </button>
                      ) : (
                        <button
                          onClick={() => overrideHide(inspectedComment.id)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded text-xs transition-colors cursor-pointer"
                        >
                          Override Hide
                        </button>
                      )}
                      {(inspectedComment.isManuallyApproved || inspectedComment.isManuallyHidden) && (
                        <button
                          onClick={() => overrideReset(inspectedComment.id)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded text-xs cursor-pointer"
                        >
                          Reset Override
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Time metadata */}
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono pt-1">
                    <span>Evaluated at: {new Date(inspectedComment.timestamp).toLocaleTimeString()}</span>
                    <span>Latency: {inspectedComment.executionTimeMs} ms</span>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12">
                  <HelpCircle className="w-10 h-10 text-slate-700 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-mono">
                    Type or select a comment above to view its structured analysis parameters and Gemini explanations here.
                  </p>
                </div>
              )}
            </div>

            {/* QUICK BENCHMARK EXPLANATION IF IN MODERATOR ROOM */}
            <div className="p-4 bg-slate-150/50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed font-mono">
              💡 <strong>Simulating Audience feed?</strong> Switch over to <strong>Audience View</strong> status at the top to access full interactive comments threads, test reporting, and simulate real community members.
            </div>

          </div>
        )}

      </main>

      {/* 1. COMMUNITY MODERATION RULES MODAL */}
      {isSettingsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" 
          aria-labelledby="modal-title" 
          role="dialog" 
          aria-modal="true"
          onClick={() => setIsSettingsOpen(false)}
        >
          <div 
            className="relative bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-slate-200 z-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-display font-bold text-slate-900 text-base">
                      Community Moderation Rules
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* MODAL CONFIG FIELDS */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono mb-1.5">
                      1. Moderation Engine Mode
                    </label>
                    <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
                      <button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, mode: "keywords" }))}
                        className={`py-1.5 px-2 rounded-md text-xs font-medium text-center transition-all cursor-pointer ${
                          config.mode === "keywords" 
                            ? "bg-white text-slate-900 shadow-xs" 
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Keywords Only
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, mode: "heuristics" }))}
                        className={`py-1.5 px-2 rounded-md text-xs font-medium text-center transition-all cursor-pointer ${
                          config.mode === "heuristics" 
                            ? "bg-white text-slate-900 shadow-xs" 
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        Heuristics
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfig(prev => ({ ...prev, mode: "gemini" }))}
                        className={`py-1.5 px-2 rounded-md text-xs font-semibold text-center transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          config.mode === "gemini" 
                            ? "bg-indigo-600 text-white shadow-xs" 
                            : "text-slate-500 hover:text-slate-900"
                        }`}
                      >
                        <Sparkles className="w-3 h-3" />
                        Gemini LLM
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono">
                        2. Filtering Sensitivity Threshold
                      </label>
                      <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-55 px-1.5 py-0.5 rounded">
                        {config.threshold}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="100"
                      value={config.threshold}
                      onChange={(e) => setConfig(prev => ({ ...prev, threshold: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-650"
                    />
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mt-1">
                      <span>Permissive (100%)</span>
                      <span>Aggressive (1%)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-widest font-mono mb-1.5">
                      3. Custom Toxic Keyword Blacklist
                    </label>
                    <form onSubmit={handleAddKeyword} className="flex gap-1.5">
                      <input
                        type="text"
                        placeholder="Add trigger word..."
                        value={keywordInput}
                        onChange={(e) => setKeywordInput(e.target.value)}
                        className="flex-1 text-xs px-2.5 py-1.5 bg-slate-50 border border-slate-200 focus:border-indigo-400 rounded-md focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        className="px-3 bg-slate-850 hover:bg-slate-700 text-white text-xs rounded-md cursor-pointer"
                      >
                        Add
                      </button>
                    </form>
                    
                    <div className="flex flex-wrap gap-1.5 mt-2.5 max-h-[100px] overflow-y-auto">
                      {config.customKeywords.map(word => (
                        <span 
                          key={word} 
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-100 text-slate-700 border border-slate-200"
                        >
                          {word}
                          <button 
                            type="button" 
                            onClick={() => handleRemoveKeyword(word)}
                            className="text-slate-400 hover:text-slate-600 text-[10px] font-bold cursor-pointer"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                      {config.customKeywords.length === 0 && (
                        <span className="text-[10px] text-slate-400 italic">
                          No custom words. (Using system defaults)
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Save Rules
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* 2. MODERATION ANALYTICS MODAL */}
      {isAnalyticsOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto" 
          aria-labelledby="modal-title" 
          role="dialog" 
          aria-modal="true"
          onClick={() => setIsAnalyticsOpen(false)}
        >
          <div 
            className="relative bg-white rounded-xl text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:max-w-lg sm:w-full border border-slate-200 z-10 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-indigo-500" />
                    <h3 className="font-display font-bold text-slate-900 text-base">
                      Moderation Analytics
                    </h3>
                  </div>
                  <button 
                    onClick={() => setIsAnalyticsOpen(false)}
                    className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-605 transition-colors cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* MODAL CONFIG FIELDS */}
                <div className="space-y-4">
                  
                  {/* Visual Stats Row */}
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2.5 bg-slate-50 rounded-lg">
                      <div className="text-xl font-display font-medium text-slate-900">
                        {totalCommentsCount}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono font-medium">Comments</div>
                    </div>
                    <div className="p-2.5 bg-rose-50 rounded-lg border border-rose-100/60">
                      <div className="text-xl font-display font-medium text-rose-700">
                        {filteredCount}
                      </div>
                      <div className="text-[10px] text-rose-550 font-mono font-medium">Shielded</div>
                    </div>
                    <div className="p-2.5 bg-emerald-50 rounded-lg border border-emerald-100/60">
                      <div className="text-xl font-display font-medium text-emerald-700">
                        {safeCount}
                      </div>
                      <div className="text-[10px] text-emerald-555 font-mono font-medium">Visible</div>
                    </div>
                  </div>

                  {/* Sentiment Distribution Custom Bar */}
                  <div>
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono mb-1.5">
                      Sentiment Distribution Profile
                    </span>
                    
                    {totalCommentsCount === 0 ? (
                      <div className="h-6 bg-slate-100 rounded-md flex items-center justify-center text-[10px] text-slate-400 italic">
                        No data to chart
                      </div>
                    ) : (
                      <div>
                        <div className="h-4 rounded-lg overflow-hidden flex">
                          <div 
                            style={{ width: `${pctPositive}%` }} 
                            className="bg-emerald-500 hover:opacity-90 transition-all" 
                            title={`Positive: ${pctPositive}%`} 
                          />
                          <div 
                            style={{ width: `${pctNeutral}%` }} 
                            className="bg-slate-350 hover:opacity-90 transition-all" 
                            title={`Neutral: ${pctNeutral}%`} 
                          />
                          <div 
                            style={{ width: `${pctNegative}%` }} 
                            className="bg-rose-500 hover:opacity-90 transition-all" 
                            title={`Negative: ${pctNegative}%`} 
                          />
                        </div>
                        
                        <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono mt-2">
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-emerald-500" />
                            Positive ({pctPositive}%)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-slate-350" />
                            Neutral ({pctNeutral}%)
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="w-2 h-2 rounded bg-rose-500" />
                            Negative ({pctNegative}%)
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Latency Comparison List */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono">
                        Classification Mean Latency
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        Latest: ~{averageLatency} ms
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 space-y-1.5 font-mono">
                      <div className="flex items-center justify-between">
                        <span>⚡ Keywords Base matching:</span>
                        <span className="text-emerald-350 font-bold">&lt;1 ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>🤖 Heuristic Token parsing:</span>
                        <span className="text-emerald-700 font-bold">2-4 ms</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>🧠 Gemini LLM active Shield:</span>
                        <span className="text-indigo-600 font-bold">~150-300 ms</span>
                      </div>
                    </div>
                  </div>

                  {/* Blocked Category Breakdown */}
                  <div className="border-t border-slate-100 pt-3">
                    <span className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest font-mono mb-2">
                      Blocked Category Breakdown
                    </span>
                    
                    <div className="space-y-1.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">🔥 Harassment / Abuse:</span>
                        <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${categoriesMap.harassment > 0 ? "bg-rose-100 text-rose-700" : "text-slate-400 bg-slate-100"}`}>
                          {categoriesMap.harassment}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-505">⚠️ Hate Speech:</span>
                        <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${categoriesMap.hate_speech > 0 ? "bg-red-100 text-red-700" : "text-slate-400 bg-slate-100"}`}>
                          {categoriesMap.hate_speech}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">🤬 Pure Profanity:</span>
                        <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${categoriesMap.profanity > 0 ? "bg-orange-100 text-orange-700" : "text-slate-400 bg-slate-105"}`}>
                          {categoriesMap.profanity}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">💸 Spam / Promotional:</span>
                        <span className={`font-mono font-bold px-1.5 py-0.2 rounded ${categoriesMap.spam > 0 ? "bg-amber-100 text-amber-700" : "text-slate-400 bg-slate-100"}`}>
                          {categoriesMap.spam}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setIsAnalyticsOpen(false)}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* FOOTER */}
      <footer className="mt-12 border-t border-slate-205 bg-white py-6 text-center text-xs text-slate-400 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 font-medium">
          <span>Social Media Automated Comment Shield (GenAI Demonstration)</span>
          <span>Crafted for high-fidelity evaluation environments</span>
        </div>
      </footer>

    </div>
  );
}
