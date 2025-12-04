import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { QuizDisplay } from './QuizDisplay';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Link as LinkIcon, Loader2, BookOpen } from 'lucide-react';
import type { Quiz } from '@/types/quiz';

export function GenerateTab() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!url.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter a Wikipedia article URL",
        variant: "destructive",
      });
      return;
    }

    if (!url.includes('wikipedia.org')) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid Wikipedia URL",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setQuiz(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-quiz', {
        body: { url: url.trim() }
      });

      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      // Transform the data to match our Quiz type
      const quizData: Quiz = {
        id: data.id,
        url: data.url,
        title: data.title,
        summary: data.summary || '',
        key_entities: data.key_entities || {},
        sections: data.sections || [],
        quiz: data.quiz || [],
        related_topics: data.related_topics || [],
        created_at: data.created_at,
      };

      setQuiz(quizData);
      toast({
        title: "Quiz Generated!",
        description: `Created ${quizData.quiz.length} questions from "${quizData.title}"`,
      });
    } catch (error: any) {
      console.error('Error generating quiz:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuiz(null);
    setUrl('');
  };

  if (quiz) {
    return (
      <div className="space-y-6">
        <Button variant="outline" onClick={handleReset} className="mb-4">
          ← Generate Another Quiz
        </Button>
        <QuizDisplay quiz={quiz} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-hero shadow-glow mb-4">
          <BookOpen className="w-8 h-8 text-primary-foreground" />
        </div>
        <h2 className="text-3xl font-serif font-bold">Generate a Quiz</h2>
        <p className="text-muted-foreground text-lg">
          Enter a Wikipedia article URL and we'll create an interactive quiz for you
        </p>
      </div>

      <Card className="border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="w-5 h-5 text-primary" />
            Wikipedia URL
          </CardTitle>
          <CardDescription>
            Paste any Wikipedia article URL to generate questions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="url"
            placeholder="https://en.wikipedia.org/wiki/Alan_Turing"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="h-12 text-base"
            disabled={isLoading}
          />
          <Button 
            onClick={handleGenerate} 
            disabled={isLoading}
            className="w-full h-12 text-base gradient-primary text-primary-foreground gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card className="border-0 shadow-lg animate-pulse-soft">
          <CardContent className="p-8 text-center space-y-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/10 mb-2">
              <Sparkles className="w-6 h-6 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground">
              Fetching article content and generating questions...
            </p>
            <p className="text-sm text-muted-foreground/70">
              This may take a few moments
            </p>
          </CardContent>
        </Card>
      )}

      <div className="text-center text-sm text-muted-foreground">
        <p>Try these examples:</p>
        <div className="flex flex-wrap justify-center gap-2 mt-2">
          {[
            'Alan_Turing',
            'Marie_Curie',
            'World_War_II',
            'Quantum_computing'
          ].map((topic) => (
            <button
              key={topic}
              onClick={() => setUrl(`https://en.wikipedia.org/wiki/${topic}`)}
              className="px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
            >
              {topic.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
