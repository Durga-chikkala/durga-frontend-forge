
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, Calendar, Target } from 'lucide-react';

export const StudyStreak = () => {
  const currentStreak = 7;
  const longestStreak = 15;
  const weekData = [
    { day: 'Mon', studied: true },
    { day: 'Tue', studied: true },
    { day: 'Wed', studied: false },
    { day: 'Thu', studied: true },
    { day: 'Fri', studied: true },
    { day: 'Sat', studied: true },
    { day: 'Sun', studied: true },
  ];

  return (
    <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-600" />
          Study Streak
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Current Streak */}
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-1">
              {currentStreak}
            </div>
            <p className="text-sm text-gray-600">Days Current Streak</p>
            <Badge variant="outline" className="mt-2 bg-orange-100 text-orange-800 border-orange-300">
              🔥 On Fire!
            </Badge>
          </div>

          {/* Week View */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              This Week
            </h4>
            <div className="grid grid-cols-7 gap-1">
              {weekData.map((day, index) => (
                <div key={index} className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
                    day.studied 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    ✓
                  </div>
                  <span className="text-xs text-gray-600">{day.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-orange-200">
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">{longestStreak}</div>
              <p className="text-xs text-gray-600">Longest Streak</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-gray-900">85%</div>
              <p className="text-xs text-gray-600">Weekly Goal</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
