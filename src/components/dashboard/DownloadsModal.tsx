
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, FileText, Video, BookOpen, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DownloadItem {
  id: string;
  title: string;
  description: string | null;
  type: 'material' | 'video' | 'content';
  url: string;
  file_type?: string | null;
  week_number?: number | null;
}

interface DownloadsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DownloadsModal = ({ isOpen, onClose }: DownloadsModalProps) => {
  const [downloads, setDownloads] = useState<DownloadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchDownloads();
    }
  }, [isOpen]);

  const fetchDownloads = async () => {
    try {
      const downloadItems: DownloadItem[] = [];

      // Fetch study materials
      const { data: materials } = await supabase
        .from('study_materials')
        .select('*')
        .eq('is_published', true)
        .not('file_url', 'is', null);

      materials?.forEach(material => {
        downloadItems.push({
          id: material.id,
          title: material.title,
          description: material.description,
          type: 'material',
          url: material.file_url!,
          file_type: material.file_type,
          week_number: material.week_number
        });
      });

      // Fetch course content with video links
      const { data: content } = await supabase
        .from('course_content')
        .select('*')
        .eq('is_published', true)
        .not('gdrive_video_links', 'is', null);

      content?.forEach(item => {
        const videoLinks = Array.isArray(item.gdrive_video_links) 
          ? item.gdrive_video_links.filter((link): link is string => typeof link === 'string')
          : [];
        
        videoLinks.forEach((link, index) => {
          downloadItems.push({
            id: `${item.id}-video-${index}`,
            title: `${item.title} - Video ${index + 1}`,
            description: item.description,
            type: 'video',
            url: link,
            week_number: item.week_number
          });
        });
      });

      setDownloads(downloadItems.sort((a, b) => (a.week_number || 0) - (b.week_number || 0)));
    } catch (error) {
      console.error('Error fetching downloads:', error);
      toast({
        title: 'Error',
        description: 'Failed to load downloads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (item: DownloadItem) => {
    window.open(item.url, '_blank');
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'video':
        return Video;
      case 'material':
        return FileText;
      default:
        return BookOpen;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800';
      case 'material':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5" />
            Downloads & Resources
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading downloads...</p>
            </div>
          ) : downloads.length === 0 ? (
            <div className="text-center py-8">
              <Download className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Downloads Available</h3>
              <p className="text-gray-500">Course materials and videos will be available for download here.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {downloads.map((item) => {
                const Icon = getIcon(item.type);
                return (
                  <Card key={item.id} className="hover:shadow-md transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-start">
                        <div className="flex items-start gap-3">
                          <Icon className="w-5 h-5 mt-1 text-gray-600" />
                          <div>
                            <CardTitle className="text-lg">{item.title}</CardTitle>
                            {item.week_number && (
                              <p className="text-sm text-gray-600 mt-1">Week {item.week_number}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getTypeColor(item.type)}>
                            {item.type === 'video' ? 'Video' : item.file_type || 'File'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {item.description && (
                        <p className="text-gray-700 mb-4">{item.description}</p>
                      )}
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDownload(item)}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <ExternalLink className="w-4 h-4" />
                          {item.type === 'video' ? 'Watch' : 'Download'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
