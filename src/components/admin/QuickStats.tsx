
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Calendar, MessageCircle } from 'lucide-react';

interface StatsProps {
  stats: {
    materials: number;
    questions: number;
    sessions: number;
    users: number;
  };
}

export const QuickStats = ({ stats }: StatsProps) => {
  const statItems = [
    {
      title: 'Study Materials',
      value: stats.materials,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Questions & Answers',
      value: stats.questions,
      icon: MessageCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Scheduled Sessions',
      value: stats.sessions,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      title: 'Registered Users',
      value: stats.users,
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
      {statItems.map((item, index) => (
        <Card key={index} className={`bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] ${item.borderColor} border-l-4`}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className={`p-2 sm:p-3 rounded-lg ${item.bgColor} flex-shrink-0`}>
                <item.icon className={`w-5 h-5 sm:w-6 sm:h-6 ${item.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm text-gray-600 mb-1 truncate">{item.title}</p>
                <p className={`text-xl sm:text-2xl font-bold ${item.color}`}>{item.value}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
