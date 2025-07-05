
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
      console.log('Fetching all discussion posts with user profiles...');
      setLoading(true);
      
      // Fetch posts with proper join to profiles
      const { data, error } = await supabase
        .from('discussion_posts')
        .select(`
          *,
          profiles!inner(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching posts with inner join:', error);
        
        // Fallback: try without inner join
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('discussion_posts')
          .select('*')
          .order('created_at', { ascending: false });

        if (fallbackError) {
          console.error('Fallback query failed:', fallbackError);
          setPosts([]);
          return;
        }

        // Get profile data separately for fallback posts
        const postsWithProfiles = await Promise.all(
          (fallbackData || []).map(async (post) => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('full_name, email')
              .eq('id', post.user_id)
              .single();

            return {
              ...post,
              profiles: profileData,
              display_name: profileData?.full_name || profileData?.email?.split('@')[0] || 'Anonymous User'
            };
          })
        );

        setPosts(postsWithProfiles);
        return;
      }

      // Process successful data
      const processedPosts = (data || []).map(post => ({
        ...post,
        display_name: post.profiles?.full_name || post.profiles?.email?.split('@')[0] || 'Anonymous User'
      }));

      console.log('Successfully fetched posts:', processedPosts.length);
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

      const { error } = await supabase
        .from('discussion_posts')
        .insert({
          title,
          content,
          category,
          user_id: user.id
        });

      if (error) {
        console.error('Error creating post:', error);
        return false;
      }

      console.log('Post created successfully');
      fetchPosts(); // Refresh posts
      return true;
    } catch (error) {
      console.error('Error in createPost:', error);
      return false;
    }
  }, [fetchPosts]);

  const likePost = useCallback(async (postId: string) => {
    try {
      const { data: currentPost } = await supabase
        .from('discussion_posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (!currentPost) return false;

      const { error } = await supabase
        .from('discussion_posts')
        .update({ 
          likes_count: (currentPost.likes_count || 0) + 1
        })
        .eq('id', postId);

      if (error) {
        console.error('Error liking post:', error);
        return false;
      }

      fetchPosts(); // Refresh posts
      return true;
    } catch (error) {
      console.error('Error in likePost:', error);
      return false;
    }
  }, [fetchPosts]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return { posts, loading, refetch: fetchPosts, createPost, likePost };
};
