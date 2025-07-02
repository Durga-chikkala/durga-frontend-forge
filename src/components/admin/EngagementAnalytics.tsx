
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Users, MessageSquare, Trophy, Activity, Target } from 'lucide-react';

export const EngagementAnalytics = () => {
  const engagementMetrics = [
    {
      title: 'Forum Activity',
      value: '156',
      change: '+23%',
      trend: 'up',
      icon: MessageSquare,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Study Streaks',
      value: '89%',
      change: '+12%',
      trend: 'up',
      icon: Activity,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Achievements Earned',
      value: '234',
      change: '+34%',
      trend: 'up',
      icon: Trophy,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50'
    },
    {
      title: 'Goal Completion',
      value: '76%',
      change: '+8%',
      trend: 'up',
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  const topPerformers = [
    { name: 'Alex Rivera', score: 2850, badge: '🔥 Top Streak' },
    { name: 'Sam Chen', score: 2720, badge: '🚀 Most Active' },
    { name: 'Jordan Kim', score: 2650, badge: '🎯 Goal Master' },
    { name: 'Maria Lopez', score: 2340, badge: '💡 Helper' }
  ];

  const weeklyEngagement = [
    { day: 'Mon', active: 85, forum: 23, achievements: 12 },
    { day: 'Tue', active: 92, forum: 28, achievements: 15 },
    { day: 'Wed', active: 78, forum: 19, achievements: 8 },
    { day: 'Thu', active: 88, forum: 31, achievements: 18 },
    { day: 'Fri', active: 95, forum: 35, achievements: 22 },
    { day: 'Sat', active: 67, forum: 15, achievements: 9 },
    { day: 'Sun', active: 71, forum: 18, achievements: 11 }
  ];

  return (
    <div className="space-y-6">
      {/* Engagement Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {engagementMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                  </div>
                  <Badge variant="outline" className="text-xs text-green-700 bg-green-50">
                    {metric.change}
                  </Badge>
                </div>
                <div className="mt-3">
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="text-sm text-gray-600">{metric.title}</div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-600" />
              Top Performers This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPerformers.map((performer, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{performer.name}</div>
                      <div className="text-xs text-gray-600">{performer.badge}</div>
                    </div>
                  </div>
                  <div className="font-bold text-gray-900">{performer.score}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Engagement Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Weekly Engagement Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyEngagement.map((day, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{day.day}</span>
                    <span className="text-gray-600">{day.active}% active</span>
                  </div>
                  <div className="space-y-1">
                    <Progress value={day.active} className="h-2" />
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Forum: {day.forum}</span>
                      <span>Achievements: {day.achievements}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engagement Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Engagement Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-800 mb-2">✅ What's Working</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Forum discussions increased by 23%</li>
                <li>• 89% of students maintaining study streaks</li>
                <li>• Achievement system driving 34% more engagement</li>
              </ul>
            </div>
            <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-semibold text-orange-800 mb-2">⚠️ Areas for Improvement</h4>
              <ul className="text-sm text-orange-700 space-y-1">
                <li>• Weekend engagement drops by 25%</li>
                <li>• 24% of students haven't joined discussions</li>
                <li>• Goal completion rates vary by 40%</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
