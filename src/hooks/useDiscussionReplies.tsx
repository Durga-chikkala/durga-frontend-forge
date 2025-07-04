
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface DiscussionReply {
  id: string;
  post_id: string;
  content: string;
  user_id: string;
  likes_count: number;
  created_at: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  display_name: string;
}

export const useDiscussionReplies = (postId: string) => {
  const [replies, setReplies] = useState<DiscussionReply[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchReplies = useCallback(async () => {
    if (!postId) return;

    try {
      console.log('Fetching replies for post:', postId);
      setLoading(true);
      
      const { data, error } = await supabase
        .from('discussion_replies')
        .select(`
          *,
          profiles(full_name, email)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching replies:', error);
        setReplies([]);
        return;
      }

      console.log('Raw replies data:', data);

      if (!data || data.length === 0) {
        console.log('No replies found for post:', postId);
        setReplies([]);
        return;
      }

      // Process replies to ensure proper display names
      const processedReplies = data.map(reply => {
        let displayName = 'Anonymous User';
        
        if (reply.profiles) {
          if (reply.profiles.full_name) {
            displayName = reply.profiles.full_name;
          } else if (reply.profiles.email) {
            displayName = reply.profiles.email.split('@')[0];
          }
        }

        return {
          ...reply,
          display_name: displayName
        };
      });

      console.log('Processed replies:', processedReplies);
      setReplies(processedReplies);
    } catch (error) {
      console.error('Error in fetchReplies:', error);
      setReplies([]);
    } finally {
      setLoading(false);
    }
  }, [postId]);

  const createReply = useCallback(async (content: string) => {
    if (!user || !postId || !content.trim()) {
      console.error('Missing required data for reply creation');
      return false;
    }

    try {
      console.log('Creating reply for post:', postId);
      
      const { data, error } = await supabase
        .from('discussion_replies')
        .insert({
          post_id: postId,
          content: content.trim(),
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating reply:', error);
        return false;
      }

      console.log('Reply created successfully:', data);
      
      // Update the replies count in the discussion post
      const { error: updateError } = await supabase
        .from('discussion_posts')
        .update({ 
          replies_count: supabase.raw('replies_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', postId);

      if (updateError) {
        console.error('Error updating replies count:', updateError);
      }

      // Refresh replies list
      fetchReplies();
      return true;
    } catch (error) {
      console.error('Error in createReply:', error);
      return false;
    }
  }, [user, postId, fetchReplies]);

  const likeReply = useCallback(async (replyId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('discussion_replies')
        .update({ 
          likes_count: supabase.raw('likes_count + 1')
        })
        .eq('id', replyId);

      if (error) {
        console.error('Error liking reply:', error);
        return false;
      }

      // Refresh replies to show updated like count
      fetchReplies();
      return true;
    } catch (error) {
      console.error('Error in likeReply:', error);
      return false;
    }
  }, [user, fetchReplies]);

  useEffect(() => {
    if (postId) {
      fetchReplies();
    }
  }, [fetchReplies, postId]);

  return { replies, loading, createReply, likeReply, refetch: fetchReplies };
};
