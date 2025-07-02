
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { MessageSquare, ThumbsUp, Eye, Clock, Users } from 'lucide-react';

interface ForumPost {
  id: string;
  title: string;
  author: string;
  authorInitials: string;
  content: string;
  category: string;
  likes: number;
  replies: number;
  views: number;
  timeAgo: string;
  tags: string[];
}

export const DiscussionForum = () => {
  const [posts] = useState<ForumPost[]>([
    {
      id: '1',
      title: 'Best practices for React component organization?',
      author: 'Sarah Chen',
      authorInitials: 'SC',
      content: 'I\'m working on a large React project and wondering about the best way to organize components...',
      category: 'React',
      likes: 12,
      replies: 8,
      views: 45,
      timeAgo: '2 hours ago',
      tags: ['react', 'best-practices', 'organization']
    },
    {
      id: '2',
      title: 'CSS Grid vs Flexbox - When to use what?',
      author: 'Mike Johnson',
      authorInitials: 'MJ',
      content: 'I\'m still confused about when to use CSS Grid vs Flexbox. Can someone explain the differences?',
      category: 'CSS',
      likes: 8,
      replies: 15,
      views: 67,
      timeAgo: '4 hours ago',
      tags: ['css', 'grid', 'flexbox', 'layout']
    },
    {
      id: '3',
      title: 'JavaScript async/await vs Promises',
      author: 'Emma Wilson',
      authorInitials: 'EW',
      content: 'What are the advantages of using async/await over traditional promise chains?',
      category: 'JavaScript',
      likes: 15,
      replies: 12,
      views: 89,
      timeAgo: '6 hours ago',
      tags: ['javascript', 'async', 'promises']
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'react': return 'bg-blue-100 text-blue-800';
      case 'css': return 'bg-green-100 text-green-800';
      case 'javascript': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
          {posts.map((post) => (
            <div key={post.id} className="p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors cursor-pointer">
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="text-xs bg-purple-100 text-purple-700">
                    {post.authorInitials}
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
                    {post.content}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-3 h-3" />
                      {post.likes}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {post.replies}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {post.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {post.timeAgo}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1 mt-2">
                    {post.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs px-1.5 py-0.5">
                        #{tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-center mt-4">
          <Button variant="outline" size="sm">
            View All Discussions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
