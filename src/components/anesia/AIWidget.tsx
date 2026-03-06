import { Bot, History, LayoutPanelLeft, MessageSquare, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAIProcedureContext } from '@/contexts/AIProcedureContext';
import { useLang } from '@/contexts/LanguageContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIChat from './AIChat';
import AIThreadList from './AIThreadList';
import { buildThreadTitle, createAIId, type Message, type Thread } from './AIWidget.types';

const AI_THREADS_STORAGE_KEY = 'ai_threads_v1';
const AI_THREADS_STORAGE_VERSION = 1;
const AI_THREADS_LEGACY_KEYS = ['ai_threads'];

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

function isRemoteThreadId(threadId: string | null | undefined) {
  return !!threadId && !threadId.startsWith('thread-');
}

export default function AIWidget() {
  const { lang } = useLang();
  const { procedureContext } = useAIProcedureContext();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AITab>('block');
  const [blockMessages, setBlockMessages] = useState<Message[]>([]);
  const [blockThreadId, setBlockThreadId] = useState<string | null>(null);
  const [threadSearch, setThreadSearch] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>(() => readStoredThreads());
  const quickPrompts =
    lang === 'fr'
      ? ['Plan pre/intra/post', 'Checklist', 'Red flags', 'NVPO', 'TEV', 'Voie aerienne', 'ALR']
      : lang === 'pt'
        ? ['Plano pre/intra/pos', 'Checklist', 'Red flags', 'PONV', 'TEV', 'Via aerea', 'ALR']
        : ['Pre/intra/post plan', 'Checklist', 'Red flags', 'PONV', 'VTE', 'Airway', 'RA'];
  const copy =
    lang === 'fr'
      ? {
          title: 'Assistant IA',
          subtitle: 'Bloc temporaire et historique persistant.',
          block: 'Bloc',
          history: 'Historique',
          blockEmpty: 'Utilisez le Bloc pour un chat temporaire. Vous pouvez fermer le widget et continuer ensuite.',
          historyEmpty: 'Selectionnez ou creez une conversation enregistree pour continuer.',
          saved: 'Conversation enregistree dans l historique.',
          renamePrompt: 'Nouveau titre de la conversation',
          deletePrompt: 'Supprimer cette conversation de l historique ?',
          deleted: 'Conversation supprimee.',
          duplicated: 'Conversation dupliquee vers le Bloc.',
          continueLabel: 'Continuer conversation persistante.',
          selectThread: 'Selectionnez une conversation dans l historique pour continuer.',
          closeAria: 'Fermer panneau IA',
        }
      : lang === 'pt'
        ? {
            title: 'Assistente IA',
            subtitle: 'Bloco temporario e historico persistente.',
            block: 'Bloco',
            history: 'Historico',
            blockEmpty: 'Usa o Bloco para um chat temporario. Podes fechar o widget e continuar depois.',
            historyEmpty: 'Seleciona ou cria uma conversa guardada para continuar.',
            saved: 'Conversa guardada no historico.',
            renamePrompt: 'Novo titulo da conversa',
            deletePrompt: 'Apagar esta conversa do historico?',
            deleted: 'Conversa apagada.',
            duplicated: 'Conversa duplicada para Bloco.',
            continueLabel: 'Continuar conversa persistente.',
            selectThread: 'Seleciona uma conversa no historico para continuar.',
            closeAria: 'Fechar painel IA',
          }
        : {
            title: 'AI assistant',
            subtitle: 'Temporary workspace and persistent history.',
            block: 'Workspace',
            history: 'History',
            blockEmpty: 'Use the workspace for a temporary chat. You can close the widget and continue later.',
            historyEmpty: 'Select or create a saved thread to continue.',
            saved: 'Conversation saved to history.',
            renamePrompt: 'New conversation title',
            deletePrompt: 'Delete this conversation from history?',
            deleted: 'Conversation deleted.',
            duplicated: 'Conversation copied to workspace.',
            continueLabel: 'Continue saved conversation.',
            selectThread: 'Select a saved conversation from history to continue.',
            closeAria: 'Close AI panel',
          };

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
    setBlockThreadId(null);
  }, []);

  const handleSaveBlockToHistory = useCallback(() => {
    if (blockMessages.length === 0) {
      return;
    }

    const now = new Date().toISOString();
    const newThread: Thread = {
      id: blockThreadId || createAIId('thread'),
      title: buildThreadTitle(blockMessages, procedureContext?.procedureTitle),
      createdAt: now,
      updatedAt: now,
      procedureId: procedureContext?.procedureId,
      procedureTitle: procedureContext?.procedureTitle,
      language: lang,
      messages: cloneMessages(blockMessages),
    };

    setThreads((currentThreads) => {
      const remainingThreads = currentThreads.filter((thread) => thread.id !== newThread.id);
      return [newThread, ...remainingThreads];
    });
    setSelectedThreadId(newThread.id);
    setActiveTab('history');
    toast.success(copy.saved);
  }, [blockMessages, blockThreadId, copy.saved, lang, procedureContext]);

  const handleRenameThread = useCallback((threadId: string) => {
    const targetThread = threads.find((thread) => thread.id === threadId);

    if (!targetThread) {
      return;
    }

    const nextTitle = window.prompt(copy.renamePrompt, targetThread.title)?.trim();

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
  }, [copy.renamePrompt, threads]);

  const handleDeleteThread = useCallback((threadId: string) => {
    const confirmed = window.confirm(copy.deletePrompt);

    if (!confirmed) {
      return;
    }

    setThreads((currentThreads) => currentThreads.filter((thread) => thread.id !== threadId));

    if (blockThreadId === threadId) {
      setBlockThreadId(null);
      setBlockMessages([]);
    }

    toast.success(copy.deleted);
  }, [blockThreadId, copy.deletePrompt, copy.deleted]);

  const handleDuplicateThreadToBlock = useCallback((threadId: string) => {
    const targetThread = threads.find((thread) => thread.id === threadId);

    if (!targetThread) {
      return;
    }

    setBlockMessages(cloneMessages(targetThread.messages));
    setBlockThreadId(isRemoteThreadId(targetThread.id) ? targetThread.id : null);
    setActiveTab('block');
    setIsOpen(true);
    toast.success(copy.duplicated);
  }, [copy.duplicated, threads]);

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
            <h2 className="text-base font-semibold text-foreground">{copy.title}</h2>
            <p className="text-sm text-muted-foreground">{copy.subtitle}</p>
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
              {copy.block}
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-1.5">
              <History className="h-4 w-4" />
              {copy.history}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="block" className="mt-0 flex min-h-0 flex-1 flex-col px-4 pb-4 pt-4">
          <AIChat
            mode="block"
            emptyState={copy.blockEmpty}
            messages={blockMessages}
            setMessages={setBlockMessages}
            onClear={handleClearBlock}
            onSaveToHistory={handleSaveBlockToHistory}
            onThreadResolved={setBlockThreadId}
            canSaveToHistory={blockMessages.length > 0}
            procedureContextOverride={procedureContext}
            threadId={blockThreadId}
            quickPrompts={quickPrompts}
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
                <p className="text-xs text-muted-foreground">{copy.continueLabel}</p>
              </div>
              <AIChat
                mode="history"
                emptyState={copy.historyEmpty}
                messages={selectedThread.messages}
                procedureContextOverride={{
                  procedureId: selectedThread.procedureId,
                  procedureTitle: selectedThread.procedureTitle,
                }}
                setMessages={setSelectedThreadMessages}
                onThreadResolved={(nextThreadId) => {
                  if (nextThreadId === selectedThread.id) {
                    return;
                  }

                  setThreads((currentThreads) =>
                    currentThreads.map((thread) =>
                      thread.id === selectedThread.id
                        ? {
                            ...thread,
                            id: nextThreadId,
                          }
                        : thread,
                    ),
                  );
                  setSelectedThreadId(nextThreadId);
                }}
                threadId={isRemoteThreadId(selectedThread.id) ? selectedThread.id : null}
              />
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center rounded-2xl border border-dashed border-border bg-background/80 px-4 py-6 text-center text-sm text-muted-foreground">
              {copy.selectThread}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );

  const overlayContent = isOpen ? (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70"
        onClick={() => setIsOpen(false)}
        aria-hidden="true"
      />
      {isMobile ? (
        <div className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[85vh] flex-col rounded-t-[18px] border bg-background shadow-2xl">
          <div className="mx-auto mt-3 h-1.5 w-16 rounded-full bg-muted" />
          <div className="flex justify-end px-3 pt-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label={copy.closeAria}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div
            className="min-h-0 flex-1 overflow-hidden"
            onClick={(event) => event.stopPropagation()}
          >
            {panelContent}
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-y-0 right-0 z-[60] flex h-full w-full flex-col border-l bg-background shadow-2xl sm:max-w-[34rem]"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex justify-end px-3 pt-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsOpen(false)}
              aria-label={copy.closeAria}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex min-h-0 flex-1 flex-col">{panelContent}</div>
        </div>
      )}
    </>
  ) : null;

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
