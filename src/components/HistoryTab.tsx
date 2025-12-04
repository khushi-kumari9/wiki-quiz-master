import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QuizDisplay } from './QuizDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { History, Eye, ExternalLink, Loader2, Clock, HelpCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { Quiz } from '@/types/quiz';

export function HistoryTab() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Transform the data to match our Quiz type
      const transformedQuizzes: Quiz[] = (data || []).map(item => ({
        id: item.id,
        url: item.url,
        title: item.title,
        summary: item.summary || '',
        key_entities: (item.key_entities as any) || {},
        sections: item.sections || [],
        quiz: (item.quiz as any) || [],
        related_topics: item.related_topics || [],
        created_at: item.created_at,
      }));

      setQuizzes(transformedQuizzes);
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to load quiz history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (quizzes.length === 0) {
    return (
      <Card className="border-0 shadow-lg">
        <CardContent className="py-16 text-center">
          <History className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Quizzes Yet</h3>
          <p className="text-muted-foreground">
            Generate your first quiz from the "Generate Quiz" tab
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-serif font-bold flex items-center gap-2">
              <History className="w-6 h-6 text-primary" />
              Quiz History
            </h2>
            <p className="text-muted-foreground mt-1">
              Browse and review your previously generated quizzes
            </p>
          </div>
          <Badge variant="secondary" className="text-base px-4 py-2">
            {quizzes.length} {quizzes.length === 1 ? 'Quiz' : 'Quizzes'}
          </Badge>
        </div>

        <Card className="border-0 shadow-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Title</TableHead>
                <TableHead className="font-semibold">Questions</TableHead>
                <TableHead className="font-semibold">Created</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {quizzes.map((quiz) => (
                <TableRow key={quiz.id} className="group hover:bg-muted/30">
                  <TableCell>
                    <div className="space-y-1">
                      <span className="font-medium">{quiz.title}</span>
                      <a
                        href={quiz.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                      >
                        Wikipedia <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="info" className="gap-1">
                      <HelpCircle className="w-3 h-3" />
                      {quiz.quiz?.length || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {format(new Date(quiz.created_at), 'MMM d, yyyy')}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedQuiz(quiz)}
                      className="gap-2 opacity-70 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-4 h-4" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={!!selectedQuiz} onOpenChange={() => setSelectedQuiz(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Quiz Details</DialogTitle>
          </DialogHeader>
          {selectedQuiz && (
            <QuizDisplay quiz={selectedQuiz} onClose={() => setSelectedQuiz(null)} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
