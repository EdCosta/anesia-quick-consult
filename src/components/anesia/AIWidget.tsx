import { Bot, History, LayoutPanelLeft, MessageSquare } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAIProcedureContext } from '@/contexts/AIProcedureContext';
import { useLang } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIChat from './AIChat';
import AIThreadList from './AIThreadList';
import { buildThreadTitle, createAIId, type Message, type Thread } from './AIWidget.types';

const AI_THREADS_STORAGE_KEY = 'ai_threads_v1';
const AI_THREADS_STORAGE_VERSION = 1;
const AI_THREADS_LEGACY_KEYS = ['ai_threads'];
const QUICK_PROMPTS = [
  'Plano pre/intra/pos',
  'Checklist',
  'Red flags',
  'PONV',
  'TEV',
  'Via aerea',
  'ALR',
];

type AIStoragePayload = {
  threads: Thread[];
  version: number;
};

type AITab = 'block' | 'history';

function normalizeMessage(value: unknown): Message | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Message>;

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.content !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    (candidate.role !== 'assistant' && candidate.role !== 'system' && candidate.role !== 'user')
  ) {
    return null;
  }

  return {
    id: candidate.id,
    role: candidate.role,
    content: candidate.content,
    createdAt: candidate.createdAt,
    flags: Array.isArray(candidate.flags)
      ? candidate.flags.filter((flag): flag is string => typeof flag === 'string')
      : undefined,
  };
}

function normalizeThread(value: unknown): Thread | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Partial<Thread>;
  const language =
    candidate.language === 'fr' || candidate.language === 'en' || candidate.language === 'pt'
      ? candidate.language
      : 'fr';
  const messages = Array.isArray(candidate.messages)
    ? candidate.messages
        .map((message) => normalizeMessage(message))
        .filter((message): message is Message => !!message)
    : [];

  if (
    typeof candidate.id !== 'string' ||
    typeof candidate.title !== 'string' ||
    typeof candidate.createdAt !== 'string' ||
    typeof candidate.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,
    createdAt: candidate.createdAt,
    updatedAt: candidate.updatedAt,
    procedureId: typeof candidate.procedureId === 'string' ? candidate.procedureId : undefined,
    procedureTitle:
      typeof candidate.procedureTitle === 'string' ? candidate.procedureTitle : undefined,
    language,
    messages,
  };
}

function readThreadStorageValue() {
  if (typeof window === 'undefined') {
    return null;
  }

  const currentValue = window.localStorage.getItem(AI_THREADS_STORAGE_KEY);

  if (currentValue) {
    return currentValue;
  }

  for (const legacyKey of AI_THREADS_LEGACY_KEYS) {
    const legacyValue = window.localStorage.getItem(legacyKey);

    if (legacyValue) {
      return legacyValue;
    }
  }

  return null;
}

function readStoredThreads() {
  const rawValue = readThreadStorageValue();

  if (!rawValue) {
    return [];
  }

  try {
    const parsed = JSON.parse(rawValue) as AIStoragePayload | Thread[];
    const storedThreads = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.threads)
        ? parsed.threads
        : [];

    return storedThreads
      .map((thread) => normalizeThread(thread))
      .filter((thread): thread is Thread => !!thread);
  } catch (error) {
    console.warn('[AIWidget] Failed to parse stored threads.', error);
    return [];
  }
}

function persistThreads(threads: Thread[]) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: AIStoragePayload = {
    version: AI_THREADS_STORAGE_VERSION,
    threads,
  };

  window.localStorage.setItem(AI_THREADS_STORAGE_KEY, JSON.stringify(payload));
}

function sortThreads(threads: Thread[]) {
  return [...threads].sort(
    (firstThread, secondThread) =>
      new Date(secondThread.updatedAt).getTime() - new Date(firstThread.updatedAt).getTime(),
  );
}

function resolveSetStateAction<T>(value: SetStateAction<T>, currentValue: T) {
  return value instanceof Function ? value(currentValue) : value;
}

function cloneMessages(messages: Message[]) {
  return messages.map((message) => ({
    ...message,
    id: createAIId('msg'),
  }));
}

export default function AIWidget() {
  const { lang } = useLang();
  const { procedureContext } = useAIProcedureContext();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AITab>('block');
  const [blockMessages, setBlockMessages] = useState<Message[]>([]);
  const [threadSearch, setThreadSearch] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>(() => readStoredThreads());

  useEffect(() => {
    persistThreads(threads);
  }, [threads]);

  const sortedThreads = useMemo(() => sortThreads(threads), [threads]);
  const filteredThreads = useMemo(() => {
    const normalizedSearch = threadSearch.trim().toLowerCase();

    if (!normalizedSearch) {
      return sortedThreads;
    }

    return sortedThreads.filter((thread) => thread.title.toLowerCase().includes(normalizedSearch));
  }, [sortedThreads, threadSearch]);
  const selectedThread = useMemo(
    () => filteredThreads.find((thread) => thread.id === selectedThreadId) || null,
    [filteredThreads, selectedThreadId],
  );

  useEffect(() => {
    if (threads.length === 0) {
      setSelectedThreadId(null);
      return;
    }

    if (!selectedThreadId || !threads.some((thread) => thread.id === selectedThreadId)) {
      setSelectedThreadId(sortThreads(threads)[0]?.id || null);
    }
  }, [selectedThreadId, threads]);

  const handleClearBlock = useCallback(() => {
    setBlockMessages([]);
  }, []);

  const handleSaveBlockToHistory = useCallback(() => {
    if (blockMessages.length === 0) {
      return;
    }

    const now = new Date().toISOString();
    const newThread: Thread = {
      id: createAIId('thread'),
      title: buildThreadTitle(blockMessages, procedureContext?.procedureTitle),
      createdAt: now,
      updatedAt: now,
      procedureId: procedureContext?.procedureId,
      procedureTitle: procedureContext?.procedureTitle,
      language: lang,
      messages: cloneMessages(blockMessages),
    };

    setThreads((currentThreads) => [newThread, ...currentThreads]);
    setSelectedThreadId(newThread.id);
    setActiveTab('history');
    toast.success('Conversa guardada no historico.');
  }, [blockMessages, lang, procedureContext]);

  const handleRenameThread = useCallback((threadId: string) => {
    const targetThread = threads.find((thread) => thread.id === threadId);

    if (!targetThread) {
      return;
    }

    const nextTitle = window.prompt('Novo titulo da conversa', targetThread.title)?.trim();

    if (!nextTitle) {
      return;
    }

    setThreads((currentThreads) =>
      currentThreads.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              title: nextTitle,
              updatedAt: new Date().toISOString(),
            }
          : thread,
      ),
    );
  }, [threads]);

  const handleDeleteThread = useCallback((threadId: string) => {
    const confirmed = window.confirm('Apagar esta conversa do historico?');

    if (!confirmed) {
      return;
    }

    setThreads((currentThreads) => currentThreads.filter((thread) => thread.id !== threadId));
    toast.success('Conversa apagada.');
  }, []);

  const handleDuplicateThreadToBlock = useCallback((threadId: string) => {
    const targetThread = threads.find((thread) => thread.id === threadId);

    if (!targetThread) {
      return;
    }

    setBlockMessages(cloneMessages(targetThread.messages));
    setActiveTab('block');
    setIsOpen(true);
    toast.success('Conversa duplicada para Bloco.');
  }, [threads]);

  const setSelectedThreadMessages = useCallback(
    (nextValue: SetStateAction<Message[]>) => {
      if (!selectedThreadId) {
        return;
      }

      setThreads((currentThreads) =>
        currentThreads.map((thread) => {
          if (thread.id !== selectedThreadId) {
            return thread;
          }

          const nextMessages = resolveSetStateAction(nextValue, thread.messages);

          return {
            ...thread,
            messages: nextMessages,
            updatedAt: new Date().toISOString(),
          };
        }),
      );
    },
    [selectedThreadId],
  );

  const panelContent = (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-border/70 px-4 py-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Assistente IA</h2>
            <p className="text-sm text-muted-foreground">
              Bloco temporario e historico persistente.
            </p>
          </div>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(value) => setActiveTab(value as AITab)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="px-4 pt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="block" className="gap-1.5">
              <LayoutPanelLeft className="h-4 w-4" />
              Bloco
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              Historico
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="block" className="mt-0 flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4">
          <AIChat
            mode="block"
            emptyState="Use o Bloco para um chat temporario. Pode fechar o widget e continuar depois."
            messages={blockMessages}
            setMessages={setBlockMessages}
            onClear={handleClearBlock}
            onSaveToHistory={handleSaveBlockToHistory}
            canSaveToHistory={blockMessages.length > 0}
            procedureContextOverride={procedureContext}
            quickPrompts={QUICK_PROMPTS}
          />
        </TabsContent>

        <TabsContent
          value="history"
          className="mt-0 flex min-h-0 flex-1 flex-col gap-4 px-4 pb-4 pt-4"
        >
          <AIThreadList
            search={threadSearch}
            selectedThreadId={selectedThreadId}
            threads={filteredThreads}
            onDeleteThread={handleDeleteThread}
            onDuplicateThread={handleDuplicateThreadToBlock}
            onRenameThread={handleRenameThread}
            onSearchChange={setThreadSearch}
            onSelectThread={setSelectedThreadId}
          />

          {selectedThread ? (
            <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-2xl border border-border/70 bg-muted/20 p-3">
              <div className="rounded-xl border border-border/70 bg-background px-3 py-2">
                <p className="text-sm font-semibold text-foreground">{selectedThread.title}</p>
                <p className="text-xs text-muted-foreground">
                  Continuar conversa persistente.
                </p>
              </div>
              <AIChat
                mode="history"
                emptyState="Selecione ou crie uma conversa guardada para continuar."
                messages={selectedThread.messages}
                procedureContextOverride={{
                  procedureId: selectedThread.procedureId,
                  procedureTitle: selectedThread.procedureTitle,
                }}
                setMessages={setSelectedThreadMessages}
              />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-background/80 px-4 py-6 text-center text-sm text-muted-foreground">
              Selecione uma conversa no historico para continuar.
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const overlayContent = isMobile ? (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerContent className="max-h-[85vh]">{panelContent}</DrawerContent>
    </Drawer>
  ) : (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent side="right" className="flex h-full w-full flex-col p-0 sm:max-w-[34rem]">
        {panelContent}
      </SheetContent>
    </Sheet>
  );

  const shouldOffsetForQuickFab = location.pathname === '/';
  const fabPositionClass = shouldOffsetForQuickFab ? 'bottom-24 right-6' : 'bottom-4 right-4';

  return (
    <>
      <div className={`fixed z-40 ${fabPositionClass}`}>
        <Button
          type="button"
          onClick={() => setIsOpen(true)}
          className="h-14 rounded-full px-5 shadow-lg"
        >
          <MessageSquare className="h-5 w-5" />
          IA
        </Button>
      </div>
      {overlayContent}
    </>
  );
}
