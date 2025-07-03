
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useUserQuestions } from '@/hooks/useUserQuestions';
import { MessageCircle, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface QuestionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuestionModal = ({ isOpen, onOpenChange }: QuestionModalProps) => {
  const [title, setTitle] = useState('');
  const [question, setQuestion] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { questions, loading, createQuestion, refetch } = useUserQuestions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) return;

    setIsSubmitting(true);
    try {
      const success = await createQuestion(title.trim(), question.trim());
      if (success) {
        toast({
          title: 'Question Submitted! 📝',
          description: 'Your question has been submitted and will be answered soon.',
        });
        setTitle('');
        setQuestion('');
        refetch();
      } else {
        throw new Error('Failed to submit question');
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit question. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'pending': return <Clock className="w-4 h-4 text-orange-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-100 text-green-800 border-green-200';
      case 'pending': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <MessageCircle className="w-6 h-6 text-blue-600" />
            Ask a Question
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-6">
          {/* Submit New Question */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Submit New Question</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Question Title</label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Brief title for your question..."
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Your Question</label>
                  <Textarea
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder="Describe your question in detail..."
                    rows={6}
                    className="w-full"
                    disabled={isSubmitting}
                  />
                </div>
                <Button
                  type="submit"
                  disabled={!title.trim() || !question.trim() || isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Question'}
                </Button>
              </form>
            </div>
          </div>

          {/* My Questions */}
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">My Questions</h3>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse p-4 bg-gray-100 rounded-lg">
                      <div className="h-4 bg-gray-300 rounded mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              ) : questions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-lg font-medium">No questions yet</p>
                  <p className="text-sm">Submit your first question to get help!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {questions.map((q) => (
                    <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h4 className="font-semibold text-gray-900 flex-1">{q.title}</h4>
                        <Badge variant="outline" className={`flex items-center gap-1 ${getStatusColor(q.status)}`}>
                          {getStatusIcon(q.status)}
                          {q.status}
                        </Badge>
                      </div>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{q.question}</p>
                      {q.answer && (
                        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="font-medium text-green-800 mb-1">Answer:</h5>
                          <p className="text-green-700 text-sm">{q.answer}</p>
                        </div>
                      )}
                      <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                        <span>Asked {new Date(q.created_at).toLocaleDateString()}</span>
                        {q.is_public && (
                          <Badge variant="outline" className="text-xs">Public</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
