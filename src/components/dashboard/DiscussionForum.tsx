
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, Heart, Clock, Plus, TrendingUp } from 'lucide-react';
import { useDiscussionPosts } from '@/hooks/useDiscussionPosts';
import { formatDistanceToNow } from 'date-fns';

export const DiscussionForum = () => {
  const { posts, loading, refetch } = useDiscussionPosts();

  const getCategoryColor = (category: string) => {
    const colors = {
      general: 'bg-blue-100 text-blue-800',
      help: 'bg-red-100 text-red-800',
      showcase: 'bg-green-100 text-green-800',
      feedback: 'bg-purple-100 text-purple-800'
    };
    return colors[category as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Anonymous User') return 'AU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Discussion Forum
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg border bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-green-600" />
            Discussion Forum
            <Badge variant="secondary" className="ml-2">
              {posts.length} posts
            </Badge>
          </CardTitle>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => {
              console.log('Refreshing discussion posts...');
              refetch();
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!posts || posts.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No discussions yet</p>
              <p className="text-sm text-gray-400">Start a conversation with your peers!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div
                key={post.id}
                className="p-4 rounded-lg border border-gray-200 hover:border-green-300 transition-all duration-200 cursor-pointer hover:shadow-md bg-white"
              >
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 border-2 border-green-100">
                    <AvatarFallback className="bg-green-100 text-green-700 text-sm font-semibold">
                      {getInitials(post.display_name || 'Anonymous User')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 truncate">{post.title || 'Untitled'}</h4>
                      <Badge className={`text-xs px-2 py-1 ${getCategoryColor(post.category || 'general')}`}>
                        {post.category || 'general'}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {post.content || 'No content available'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-green-600">
                          {post.display_name || 'Anonymous User'}
                        </span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {post.created_at 
                              ? formatDistanceToNow(new Date(post.created_at), { addSuffix: true })
                              : 'Unknown time'
                            }
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>{post.likes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          <span>{post.replies_count || 0}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {posts && posts.length > 0 && (
          <div className="mt-6 text-center">
            <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50">
              <TrendingUp className="w-4 h-4 mr-2" />
              View All Discussions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
