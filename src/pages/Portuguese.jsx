import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster, toast } from 'sonner';
import {
  Volume2, RotateCcw, Check, X, Sparkles, Flame, Trophy,
  ArrowRight, ArrowLeft, BookOpen, Shuffle, Home as HomeIcon,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { LESSONS, PHRASEBOOK, ALL_WORDS } from '@/data/portugueseLessons';

const STORAGE_KEY = 'pt-app-progress-v1';

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { learned: {}, xp: 0, streak: { count: 0, lastDay: null } };
    const p = JSON.parse(raw);
    return {
      learned: p.learned || {},
      xp: p.xp || 0,
      streak: p.streak || { count: 0, lastDay: null },
    };
  } catch {
    return { learned: {}, xp: 0, streak: { count: 0, lastDay: null } };
  }
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function yesterdayISO() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

function bumpStreak(p) {
  const today = todayISO();
  if (p.streak.lastDay === today) return p;
  const newCount = p.streak.lastDay === yesterdayISO() ? p.streak.count + 1 : 1;
  return { ...p, streak: { count: newCount, lastDay: today } };
}

function speak(text) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'pt-BR';
  u.rate = 0.95;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function makeQuiz(count = 10) {
  const pool = shuffle(ALL_WORDS).slice(0, count);
  return pool.map((word) => {
    const direction = Math.random() < 0.5 ? 'pt2en' : 'en2pt';
    const answer = direction === 'pt2en' ? word.en : word.pt;
    const distractors = shuffle(ALL_WORDS.filter(w => w.pt !== word.pt))
      .slice(0, 3)
      .map(d => direction === 'pt2en' ? d.en : d.pt);
    return {
      prompt: direction === 'pt2en' ? word.pt : word.en,
      direction,
      answer,
      options: shuffle([answer, ...distractors]),
      word,
    };
  });
}

function SpeakButton({ text, className }) {
  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      className={cn('h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50', className)}
      onClick={(e) => { e.stopPropagation(); speak(text); }}
      aria-label={`Speak ${text}`}
    >
      <Volume2 className="h-4 w-4" />
    </Button>
  );
}

function Hero({ progress }) {
  const mastered = Object.values(progress.learned).filter(Boolean).length;
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-500 via-yellow-400 to-sky-500 p-8 sm:p-10 text-white shadow-xl">
      <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/20 blur-3xl" />
      <div className="absolute -bottom-12 -left-12 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
      <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
        <div>
          <Badge className="mb-3 bg-white/20 text-white border-white/30 hover:bg-white/30">
            🇧🇷 Brazilian Portuguese
          </Badge>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">Aprenda Português</h1>
          <p className="mt-2 text-white/90 max-w-xl">
            Learn the language of samba, saudade, and sandy beaches — one card at a time.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Stat icon={<Sparkles className="h-4 w-4" />} label="XP" value={progress.xp} />
          <Stat icon={<Flame className="h-4 w-4" />} label="Day streak" value={progress.streak.count} />
          <Stat icon={<Trophy className="h-4 w-4" />} label="Mastered" value={mastered} />
        </div>
      </div>
    </div>
  );
}

function Stat({ icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 px-4 py-3 min-w-[110px]">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-white/80">
        {icon}{label}
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function LessonsTab({ progress, setProgress }) {
  const [activeId, setActiveId] = useState(null);
  const lesson = LESSONS.find(l => l.id === activeId);

  if (lesson) return <LessonDetail lesson={lesson} progress={progress} setProgress={setProgress} onBack={() => setActiveId(null)} />;

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {LESSONS.map((l) => {
        const learnedCount = l.words.filter(w => progress.learned[`${l.id}:${w.pt}`]).length;
        const pct = Math.round((learnedCount / l.words.length) * 100);
        return (
          <motion.button
            key={l.id}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setActiveId(l.id)}
            className="text-left rounded-2xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl', l.color)}>
              {l.emoji}
            </div>
            <div className="mt-4 text-lg font-semibold">{l.title}</div>
            <p className="text-sm text-muted-foreground mt-1">{l.blurb}</p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
              <Progress value={pct} className="h-1.5" />
              <span className="shrink-0">{learnedCount}/{l.words.length}</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

function LessonDetail({ lesson, progress, setProgress, onBack }) {
  const toggleLearned = (word) => {
    const key = `${lesson.id}:${word.pt}`;
    const wasLearned = !!progress.learned[key];
    const next = bumpStreak({
      ...progress,
      learned: { ...progress.learned, [key]: !wasLearned },
      xp: progress.xp + (wasLearned ? 0 : 5),
    });
    setProgress(next);
    if (!wasLearned) toast.success(`Mastered “${word.pt}” (+5 XP)`);
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4 -ml-2">
        <ArrowLeft className="h-4 w-4 mr-1" /> All lessons
      </Button>
      <div className="flex items-center gap-3 mb-6">
        <div className={cn('inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-2xl', lesson.color)}>
          {lesson.emoji}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{lesson.title}</h2>
          <p className="text-sm text-muted-foreground">{lesson.blurb}</p>
        </div>
      </div>
      <div className="space-y-3">
        {lesson.words.map((w) => {
          const key = `${lesson.id}:${w.pt}`;
          const learned = !!progress.learned[key];
          return (
            <Card key={w.pt} className={cn('transition-colors', learned && 'bg-emerald-50/60 border-emerald-200')}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="text-xl font-semibold">{w.pt}</div>
                      <SpeakButton text={w.pt} />
                      <Badge variant="outline" className="text-xs">{w.ipa}</Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mt-0.5">{w.en}</div>
                    <div className="mt-3 rounded-lg bg-muted/60 p-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{w.ex.pt}</span>
                        <SpeakButton text={w.ex.pt} />
                      </div>
                      <div className="text-muted-foreground italic mt-0.5">{w.ex.en}</div>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant={learned ? 'default' : 'outline'}
                    onClick={() => toggleLearned(w)}
                    className={cn(learned && 'bg-emerald-600 hover:bg-emerald-700')}
                  >
                    {learned ? <><Check className="h-4 w-4 mr-1" />Learned</> : 'Mark learned'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function FlashcardsTab({ progress, setProgress }) {
  const [filter, setFilter] = useState('all');
  const [deck, setDeck] = useState(() => shuffle(ALL_WORDS));
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const activeDeck = useMemo(() => {
    if (filter === 'all') return deck;
    if (filter === 'unlearned') return deck.filter(w => !progress.learned[`${w.lessonId}:${w.pt}`]);
    return deck.filter(w => w.lessonId === filter);
  }, [deck, filter, progress.learned]);

  useEffect(() => { setIndex(0); setFlipped(false); }, [filter]);

  const card = activeDeck[index];
  const canStudy = activeDeck.length > 0;

  const next = () => { setFlipped(false); setIndex((i) => (i + 1) % activeDeck.length); };
  const prev = () => { setFlipped(false); setIndex((i) => (i - 1 + activeDeck.length) % activeDeck.length); };

  const markKnown = () => {
    if (!card) return;
    const key = `${card.lessonId}:${card.pt}`;
    const wasLearned = !!progress.learned[key];
    setProgress(bumpStreak({
      ...progress,
      learned: { ...progress.learned, [key]: true },
      xp: progress.xp + (wasLearned ? 1 : 5),
    }));
    next();
  };

  const reshuffle = () => { setDeck(shuffle(ALL_WORDS)); setIndex(0); setFlipped(false); };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-sm font-medium text-muted-foreground mr-1">Deck:</span>
        <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>All words</FilterPill>
        <FilterPill active={filter === 'unlearned'} onClick={() => setFilter('unlearned')}>Unlearned only</FilterPill>
        {LESSONS.map(l => (
          <FilterPill key={l.id} active={filter === l.id} onClick={() => setFilter(l.id)}>
            {l.emoji} {l.title}
          </FilterPill>
        ))}
        <Button size="sm" variant="ghost" onClick={reshuffle} className="ml-auto">
          <Shuffle className="h-4 w-4 mr-1" /> Shuffle
        </Button>
      </div>

      {!canStudy ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">No cards in this deck. Try another filter.</CardContent></Card>
      ) : (
        <>
          <div className="text-center text-sm text-muted-foreground mb-2">
            Card {index + 1} of {activeDeck.length}
          </div>
          <Progress value={((index + 1) / activeDeck.length) * 100} className="h-1.5 mb-6" />

          <div className="relative mx-auto max-w-xl h-72">
            <AnimatePresence mode="wait">
              <motion.button
                key={`${card.pt}-${flipped}`}
                initial={{ opacity: 0, rotateY: flipped ? -90 : 90, scale: 0.95 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: flipped ? 90 : -90, scale: 0.95 }}
                transition={{ duration: 0.25 }}
                onClick={() => setFlipped(f => !f)}
                className={cn(
                  'absolute inset-0 rounded-3xl border-2 shadow-lg flex flex-col items-center justify-center p-8 text-center cursor-pointer',
                  flipped
                    ? 'bg-gradient-to-br from-sky-100 to-emerald-50 border-emerald-200'
                    : 'bg-white border-slate-200',
                )}
              >
                {!flipped ? (
                  <>
                    <div className="text-4xl sm:text-5xl font-bold">{card.pt}</div>
                    <div className="mt-3 text-sm text-muted-foreground">{card.ipa}</div>
                    <div className="absolute top-3 right-3"><SpeakButton text={card.pt} /></div>
                    <div className="mt-6 text-xs text-muted-foreground">Click to reveal · {card.lessonTitle}</div>
                  </>
                ) : (
                  <>
                    <div className="text-3xl sm:text-4xl font-semibold">{card.en}</div>
                    <div className="mt-4 text-sm text-muted-foreground italic">{card.ex.pt}</div>
                    <div className="text-sm text-muted-foreground">{card.ex.en}</div>
                    <div className="mt-4 text-xs text-muted-foreground">Click to flip back</div>
                  </>
                )}
              </motion.button>
            </AnimatePresence>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <Button variant="outline" onClick={prev}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
            <Button variant="outline" onClick={next}>Study more<ArrowRight className="h-4 w-4 ml-1" /></Button>
            <Button onClick={markKnown} className="bg-emerald-600 hover:bg-emerald-700">
              <Check className="h-4 w-4 mr-1" />Know it
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function FilterPill({ active, onClick, children }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-full text-xs font-medium transition-colors border',
        active
          ? 'bg-foreground text-background border-foreground'
          : 'bg-background text-foreground border-border hover:bg-muted',
      )}
    >
      {children}
    </button>
  );
}

function QuizTab({ progress, setProgress }) {
  const [questions, setQuestions] = useState(null);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const start = () => {
    setQuestions(makeQuiz(10));
    setIndex(0);
    setScore(0);
    setSelected(null);
    setShowResult(false);
  };

  const choose = (opt) => {
    if (selected) return;
    const q = questions[index];
    const correct = opt === q.answer;
    setSelected(opt);
    if (correct) {
      setScore(s => s + 1);
      toast.success('Correto! 🎉');
    } else {
      toast.error(`Not quite — "${q.prompt}" = "${q.answer}"`);
    }
  };

  const advance = () => {
    if (index + 1 >= questions.length) {
      setShowResult(true);
      setProgress(bumpStreak({ ...progress, xp: progress.xp + score * 3 }));
    } else {
      setIndex(i => i + 1);
      setSelected(null);
    }
  };

  if (!questions) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5" />Quick Quiz</CardTitle>
          <CardDescription>10 mixed multiple-choice questions across every lesson. Earn 3 XP per correct answer.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button size="lg" onClick={start} className="bg-emerald-600 hover:bg-emerald-700">
            <Sparkles className="h-4 w-4 mr-1" />Start quiz
          </Button>
        </CardContent>
      </Card>
    );
  }

  const q = questions[index];

  return (
    <>
      <div className="text-sm text-muted-foreground mb-2">Question {index + 1} of {questions.length} · Score {score}</div>
      <Progress value={((index + 1) / questions.length) * 100} className="h-1.5 mb-6" />

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
            {q.direction === 'pt2en' ? 'Translate to English' : 'Translate to Portuguese'}
          </div>
          <div className="flex items-center gap-2 mb-6">
            <div className="text-3xl sm:text-4xl font-bold">{q.prompt}</div>
            {q.direction === 'pt2en' && <SpeakButton text={q.prompt} />}
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {q.options.map((opt) => {
              const isAnswer = opt === q.answer;
              const isChosen = opt === selected;
              const reveal = selected !== null;
              return (
                <button
                  key={opt}
                  disabled={reveal}
                  onClick={() => choose(opt)}
                  className={cn(
                    'rounded-xl border-2 p-4 text-left font-medium transition-colors',
                    !reveal && 'hover:border-emerald-400 hover:bg-emerald-50',
                    reveal && isAnswer && 'border-emerald-500 bg-emerald-50',
                    reveal && isChosen && !isAnswer && 'border-rose-500 bg-rose-50',
                    reveal && !isChosen && !isAnswer && 'opacity-60',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{opt}</span>
                    {reveal && isAnswer && <Check className="h-5 w-5 text-emerald-600" />}
                    {reveal && isChosen && !isAnswer && <X className="h-5 w-5 text-rose-600" />}
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-6 flex justify-end">
              <Button onClick={advance} className="bg-emerald-600 hover:bg-emerald-700">
                {index + 1 >= questions.length ? 'See results' : 'Next question'}
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showResult} onOpenChange={setShowResult}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              You scored {score} / {questions.length}
            </DialogTitle>
            <DialogDescription>
              {score === questions.length
                ? 'Perfeito! A flawless run. +' + (score * 3) + ' XP'
                : score >= 7
                  ? 'Muito bom! You\'re getting there. +' + (score * 3) + ' XP'
                  : score >= 4
                    ? 'Nice effort — review the lessons and try again. +' + (score * 3) + ' XP'
                    : 'Keep going! Review a lesson, then come back. +' + (score * 3) + ' XP'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => { setShowResult(false); setQuestions(null); }}>
              Done
            </Button>
            <Button onClick={() => { setShowResult(false); start(); }} className="bg-emerald-600 hover:bg-emerald-700">
              <RotateCcw className="h-4 w-4 mr-1" />Play again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function PhrasebookTab() {
  return (
    <Accordion type="multiple" className="space-y-3">
      {PHRASEBOOK.map((section) => (
        <AccordionItem key={section.id} value={section.id} className="border rounded-2xl bg-card px-4">
          <AccordionTrigger className="hover:no-underline">
            <div className="flex items-center gap-3 text-left">
              <div className="text-2xl">{section.emoji}</div>
              <div className="font-semibold">{section.title}</div>
              <Badge variant="outline" className="ml-2 text-xs">{section.items.length} phrases</Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="space-y-2 pb-2">
              {section.items.map((p) => (
                <li key={p.pt} className="rounded-lg border bg-background p-3 flex items-start gap-3">
                  <div className="flex-1">
                    <div className="font-medium flex items-center gap-2">
                      {p.pt}
                      <SpeakButton text={p.pt} />
                    </div>
                    <div className="text-sm text-muted-foreground italic">{p.en}</div>
                  </div>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

export default function Portuguese() {
  const [progress, setProgressState] = useState(loadProgress);
  const setProgress = (p) => {
    setProgressState(p);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(p)); } catch { /* ignore */ }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      <Toaster position="top-center" richColors closeButton />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        <div className="flex items-center justify-between mb-6">
          <a href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <HomeIcon className="h-4 w-4" /> Home
          </a>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset all Portuguese progress?')) {
                setProgress({ learned: {}, xp: 0, streak: { count: 0, lastDay: null } });
                toast.success('Progress reset');
              }
            }}
          >
            <RotateCcw className="h-4 w-4 mr-1" /> Reset progress
          </Button>
        </div>

        <Hero progress={progress} />

        <Tabs defaultValue="lessons" className="mt-8">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
            <TabsTrigger value="quiz">Quiz</TabsTrigger>
            <TabsTrigger value="phrases">Phrases</TabsTrigger>
          </TabsList>

          <TabsContent value="lessons" className="mt-6">
            <LessonsTab progress={progress} setProgress={setProgress} />
          </TabsContent>
          <TabsContent value="flashcards" className="mt-6">
            <FlashcardsTab progress={progress} setProgress={setProgress} />
          </TabsContent>
          <TabsContent value="quiz" className="mt-6">
            <QuizTab progress={progress} setProgress={setProgress} />
          </TabsContent>
          <TabsContent value="phrases" className="mt-6">
            <PhrasebookTab />
          </TabsContent>
        </Tabs>

        <footer className="mt-12 text-center text-xs text-muted-foreground">
          Pronunciation uses your browser's built-in voice. Best in Chrome / Edge. Progress is saved locally.
        </footer>
      </div>
    </div>
  );
}
