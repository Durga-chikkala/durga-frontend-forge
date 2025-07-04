
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Activity {
  id: string;
  activity_type: string;
  description: string;
  created_at: string;
  points_earned: number;
}

export const useUserActivities = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        console.log('Fetching user activities for user:', user.id);
        
        const { data, error } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(15);

        if (error) {
          console.error('Error fetching activities:', error);
          setActivities([]);
          return;
        }

        console.log('Activities fetched:', data);
        setActivities(data || []);
      } catch (error) {
        console.error('Error in fetchActivities:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [user]);

  const createActivity = async (activityType: string, description: string, pointsEarned: number = 0) => {
    if (!user) return false;

    try {
      const { data, error } = await supabase
        .from('user_activities')
        .insert({
          user_id: user.id,
          activity_type: activityType,
          description,
          points_earned: pointsEarned
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating activity:', error);
        return false;
      }

      console.log('Activity created:', data);
      // Add the new activity to the beginning of the list
      setActivities(prev => [data, ...prev.slice(0, 14)]);
      return true;
    } catch (error) {
      console.error('Error in createActivity:', error);
      return false;
    }
  };

  return { activities, loading, createActivity };
};
