import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { QuizCard } from './QuizCard';
import { 
  BookOpen, 
  Users, 
  Building2, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Trophy,
  RotateCcw,
  Play,
  ExternalLink
} from 'lucide-react';
import type { Quiz, QuizState } from '@/types/quiz';

interface QuizDisplayProps {
  quiz: Quiz;
  onClose?: () => void;
}

export function QuizDisplay({ quiz, onClose }: QuizDisplayProps) {
  const [mode, setMode] = useState<'view' | 'take'>('view');
  const [quizState, setQuizState] = useState<QuizState>({
    currentQuestionIndex: 0,
    selectedAnswers: {},
    showResults: false,
    score: 0,
  });

  const handleSelectAnswer = (answer: string) => {
    if (mode === 'view') {
      setQuizState(prev => ({
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [prev.currentQuestionIndex]: answer
        }
      }));
    } else {
      setQuizState(prev => ({
        ...prev,
        selectedAnswers: {
          ...prev.selectedAnswers,
          [prev.currentQuestionIndex]: answer
        }
      }));
    }
  };

  const handleNext = () => {
    if (quizState.currentQuestionIndex < quiz.quiz.length - 1) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex + 1
      }));
    }
  };

  const handlePrevious = () => {
    if (quizState.currentQuestionIndex > 0) {
      setQuizState(prev => ({
        ...prev,
        currentQuestionIndex: prev.currentQuestionIndex - 1
      }));
    }
  };

  const handleSubmitQuiz = () => {
    const score = quiz.quiz.reduce((acc, q, i) => {
      return acc + (quizState.selectedAnswers[i] === q.answer ? 1 : 0);
    }, 0);
    setQuizState(prev => ({
      ...prev,
      showResults: true,
      score
    }));
  };

  const handleReset = () => {
    setQuizState({
      currentQuestionIndex: 0,
      selectedAnswers: {},
      showResults: false,
      score: 0,
    });
  };

  const handleStartQuiz = () => {
    setMode('take');
    handleReset();
  };

  const currentQuestion = quiz.quiz[quizState.currentQuestionIndex];
  const answeredCount = Object.keys(quizState.selectedAnswers).length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-serif font-bold text-foreground">{quiz.title}</h2>
            <a 
              href={quiz.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mt-1"
            >
              View on Wikipedia <ExternalLink className="w-3 h-3" />
            </a>
          </div>
          {mode === 'view' ? (
            <Button onClick={handleStartQuiz} className="gradient-primary text-primary-foreground gap-2">
              <Play className="w-4 h-4" /> Take Quiz
            </Button>
          ) : (
            <Button variant="outline" onClick={() => setMode('view')}>
              Exit Quiz Mode
            </Button>
          )}
        </div>

        {/* Summary */}
        <Card className="border-0 shadow-md">
          <CardContent className="p-4">
            <p className="text-muted-foreground leading-relaxed">{quiz.summary}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="quiz" className="w-full">
        <TabsList className="w-full justify-start h-12 p-1 bg-muted/50">
          <TabsTrigger value="quiz" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Quiz Questions
          </TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Article Info
          </TabsTrigger>
          <TabsTrigger value="related" className="data-[state=active]:bg-card data-[state=active]:shadow-sm">
            Related Topics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="quiz" className="mt-6 space-y-6">
          {quizState.showResults ? (
            <Card className="border-0 shadow-lg overflow-hidden">
              <CardHeader className="gradient-hero text-primary-foreground text-center py-8">
                <Trophy className="w-16 h-16 mx-auto mb-4 opacity-90" />
                <CardTitle className="text-3xl font-serif">Quiz Complete!</CardTitle>
              </CardHeader>
              <CardContent className="p-8 text-center space-y-6">
                <div className="text-6xl font-bold text-primary">
                  {quizState.score}/{quiz.quiz.length}
                </div>
                <p className="text-xl text-muted-foreground">
                  {quizState.score === quiz.quiz.length 
                    ? "Perfect score! You're an expert! 🎉" 
                    : quizState.score >= quiz.quiz.length * 0.7 
                      ? "Great job! You know your stuff! 👏" 
                      : "Keep learning! Practice makes perfect! 📚"}
                </p>
                <div className="flex gap-4 justify-center pt-4">
                  <Button onClick={handleReset} variant="outline" className="gap-2">
                    <RotateCcw className="w-4 h-4" /> Review Answers
                  </Button>
                  <Button onClick={handleStartQuiz} className="gradient-primary text-primary-foreground gap-2">
                    <Play className="w-4 h-4" /> Try Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Progress indicator */}
              {mode === 'take' && (
                <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Progress:</span>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full gradient-primary transition-all duration-300"
                      style={{ width: `${(answeredCount / quiz.quiz.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium">{answeredCount}/{quiz.quiz.length}</span>
                </div>
              )}

              {currentQuestion && (
                <QuizCard
                  question={currentQuestion}
                  questionNumber={quizState.currentQuestionIndex + 1}
                  totalQuestions={quiz.quiz.length}
                  selectedAnswer={quizState.selectedAnswers[quizState.currentQuestionIndex]}
                  onSelectAnswer={handleSelectAnswer}
                  showResult={quizState.showResults}
                  isQuizMode={mode === 'take'}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={quizState.currentQuestionIndex === 0}
                  className="gap-2"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="flex gap-2">
                  {quiz.quiz.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setQuizState(prev => ({ ...prev, currentQuestionIndex: i }))}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-all ${
                        i === quizState.currentQuestionIndex
                          ? 'gradient-primary text-primary-foreground'
                          : quizState.selectedAnswers[i]
                            ? 'bg-primary/20 text-primary'
                            : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                {quizState.currentQuestionIndex === quiz.quiz.length - 1 && mode === 'take' ? (
                  <Button
                    onClick={handleSubmitQuiz}
                    disabled={answeredCount < quiz.quiz.length}
                    className="gradient-primary text-primary-foreground gap-2"
                  >
                    Submit Quiz <Trophy className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    onClick={handleNext}
                    disabled={quizState.currentQuestionIndex === quiz.quiz.length - 1}
                    className="gap-2"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-6">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Key Entities */}
            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="w-5 h-5 text-primary" /> People
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quiz.key_entities?.people?.map((person, i) => (
                    <Badge key={i} variant="secondary">{person}</Badge>
                  )) || <span className="text-muted-foreground text-sm">No people mentioned</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="w-5 h-5 text-primary" /> Organizations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quiz.key_entities?.organizations?.map((org, i) => (
                    <Badge key={i} variant="secondary">{org}</Badge>
                  )) || <span className="text-muted-foreground text-sm">No organizations mentioned</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MapPin className="w-5 h-5 text-primary" /> Locations
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quiz.key_entities?.locations?.map((location, i) => (
                    <Badge key={i} variant="secondary">{location}</Badge>
                  )) || <span className="text-muted-foreground text-sm">No locations mentioned</span>}
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-primary" /> Sections
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {quiz.sections?.map((section, i) => (
                    <Badge key={i} variant="info">{section}</Badge>
                  )) || <span className="text-muted-foreground text-sm">No sections found</span>}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="related" className="mt-6">
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="text-lg">Explore Related Topics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {quiz.related_topics?.map((topic, i) => (
                  <a
                    key={i}
                    href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topic.replace(/ /g, '_'))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-primary/5 transition-all group"
                  >
                    <BookOpen className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="font-medium group-hover:text-primary transition-colors">{topic}</span>
                    <ExternalLink className="w-4 h-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </a>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
