
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export const useInitializeUserData = () => {
  const { user } = useAuth();

  useEffect(() => {
    const initializeUserData = async () => {
      if (!user) return;

      try {
        console.log('Initializing user data for:', user.id);

        // Check if profile exists
        const { data: existingProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Error checking profile:', profileError);
          return;
        }

        // Create profile if it doesn't exist
        if (!existingProfile) {
          console.log('Creating profile for user:', user.id);
          const { error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
            });

          if (insertError) {
            console.error('Error creating profile:', insertError);
          } else {
            console.log('Profile created successfully');
          }
        }

        // Check if user role exists
        const { data: existingRole, error: roleError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (roleError && roleError.code !== 'PGRST116') {
          console.error('Error checking user role:', roleError);
          return;
        }

        // Create default user role if it doesn't exist
        if (!existingRole) {
          console.log('Creating default role for user:', user.id);
          const { error: roleInsertError } = await supabase
            .from('user_roles')
            .insert({
              user_id: user.id,
              role: 'student'
            });

          if (roleInsertError) {
            console.error('Error creating user role:', roleInsertError);
          } else {
            console.log('User role created successfully');
          }
        }

        // Initialize user progress for week 1 if it doesn't exist
        const { data: existingProgress, error: progressError } = await supabase
          .from('user_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('week_number', 1)
          .single();

        if (progressError && progressError.code !== 'PGRST116') {
          console.error('Error checking user progress:', progressError);
          return;
        }

        if (!existingProgress) {
          console.log('Creating initial progress for user:', user.id);
          const { error: progressInsertError } = await supabase
            .from('user_progress')
            .insert({
              user_id: user.id,
              week_number: 1,
              total_points: 0,
              study_streak: 0,
              is_completed: false
            });

          if (progressInsertError) {
            console.error('Error creating user progress:', progressInsertError);
          } else {
            console.log('User progress created successfully');
          }
        }

        // Create a welcome activity
        const { data: existingActivity, error: activityCheckError } = await supabase
          .from('user_activities')
          .select('*')
          .eq('user_id', user.id)
          .eq('activity_type', 'login')
          .limit(1);

        if (!activityCheckError && (!existingActivity || existingActivity.length === 0)) {
          console.log('Creating welcome activity for user:', user.id);
          const { error: activityInsertError } = await supabase
            .from('user_activities')
            .insert({
              user_id: user.id,
              activity_type: 'login',
              description: 'Welcome to the platform!',
              points_earned: 10
            });

          if (activityInsertError) {
            console.error('Error creating welcome activity:', activityInsertError);
          } else {
            console.log('Welcome activity created successfully');
          }
        }

      } catch (error) {
        console.error('Error initializing user data:', error);
      }
    };

    initializeUserData();
  }, [user]);
};
