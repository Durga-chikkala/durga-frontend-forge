
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ForumPost {
  id: string;
  title: string;
  content: string;
  category: string;
  likes_count: number;
  replies_count: number;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

export const useDiscussionPosts = () => {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const { data, error } = await supabase
          .from('discussion_posts')
          .select(`
            *,
            profiles!discussion_posts_user_id_fkey(full_name)
          `)
          .order('created_at', { ascending: false })
          .limit(10);

        if (error) throw error;
        setPosts(data || []);
      } catch (error) {
        console.error('Error fetching discussion posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return { posts, loading };
};
