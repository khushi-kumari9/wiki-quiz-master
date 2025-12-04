import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GenerateTab } from '@/components/GenerateTab';
import { HistoryTab } from '@/components/HistoryTab';
import { Sparkles, History, Brain } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Header */}
      <header className="relative overflow-hidden gradient-hero py-12 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="container max-w-5xl mx-auto relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm">
              <Brain className="w-8 h-8 text-primary-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-center text-primary-foreground mb-4">
            Wiki Quiz
          </h1>
          <p className="text-center text-primary-foreground/90 text-lg max-w-2xl mx-auto">
            Transform any Wikipedia article into an interactive quiz. 
            Learn, test your knowledge, and explore related topics.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-5xl mx-auto px-4 py-8 -mt-6 relative z-10">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full max-w-md mx-auto grid grid-cols-2 h-14 p-1.5 bg-card shadow-lg rounded-xl mb-8">
            <TabsTrigger 
              value="generate" 
              className="gap-2 text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Generate Quiz
            </TabsTrigger>
            <TabsTrigger 
              value="history" 
              className="gap-2 text-base data-[state=active]:gradient-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all"
            >
              <History className="w-4 h-4" />
              Past Quizzes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="animate-fade-in">
            <GenerateTab />
          </TabsContent>

          <TabsContent value="history" className="animate-fade-in">
            <HistoryTab />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-16 py-8">
        <div className="container max-w-5xl mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>Wiki Quiz Generator • Powered by AI</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
