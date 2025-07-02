
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface QuestionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuestionModal = ({ isOpen, onClose }: QuestionModalProps) => {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both title and question',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          title: title.trim(),
          question: question.trim(),
          user_id: user!.id,
          status: 'pending'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Your question has been submitted successfully!',
      });

      setTitle('');
      setQuestion('');
      onClose();
    } catch (error) {
      console.error('Error submitting question:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setTitle('');
    setQuestion('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="w-5 h-5" />
            Ask a Question
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="question-title">Question Title</Label>
            <Input
              id="question-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter a brief title for your question"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="question-content">Your Question</Label>
            <Textarea
              id="question-content"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Describe your question in detail. Include any relevant context or specific issues you're facing."
              rows={6}
              required
            />
          </div>
          
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex items-center gap-2">
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Question
            </Button>
          </div>
        </form>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Tips for better responses:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Be specific about the problem you're facing</li>
            <li>• Include relevant code snippets or error messages</li>
            <li>• Mention what you've already tried</li>
            <li>• Ask one question at a time for clarity</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
