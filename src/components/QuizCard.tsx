import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QuizQuestion } from '@/types/quiz';

interface QuizCardProps {
  question: QuizQuestion;
  questionNumber: number;
  totalQuestions: number;
  selectedAnswer?: string;
  onSelectAnswer: (answer: string) => void;
  showResult: boolean;
  isQuizMode?: boolean;
}

export function QuizCard({
  question,
  questionNumber,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  showResult,
  isQuizMode = false,
}: QuizCardProps) {
  const isCorrect = selectedAnswer === question.answer;
  const difficultyVariant = question.difficulty as 'easy' | 'medium' | 'hard';

  return (
    <Card className="overflow-hidden border-0 shadow-lg animate-scale-in">
      <CardHeader className="gradient-primary text-primary-foreground pb-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium opacity-90">
            Question {questionNumber} of {totalQuestions}
          </span>
          <Badge variant={difficultyVariant} className="capitalize">
            {question.difficulty}
          </Badge>
        </div>
        <h3 className="text-xl font-serif font-semibold mt-2 leading-relaxed">
          {question.question}
        </h3>
      </CardHeader>
      <CardContent className="p-6 space-y-3">
        {question.options.map((option, index) => {
          const optionLetter = String.fromCharCode(65 + index);
          const isSelected = selectedAnswer === option;
          const isCorrectAnswer = option === question.answer;
          const showCorrectness = showResult || (!isQuizMode && isSelected);

          return (
            <Button
              key={index}
              variant="outline"
              className={cn(
                "w-full justify-start text-left h-auto py-4 px-4 font-normal transition-all duration-200",
                isSelected && !showCorrectness && "border-primary bg-primary/5",
                showCorrectness && isCorrectAnswer && "border-success bg-success/10 text-success",
                showCorrectness && isSelected && !isCorrectAnswer && "border-destructive bg-destructive/10 text-destructive",
                !isSelected && !showCorrectness && "hover:border-primary/50 hover:bg-primary/5"
              )}
              onClick={() => !showResult && onSelectAnswer(option)}
              disabled={showResult}
            >
              <span className="flex items-center gap-3 w-full">
                <span className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-full text-sm font-semibold shrink-0",
                  isSelected && !showCorrectness && "bg-primary text-primary-foreground",
                  showCorrectness && isCorrectAnswer && "bg-success text-success-foreground",
                  showCorrectness && isSelected && !isCorrectAnswer && "bg-destructive text-destructive-foreground",
                  !isSelected && !showCorrectness && "bg-muted"
                )}>
                  {showCorrectness && isCorrectAnswer ? (
                    <Check className="w-4 h-4" />
                  ) : showCorrectness && isSelected && !isCorrectAnswer ? (
                    <X className="w-4 h-4" />
                  ) : (
                    optionLetter
                  )}
                </span>
                <span className="flex-1">{option}</span>
              </span>
            </Button>
          );
        })}

        {(showResult || (!isQuizMode && selectedAnswer)) && (
          <div className={cn(
            "mt-6 p-4 rounded-lg animate-fade-in",
            isCorrect || !selectedAnswer ? "bg-success/10 border border-success/20" : "bg-muted"
          )}>
            <p className="text-sm font-medium mb-1">
              {isCorrect ? "✓ Correct!" : selectedAnswer ? "✗ Incorrect" : "Explanation:"}
            </p>
            <p className="text-sm text-muted-foreground">
              {question.explanation}
            </p>
            {!isCorrect && selectedAnswer && (
              <p className="text-sm mt-2">
                <span className="font-medium">Correct answer:</span> {question.answer}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
