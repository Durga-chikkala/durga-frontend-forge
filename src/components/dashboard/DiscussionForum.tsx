
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, Eye, Clock, Users } from 'lucide-react';
import { useDiscussionPosts } from '@/hooks/useDiscussionPosts';
import { formatDistanceToNow } from 'date-fns';

export const DiscussionForum = () => {
  const { posts, loading } = useDiscussionPosts();

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'help': return 'bg-red-100 text-red-800';
      case 'showcase': return 'bg-blue-100 text-blue-800';
      case 'discussion': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-600" />
              Discussion Forum
            </CardTitle>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              New Post
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse p-4 rounded-lg border border-gray-200">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2 w-3/4"></div>
                    <div className="flex gap-4">
                      <div className="h-3 bg-gray-300 rounded w-12"></div>
                      <div className="h-3 bg-gray-300 rounded w-12"></div>
                    </div>
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
    <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-purple-600" />
            Discussion Forum
          </CardTitle>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            New Post
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {posts.length === 0 ? (
            <div className="text-center py-8">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No discussions yet</p>
              <p className="text-sm text-gray-400">Be the first to start a conversation!</p>
            </div>
          ) : (
            posts.map((post) => (
              <div key={post.id} className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                      {getInitials(post.profiles?.full_name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-sm text-gray-900 truncate">
                        {post.title}
                      </h4>
                      <Badge className={`text-xs px-2 py-0.5 ${getCategoryColor(post.category)}`}>
                        {post.category}
                      </Badge>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                      {post.content.length > 100 ? `${post.content.substring(0, 100)}...` : post.content}
                    </p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3" />
                        {post.likes_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        {post.replies_count}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {posts.length > 0 && (
          <div className="text-center mt-4">
            <Button variant="outline" size="sm">
              View All Discussions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
