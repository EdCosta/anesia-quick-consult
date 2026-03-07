import { Bot, History, LayoutPanelLeft, MessageSquare, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, type SetStateAction } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useAIProcedureContext } from '@/contexts/AIProcedureContext';
import { useLang } from '@/contexts/LanguageContext';
import { useHospitalProfile } from '@/hooks/useHospitalProfile';
import { useAIThreads } from '@/hooks/useAIThreads';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AIChat from './AIChat';
import AIThreadList from './AIThreadList';
import {
  buildThreadTitle,
  createAIId,
  normalizeAIThread,
  sortAIThreads,
  type Message,
  type Thread,
} from './AIWidget.types';

const AI_THREADS_STORAGE_KEY = 'ai_threads_v1';
const AI_THREADS_STORAGE_VERSION = 1;
const AI_THREADS_LEGACY_KEYS = ['ai_threads'];

type AIStoragePayload = {
  threads: Thread[];
  version: number;
};

type AITab = 'block' | 'history';
type PromptTemplate = { label: string; prompt: string };

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
      .map((thread) => normalizeAIThread(thread))
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

function mergeThreadsWithRemote(currentThreads: Thread[], remoteThreads: Thread[]) {
  const localOnlyThreads = currentThreads.filter((thread) => !isRemoteThreadId(thread.id));
  const currentRemoteThreadMap = new Map(
    currentThreads
      .filter((thread) => isRemoteThreadId(thread.id))
      .map((thread) => [thread.id, thread]),
  );

  const mergedRemoteThreads = remoteThreads.map((remoteThread) => {
    const currentThread = currentRemoteThreadMap.get(remoteThread.id);

    if (!currentThread) {
      return remoteThread;
    }

    const currentUpdatedAt = new Date(currentThread.updatedAt).getTime();
    const remoteUpdatedAt = new Date(remoteThread.updatedAt).getTime();

    return currentUpdatedAt > remoteUpdatedAt ? currentThread : remoteThread;
  });

  return sortAIThreads([...mergedRemoteThreads, ...localOnlyThreads]);
}

function buildPromptTemplates(
  lang: 'fr' | 'pt' | 'en',
  procedureTitle?: string,
  hasHospitalProfile?: boolean,
): PromptTemplate[] {
  const subject =
    procedureTitle ||
    (lang === 'fr'
      ? 'cette intervention'
      : lang === 'pt'
        ? 'esta intervencao'
        : 'this intervention');

  if (lang === 'fr') {
    return [
      {
        label: 'Plan bloc',
        prompt: `Donne un plan pre/intra/post pour ${subject}. Structure la reponse avec informations manquantes, red flags, checklist et sources.`,
      },
      {
        label: 'Patient fragile',
        prompt: `Analyse ${subject} chez un patient fragile/polycomorbide. Liste ce qu il faut verifier avant bloc, les risques, et les adaptations per/intra/post.`,
      },
      {
        label: 'Voie aerienne',
        prompt: `Pour ${subject}, fais une revue rapide du risque voie aerienne: signaux d alerte, ce qu il faut confirmer, plan A/B/C et points d escalation.`,
      },
      {
        label: 'NVPO',
        prompt: `Pour ${subject}, propose une strategie NVPO: facteurs de risque, prophylaxie, rescue post-op et checklist courte.`,
      },
      {
        label: 'Check reveil',
        prompt: `Pour ${subject}, prepare une checklist de reveil et post-op immediate: analgesie, NVPO, surveillance et red flags.`,
      },
      {
        label: hasHospitalProfile ? 'Delta hopital' : 'Verification',
        prompt: hasHospitalProfile
          ? `Pour ${subject}, compare le contenu standard au contexte hopital actif. Mets en avant ce qui change vraiment, ce qu il faut verifier, et ce qui manque.`
          : `Pour ${subject}, verifie la coherence clinique de la conduite proposee, ce qu il manque pour conclure, et les sources disponibles.`,
      },
    ];
  }

  if (lang === 'pt') {
    return [
      {
        label: 'Plano bloco',
        prompt: `Da-me um plano pre/intra/pos para ${subject}. Estrutura com informacao em falta, red flags, checklist e fontes.`,
      },
      {
        label: 'Doente fragil',
        prompt: `Analisa ${subject} num doente fragil/policomorbido. Lista o que verificar antes do bloco, riscos e adaptacoes pre/intra/pos.`,
      },
      {
        label: 'Via aerea',
        prompt: `Para ${subject}, faz uma revisao rapida do risco de via aerea: sinais de alerta, o que falta confirmar, plano A/B/C e criterios de escalacao.`,
      },
      {
        label: 'PONV',
        prompt: `Para ${subject}, propoe uma estrategia PONV: fatores de risco, profilaxia, rescue post-op e checklist curta.`,
      },
      {
        label: 'Check recobro',
        prompt: `Para ${subject}, prepara uma checklist de recobro e pos-operatorio imediato: analgesia, PONV, vigilancia e red flags.`,
      },
      {
        label: hasHospitalProfile ? 'Delta hospital' : 'Verificacao',
        prompt: hasHospitalProfile
          ? `Para ${subject}, compara o conteudo standard com o contexto hospitalar ativo. Destaca o que muda mesmo, o que deve ser confirmado e o que falta.`
          : `Para ${subject}, verifica a coerencia clinica da conduta proposta, o que falta para concluir e as fontes disponiveis.`,
      },
    ];
  }

  return [
    {
      label: 'OR plan',
      prompt: `Give me a pre/intra/post plan for ${subject}. Structure it with missing information, red flags, checklist, and sources.`,
    },
    {
      label: 'Fragile patient',
      prompt: `Assess ${subject} in a frail/high-comorbidity patient. List what must be checked before the OR, key risks, and pre/intra/post adaptations.`,
    },
    {
      label: 'Airway',
      prompt: `For ${subject}, do a rapid airway-risk review: warning signs, what still needs confirmation, plan A/B/C, and escalation points.`,
    },
    {
      label: 'PONV',
      prompt: `For ${subject}, propose a PONV strategy: risk factors, prophylaxis, postop rescue, and a short checklist.`,
    },
    {
      label: 'PACU check',
      prompt: `For ${subject}, prepare a PACU and immediate postop checklist: analgesia, PONV, monitoring, and red flags.`,
    },
    {
      label: hasHospitalProfile ? 'Hospital delta' : 'Verify',
      prompt: hasHospitalProfile
        ? `For ${subject}, compare the standard content with the active hospital context. Highlight what materially changes, what needs confirmation, and what is missing.`
        : `For ${subject}, verify the proposed clinical approach, what information is still missing, and what sources are available.`,
    },
  ];
}

export default function AIWidget() {
  const { lang } = useLang();
  const { procedureContext } = useAIProcedureContext();
  const hospitalProfile = useHospitalProfile();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AITab>('block');
  const [blockMessages, setBlockMessages] = useState<Message[]>([]);
  const [blockThreadId, setBlockThreadId] = useState<string | null>(null);
  const [threadSearch, setThreadSearch] = useState('');
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [threads, setThreads] = useState<Thread[]>(() => readStoredThreads());
  const {
    userId,
    threads: remoteThreads,
    isLoading: remoteThreadsLoading,
    renameRemoteThread,
    deleteRemoteThread,
    createRemoteThreadFromMessages,
    refetch: refetchRemoteThreads,
  } = useAIThreads();
  const quickPrompts = useMemo(
    () =>
      buildPromptTemplates(
        lang,
        procedureContext?.procedureTitle,
        !!hospitalProfile?.id,
      ),
    [hospitalProfile?.id, lang, procedureContext?.procedureTitle],
  );
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

  useEffect(() => {
    if (remoteThreads.length === 0) {
      return;
    }

    setThreads((currentThreads) => mergeThreadsWithRemote(currentThreads, remoteThreads));
  }, [remoteThreads]);

  const sortedThreads = useMemo(() => sortAIThreads(threads), [threads]);
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
      setSelectedThreadId(sortAIThreads(threads)[0]?.id || null);
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
    const nextTitle = buildThreadTitle(blockMessages, procedureContext?.procedureTitle);

    if (blockThreadId && isRemoteThreadId(blockThreadId)) {
      const nextThread: Thread = {
        id: blockThreadId,
        title: nextTitle,
        createdAt: now,
        updatedAt: now,
        procedureId: procedureContext?.procedureId,
        procedureTitle: procedureContext?.procedureTitle,
        language: lang,
        messages: cloneMessages(blockMessages),
      };

      setThreads((currentThreads) => {
        const remainingThreads = currentThreads.filter((thread) => thread.id !== nextThread.id);
        return sortAIThreads([nextThread, ...remainingThreads]);
      });
      setSelectedThreadId(nextThread.id);
      setActiveTab('history');
      toast.success(copy.saved);
      void renameRemoteThread({ threadId: blockThreadId, title: nextTitle }).finally(() => {
        void refetchRemoteThreads();
      });
      return;
    }

    const localThread: Thread = {
      id: createAIId('thread'),
      title: nextTitle,
      createdAt: now,
      updatedAt: now,
      procedureId: procedureContext?.procedureId,
      procedureTitle: procedureContext?.procedureTitle,
      language: lang,
      messages: cloneMessages(blockMessages),
    };

    setThreads((currentThreads) => sortAIThreads([localThread, ...currentThreads]));
    setSelectedThreadId(localThread.id);
    setActiveTab('history');
    toast.success(copy.saved);

    if (!userId) {
      return;
    }

    void createRemoteThreadFromMessages({
      title: nextTitle,
      language: lang,
      procedureId: procedureContext?.procedureId,
      messages: blockMessages,
    })
      .then((remoteThread) => {
        setThreads((currentThreads) => {
          const withoutLocal = currentThreads.filter((thread) => thread.id !== localThread.id);
          return sortAIThreads([remoteThread, ...withoutLocal]);
        });
        setSelectedThreadId(remoteThread.id);
        setBlockThreadId(remoteThread.id);
      })
      .catch((error) => {
        console.warn('[AIWidget] Failed to sync block thread to Supabase.', error);
      });
  }, [
    blockMessages,
    blockThreadId,
    copy.saved,
    createRemoteThreadFromMessages,
    lang,
    procedureContext,
    refetchRemoteThreads,
    renameRemoteThread,
    userId,
  ]);

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

    if (isRemoteThreadId(threadId)) {
      void renameRemoteThread({ threadId, title: nextTitle }).catch((error) => {
        console.warn('[AIWidget] Failed to rename remote thread.', error);
      });
    }
  }, [copy.renamePrompt, renameRemoteThread, threads]);

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

    if (isRemoteThreadId(threadId)) {
      void deleteRemoteThread(threadId).catch((error) => {
        console.warn('[AIWidget] Failed to delete remote thread.', error);
      });
    }
  }, [blockThreadId, copy.deletePrompt, copy.deleted, deleteRemoteThread]);

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
    <div className="flex h-full min-h-0 flex-col" data-testid="ai-widget-panel">
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
            onThreadResolved={(nextThreadId) => {
              setBlockThreadId(nextThreadId);
              void refetchRemoteThreads();
            }}
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
            isLoading={remoteThreadsLoading}
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
                  void refetchRemoteThreads();
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
        <div
          className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[85vh] flex-col rounded-t-[18px] border bg-background shadow-2xl"
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
        >
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
            onMouseDown={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
            onTouchStart={(event) => event.stopPropagation()}
          >
            {panelContent}
          </div>
        </div>
      ) : (
        <div
          className="fixed inset-y-0 right-0 z-[60] flex h-full w-full flex-col border-l bg-background shadow-2xl sm:max-w-[34rem]"
          onClick={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
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
          data-testid="ai-widget-trigger"
        >
          <MessageSquare className="h-5 w-5" />
          IA
        </Button>
      </div>
      {overlayContent}
    </>
  );
}
