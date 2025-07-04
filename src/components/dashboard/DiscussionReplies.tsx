
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Heart, Send, MessageCircle } from 'lucide-react';
import { useDiscussionReplies } from '@/hooks/useDiscussionReplies';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/hooks/useAuth';

interface DiscussionRepliesProps {
  postId: string;
  isExpanded: boolean;
}

export const DiscussionReplies = ({ postId, isExpanded }: DiscussionRepliesProps) => {
  const { replies, loading, createReply, likeReply } = useDiscussionReplies(postId);
  const [newReplyContent, setNewReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

  const getInitials = (name: string) => {
    if (!name || name === 'Anonymous User') return 'AU';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const handleSubmitReply = async () => {
    if (!newReplyContent.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const success = await createReply(newReplyContent);
    
    if (success) {
      setNewReplyContent('');
    }
    setIsSubmitting(false);
  };

  const handleLikeReply = async (replyId: string) => {
    await likeReply(replyId);
  };

  if (!isExpanded) return null;

  return (
    <div className="mt-4 pl-4 border-l-2 border-green-100">
      {/* Reply Form */}
      {user && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg">
          <Textarea
            placeholder="Write a reply..."
            value={newReplyContent}
            onChange={(e) => setNewReplyContent(e.target.value)}
            className="mb-2 min-h-[80px] resize-none"
            rows={3}
          />
          <div className="flex justify-end">
            <Button 
              onClick={handleSubmitReply}
              disabled={isSubmitting || !newReplyContent.trim()}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Send className="w-4 h-4 mr-1" />
              {isSubmitting ? 'Posting...' : 'Reply'}
            </Button>
          </div>
        </div>
      )}

      {/* Replies List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="animate-pulse p-3 bg-gray-50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-3 bg-gray-300 rounded mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : replies.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          <MessageCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p>No replies yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {replies.map((reply) => (
            <div
              key={reply.id}
              className="p-3 bg-white rounded-lg border border-gray-100 hover:border-green-200 transition-colors"
            >
              <div className="flex items-start gap-3">
                <Avatar className="w-8 h-8 border border-green-100">
                  <AvatarFallback className="bg-green-100 text-green-700 text-xs font-semibold">
                    {getInitials(reply.display_name)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-green-600 text-sm">
                      {reply.display_name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700 mb-2 whitespace-pre-wrap">
                    {reply.content}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleLikeReply(reply.id)}
                      className="h-6 px-2 text-xs hover:bg-red-50 hover:text-red-600"
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      {reply.likes_count || 0}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
