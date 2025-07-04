
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
      console.log('Fetching discussion posts...');
      setLoading(true);
      
      const { data, error } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching posts:', error);
        // Fallback: try without inner join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('discussion_posts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (fallbackError) {
          console.error('Fallback fetch also failed:', fallbackError);
          setPosts([]);
          return;
        }

        // Process fallback data and try to get user info separately
        const processedFallbackPosts = await Promise.all(
          (fallbackData || []).map(async (post) => {
            const { data: profile } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', post.user_id)
              .single();

            return {
              ...post,
              profiles: profile,
              display_name: profile?.full_name || profile?.email?.split('@')[0] || 'Anonymous User'
            };
          })
        );

        console.log('Processed fallback posts:', processedFallbackPosts);
        setPosts(processedFallbackPosts);
        return;
      }

      console.log('Raw posts data:', data);

      if (!data || data.length === 0) {
        console.log('No posts found');
        setPosts([]);
        return;
      }

      // Process posts to ensure proper display names
      const processedPosts = data.map(post => {
        let displayName = 'Anonymous User';
        
        if (post.profiles) {
          if (post.profiles.full_name) {
            displayName = post.profiles.full_name;
          } else if (post.profiles.email) {
            displayName = post.profiles.email.split('@')[0];
          }
        }

        return {
          ...post,
          display_name: displayName
        };
      });

      console.log('Processed posts:', processedPosts);
      setPosts(processedPosts);
    } catch (error) {
      console.error('Error in fetchPosts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(async (title: string, content: string, category: string = 'general') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('User not authenticated');
        return false;
      }

      const { data, error } = await supabase
        .from('discussion_posts')
        .insert({
          title,
          content,
          category,
          user_id: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating post:', error);
        return false;
      }

      console.log('Post created successfully:', data);
      fetchPosts(); // Refresh posts
      return true;
    } catch (error) {
      console.error('Error in createPost:', error);
      return false;
    }
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts, createPost };
};
