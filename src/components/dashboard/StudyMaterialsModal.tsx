
import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen, Download, ExternalLink, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface StudyMaterial {
  id: string;
  title: string;
  description: string | null;
  file_url: string | null;
  file_type: string | null;
  week_number: number | null;
}

interface StudyMaterialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StudyMaterialsModal = ({ isOpen, onClose }: StudyMaterialsModalProps) => {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      fetchMaterials();
    }
  }, [isOpen]);

  const fetchMaterials = async () => {
    try {
      const { data, error } = await supabase
        .from('study_materials')
        .select('*')
        .eq('is_published', true)
        .order('week_number', { ascending: true });

      if (error) throw error;
      setMaterials(data || []);
    } catch (error) {
      console.error('Error fetching materials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load study materials',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (material: StudyMaterial) => {
    if (material.file_url) {
      window.open(material.file_url, '_blank');
    } else {
      toast({
        title: 'No File Available',
        description: 'This material does not have a downloadable file',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Study Materials
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-2">Loading materials...</p>
            </div>
          ) : materials.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No Materials Available</h3>
              <p className="text-gray-500">Study materials will be published here as they become available.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {materials.map((material) => (
                <Card key={material.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{material.title}</CardTitle>
                        {material.week_number && (
                          <p className="text-sm text-gray-600 mt-1">Week {material.week_number}</p>
                        )}
                      </div>
                      {material.file_type && (
                        <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          <FileText className="w-3 h-3" />
                          {material.file_type.toUpperCase()}
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {material.description && (
                      <p className="text-gray-700 mb-4">{material.description}</p>
                    )}
                    <div className="flex gap-2">
                      {material.file_url && (
                        <Button
                          onClick={() => handleDownload(material)}
                          className="flex items-center gap-2"
                          size="sm"
                        >
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      )}
                      {material.file_url && (
                        <Button
                          onClick={() => window.open(material.file_url!, '_blank')}
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View Online
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
