
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, MessageCircle, Calendar, BookOpen } from 'lucide-react';
import { StudyMaterialsModal } from './StudyMaterialsModal';
import { ScheduleModal } from './ScheduleModal';
import { QuestionModal } from './QuestionModal';
import { DownloadsModal } from './DownloadsModal';

export const QuickActions = () => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const actions = [
    {
      icon: BookOpen,
      label: 'Study Materials',
      description: 'Access all resources',
      action: () => setActiveModal('materials'),
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      icon: Calendar,
      label: 'Schedule',
      description: 'View upcoming sessions',
      action: () => setActiveModal('schedule'),
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      icon: MessageCircle,
      label: 'Ask Question',
      description: 'Get help from mentor',
      action: () => setActiveModal('question'),
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      icon: Download,
      label: 'Downloads',
      description: 'Course materials',
      action: () => setActiveModal('downloads'),
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  return (
    <>
      <Card className="mb-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`${action.color} text-white p-4 h-auto flex-col gap-2 hover:scale-105 transition-all duration-200`}
              >
                <action.icon className="w-5 h-5" />
                <div className="text-center">
                  <div className="font-medium text-xs">{action.label}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <StudyMaterialsModal 
        isOpen={activeModal === 'materials'} 
        onClose={() => setActiveModal(null)} 
      />
      <ScheduleModal 
        isOpen={activeModal === 'schedule'} 
        onClose={() => setActiveModal(null)} 
      />
      <QuestionModal 
        isOpen={activeModal === 'question'} 
        onOpenChange={(open) => setActiveModal(open ? 'question' : null)} 
      />
      <DownloadsModal 
        isOpen={activeModal === 'downloads'} 
        onClose={() => setActiveModal(null)} 
      />
    </>
  );
};
