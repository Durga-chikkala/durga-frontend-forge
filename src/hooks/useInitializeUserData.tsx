
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const useInitializeUserData = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initializeUserData = async () => {
      if (!user) return;

      try {
        // Check if user has any progress data
        const { data: existingProgress } = await supabase
          .from('user_progress')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        // If no progress data exists, create initial entry
        if (!existingProgress || existingProgress.length === 0) {
          console.log('Creating initial progress data for user:', user.id);
          
          const { error } = await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              week_number: 1,
              total_points: Math.floor(Math.random() * 500) + 50, // Random points between 50-550
              study_streak: Math.floor(Math.random() * 10) + 1, // Random streak 1-10
              is_completed: false
            });

          if (error) {
            console.error('Error creating initial progress:', error);
          } else {
            console.log('Initial progress data created successfully');
          }
        }

        // Check if user has any activity data
        const { data: existingActivity } = await supabase
          .from('user_activities')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        // If no activity data exists, create initial entry
        if (!existingActivity || existingActivity.length === 0) {
          console.log('Creating initial activity data for user:', user.id);
          
          const { error } = await supabase
            .from('user_activities')
            .insert({
              user_id: user.id,
              activity_type: 'login',
              description: 'User logged in for the first time',
              points_earned: 10
            });

          if (error) {
            console.error('Error creating initial activity:', error);
          } else {
            console.log('Initial activity data created successfully');
          }
        }
      } catch (error) {
        console.error('Error initializing user data:', error);
      }
    };

    initializeUserData();
  }, [user]);
};
