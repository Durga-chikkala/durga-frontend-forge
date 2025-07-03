
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Heart, Reply, Plus, Send, MessageCircle } from 'lucide-react';
import { useDiscussionPosts } from '@/hooks/useDiscussionPosts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ForumReply {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
  };
}

export const DiscussionForum = () => {
  const { posts, loading, refetch } = useDiscussionPosts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [creating, setCreating] = useState(false);
  const [expandedPost, setExpandedPost] = useState<string | null>(null);
  const [replies, setReplies] = useState<Record<string, ForumReply[]>>({});
  const [newReply, setNewReply] = useState<Record<string, string>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostTitle.trim() || !newPostContent.trim() || !user) return;

    setCreating(true);
    try {
      const { error } = await supabase
        .from('discussion_posts')
        .insert({
          title: newPostTitle.trim(),
          content: newPostContent.trim(),
          user_id: user.id,
          category: 'general'
        });

      if (error) throw error;

      toast({
        title: 'Success! 🎉',
        description: 'Your post has been created successfully!',
      });

      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
      refetch();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const fetchReplies = async (postId: string) => {
    if (loadingReplies[postId]) return;
    
    setLoadingReplies(prev => ({ ...prev, [postId]: true }));
    try {
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          profiles!discussion_replies_user_id_fkey(full_name)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(prev => ({ ...prev, [postId]: data || [] }));
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [postId]: false }));
    }
  };

  const handleReply = async (postId: string) => {
    const replyContent = newReply[postId]?.trim();
    if (!replyContent || !user) return;

    try {
      const { error } = await supabase
        .from('discussion_replies')
        .insert({
          post_id: postId,
          content: replyContent,
          user_id: user.id
        });

      if (error) throw error;

      toast({
        title: 'Reply Added! 💬',
        description: 'Your reply has been posted successfully!',
      });

      setNewReply(prev => ({ ...prev, [postId]: '' }));
      fetchReplies(postId); // Refresh replies
    } catch (error) {
      console.error('Error adding reply:', error);
      toast({
        title: 'Error',
        description: 'Failed to add reply. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const togglePostExpansion = (postId: string) => {
    if (expandedPost === postId) {
      setExpandedPost(null);
    } else {
      setExpandedPost(postId);
      fetchReplies(postId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader className="border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-gray-900">Discussion Forum</CardTitle>
              <p className="text-sm text-gray-600 mt-1">Connect with your learning community</p>
            </div>
          </div>
          <Button
            onClick={() => setShowCreatePost(!showCreatePost)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 font-medium shadow-sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Discussion
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Start a New Discussion</h3>
            <div>
              <Input
                placeholder="What's your discussion topic?"
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="Share your thoughts, questions, or insights with the community..."
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                className="border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                required
              />
            </div>
            <div className="flex gap-3 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreatePost(false)}
                className="px-6"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 px-6 flex items-center gap-2"
              >
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post Discussion
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading discussions...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">No Discussions Yet</h3>
              <p className="text-gray-500">Be the first to start a meaningful conversation!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg hover:text-blue-600 cursor-pointer">
                          {post.title}
                        </h4>
                        <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 text-blue-700 border-blue-200">
                          {post.category}
                        </Badge>
                      </div>
                      <p className="text-gray-700 mb-4 leading-relaxed">
                        {expandedPost === post.id ? post.content : `${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center gap-4">
                      <span className="font-medium">by {post.profiles?.full_name || 'Unknown User'}</span>
                      <span>{formatDate(post.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4" />
                        {post.likes_count || 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4" />
                        {post.replies_count || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePostExpansion(post.id)}
                      className="flex items-center gap-2"
                    >
                      <Reply className="w-4 h-4" />
                      {expandedPost === post.id ? 'Hide Replies' : 'View Discussion'}
                    </Button>
                  </div>

                  {expandedPost === post.id && (
                    <>
                      <Separator className="my-4" />
                      
                      {/* Replies Section */}
                      <div className="space-y-4">
                        {loadingReplies[post.id] ? (
                          <div className="text-center py-4">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                          </div>
                        ) : (
                          replies[post.id]?.map((reply) => (
                            <div key={reply.id} className="bg-gray-50 rounded-lg p-4 ml-6">
                              <p className="text-gray-800 mb-2">{reply.content}</p>
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">{reply.profiles?.full_name || 'Unknown User'}</span>
                                <span className="mx-2">•</span>
                                <span>{formatDate(reply.created_at)}</span>
                              </div>
                            </div>
                          ))
                        )}

                        {/* Reply Input */}
                        <div className="flex gap-3 ml-6">
                          <Textarea
                            placeholder="Add your reply..."
                            value={newReply[post.id] || ''}
                            onChange={(e) => setNewReply(prev => ({ ...prev, [post.id]: e.target.value }))}
                            rows={2}
                            className="flex-1"
                          />
                          <Button
                            onClick={() => handleReply(post.id)}
                            disabled={!newReply[post.id]?.trim()}
                            className="self-end"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
