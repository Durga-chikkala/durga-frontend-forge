
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PathItem {
  id: string;
  title: string;
  description: string;
  status: 'completed' | 'current' | 'locked';
  week: number;
  estimatedTime: string;
  sessionDate?: string;
}

export const useLearningPath = () => {
  const [pathItems, setPathItems] = useState<PathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLearningPath = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      // Get course content to build learning path
      const { data: courseData } = await supabase
        .from('course_content')
        .select('*')
        .eq('is_published', true)
        .order('week_number', { ascending: true });

      // Get user's completed sessions
      const { data: completedSessions } = await supabase
        .from('user_study_sessions')
        .select('content_id')
        .eq('user_id', user.id)
        .eq('completed', true);

      const completedContentIds = new Set(completedSessions?.map(s => s.content_id) || []);

      // Get user progress to determine current week
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('week_number, is_completed')
        .eq('user_id', user.id);

      const completedWeeks = new Set(
        progressData?.filter(p => p.is_completed).map(p => p.week_number) || []
      );
      const maxCompletedWeek = Math.max(...Array.from(completedWeeks), 0);

      const items: PathItem[] = courseData?.map((content, index) => {
        const weekNumber = content.week_number || index + 1;
        let status: 'completed' | 'current' | 'locked' = 'locked';
        
        if (completedContentIds.has(content.id) || completedWeeks.has(weekNumber)) {
          status = 'completed';
        } else if (weekNumber === maxCompletedWeek + 1 || (maxCompletedWeek === 0 && weekNumber === 1)) {
          status = 'current';
        }

        return {
          id: content.id,
          title: content.title,
          description: content.description || 'Learn essential frontend concepts',
          status,
          week: weekNumber,
          estimatedTime: `${Math.max(6, weekNumber * 2)} hours`,
          sessionDate: content.session_date || undefined
        };
      }) || [];

      setPathItems(items);
    } catch (error) {
      console.error('Error fetching learning path:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchLearningPath();
  }, [fetchLearningPath]);

  return { pathItems, loading, refetch: fetchLearningPath };
};
