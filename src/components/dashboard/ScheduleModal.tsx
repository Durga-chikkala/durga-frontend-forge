
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Users, ExternalLink, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface ScheduledSession {
  id: string;
  title: string;
  description: string | null;
  session_date: string;
  meeting_link: string | null;
  max_participants: number | null;
  current_participants: number | null;
  is_registered?: boolean;
}

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ScheduleModal = ({ isOpen, onClose }: ScheduleModalProps) => {
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && user) {
      fetchSessions();
    }
  }, [isOpen, user]);

  const fetchSessions = async () => {
    try {
      const { data: sessionsData, error: sessionsError } = await supabase
        .from('scheduled_sessions')
        .select('*')
        .eq('is_active', true)
        .gte('session_date', new Date().toISOString())
        .order('session_date', { ascending: true });

      if (sessionsError) throw sessionsError;

      // Check user registrations
      const { data: registrations } = await supabase
        .from('session_registrations')
        .select('session_id')
        .eq('user_id', user!.id);

      const registeredSessionIds = new Set(registrations?.map(r => r.session_id) || []);

      const sessionsWithRegistration = sessionsData?.map(session => ({
        ...session,
        is_registered: registeredSessionIds.has(session.id)
      })) || [];

      setSessions(sessionsWithRegistration);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load scheduled sessions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('session_registrations')
        .insert({
          session_id: sessionId,
          user_id: user!.id
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Successfully registered for the session!',
      });

      fetchSessions(); // Refresh the list
    } catch (error) {
      console.error('Error registering for session:', error);
      toast({
        title: 'Error',
        description: 'Failed to register for session',
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Sessions
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Upcoming Sessions</h3>
              <p className="text-gray-500">New sessions will be scheduled and posted here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {sessions.map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatDate(session.session_date)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatTime(session.session_date)}
                          </div>
                          {session.max_participants && (
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {session.current_participants || 0}/{session.max_participants}
                            </div>
                          )}
                        </div>
                      </div>
                      {session.is_registered && (
                        <Badge className="bg-green-100 text-green-800">
                          Registered
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {session.description && (
                      <p className="text-gray-700 mb-4">{session.description}</p>
                    )}
                    <div className="flex gap-2">
                      {!session.is_registered ? (
                        <Button
                          onClick={() => handleRegister(session.id)}
                          className="flex items-center gap-2"
                          disabled={session.max_participants && (session.current_participants || 0) >= session.max_participants}
                        >
                          <Users className="w-4 h-4" />
                          Register
                        </Button>
                      ) : (
                        <Button variant="outline" disabled>
                          <Users className="w-4 h-4 mr-2" />
                          Registered
                        </Button>
                      )}
                      {session.meeting_link && session.is_registered && (
                        <Button
                          onClick={() => window.open(session.meeting_link!, '_blank')}
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          Join Meeting
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
