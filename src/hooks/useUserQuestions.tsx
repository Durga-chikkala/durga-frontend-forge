
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface Question {
  id: string;
  title: string;
  question: string;
  answer: string | null;
  status: string;
  is_public: boolean;
  created_at: string;
}

export const useUserQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchQuestions = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching user questions:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const createQuestion = async (title: string, question: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          user_id: user.id,
          title,
          question,
          status: 'pending'
        });

      if (error) throw error;
      await fetchQuestions();
      return true;
    } catch (error) {
      console.error('Error creating question:', error);
      return false;
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  return { questions, loading, refetch: fetchQuestions, createQuestion };
};
