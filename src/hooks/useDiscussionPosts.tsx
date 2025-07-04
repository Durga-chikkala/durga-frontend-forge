
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string;
    email: string;
  } | null;
  display_name: string;
}

export const useDiscussionPosts = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          profiles!discussion_posts_user_id_fkey(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      // Process posts to ensure proper display names
      const processedPosts = (data || []).map(post => {
        let displayName = 'Anonymous User';
        
        if (post.profiles?.full_name) {
          displayName = post.profiles.full_name;
        } else if (post.profiles?.email) {
          displayName = post.profiles.email.split('@')[0];
        }

        return {
          ...post,
          display_name: displayName
        };
      });

      console.log('Discussion posts:', processedPosts);
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error fetching discussion posts:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts };
};
