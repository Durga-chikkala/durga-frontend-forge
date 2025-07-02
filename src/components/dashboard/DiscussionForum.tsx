
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Heart, Reply, Plus, Send } from 'lucide-react';
import { useDiscussionPosts } from '@/hooks/useDiscussionPosts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export const DiscussionForum = () => {
  const { posts, loading, refetch } = useDiscussionPosts();
  const { user } = useAuth();
  const { toast } = useToast();
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [creating, setCreating] = useState(false);

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
        title: 'Success',
        description: 'Your post has been created!',
      });

      setNewPostTitle('');
      setNewPostContent('');
      setShowCreatePost(false);
      refetch();
    } catch (error) {
      console.error('Error creating post:', error);
      toast({
        title: 'Error',
        description: 'Failed to create post',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Discussion Forum
          </CardTitle>
          <Button
            onClick={() => setShowCreatePost(!showCreatePost)}
            size="sm"
            className="flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showCreatePost && (
          <form onSubmit={handleCreatePost} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
            <div>
              <Input
                placeholder="Post title..."
                value={newPostTitle}
                onChange={(e) => setNewPostTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Textarea
                placeholder="What would you like to discuss?"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                rows={4}
                required
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreatePost(false)}
                size="sm"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating} size="sm" className="flex items-center gap-2">
                {creating ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Post
              </Button>
            </div>
          </form>
        )}

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2 text-sm">Loading discussions...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Discussions Yet</h3>
              <p className="text-gray-500 text-sm">Be the first to start a discussion!</p>
            </div>
          ) : (
            posts.slice(0, 5).map((post) => (
              <div key={post.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                    {post.title}
                  </h4>
                  <Badge variant="outline" className="text-xs">
                    {post.category}
                  </Badge>
                </div>
                <p className="text-gray-700 text-sm mb-3 line-clamp-2">
                  {post.content}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span>by {post.profiles?.full_name || 'Unknown User'}</span>
                    <span>{formatDate(post.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Heart className="w-3 h-3" />
                      {post.likes_count || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <Reply className="w-3 h-3" />
                      {post.replies_count || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
