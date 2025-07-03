
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
}

export const useLearningPath = () => {
  const [pathItems, setPathItems] = useState<PathItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchLearningPath = useCallback(async () => {
    if (!user) return;

    try {
      // Get course content to build learning path
      const { data: courseData } = await supabase
        .from('course_content')
        .select('*')
        .eq('is_published', true)
        .order('week_number', { ascending: true });

      // Get user progress
      const { data: progressData } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id);

      const completedWeeks = progressData?.map(p => p.week_number) || [];
      const maxCompletedWeek = Math.max(...completedWeeks, 0);

      const items: PathItem[] = courseData?.map((content, index) => {
        const weekNumber = content.week_number || index + 1;
        let status: 'completed' | 'current' | 'locked' = 'locked';
        
        if (completedWeeks.includes(weekNumber)) {
          status = 'completed';
        } else if (weekNumber === maxCompletedWeek + 1) {
          status = 'current';
        }

        return {
          id: content.id,
          title: content.title,
          description: content.description || 'Learn essential concepts',
          status,
          week: weekNumber,
          estimatedTime: `${8 + weekNumber * 2} hours`
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
