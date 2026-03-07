import {
  AlertTriangle,
  ArrowRight,
  Save,
  SendHorizonal,
  Sparkles,
  Star,
  Square,
  Trash2,
} from 'lucide-react';
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from 'react';
import { toast } from 'sonner';
import {
  useAIProcedureContext,
  type AIProcedureContextValue,
} from '@/contexts/AIProcedureContext';
import { useLang } from '@/contexts/LanguageContext';
import { useAI } from '@/hooks/useAI';
import { useHospitalProfile } from '@/hooks/useHospitalProfile';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createAIId, detectPIIInText, type Message } from './AIWidget.types';

type PromptScenario =
  | 'all'
  | 'general'
  | 'fragile'
  | 'airway'
  | 'ponv'
  | 'regional'
  | 'pacu'
  | 'hospital';
type QuickPrompt = { label: string; prompt: string; scenario?: Exclude<PromptScenario, 'all'> };
type AIResponseMode = 'checklist' | 'plan' | 'quick' | 'risk';
type SavedPromptTemplate = {
  id: string;
  label: string;
  prompt: string;
  language: 'fr' | 'pt' | 'en';
  createdAt: string;
  pinned: boolean;
  procedureId?: string | null;
  procedureTitle?: string | null;
  scenario?: Exclude<PromptScenario, 'all'>;
};

const AI_TEMPLATE_STORAGE_KEY = 'anesia-ai-saved-templates-v1';

interface AIChatProps {
  canSaveToHistory?: boolean;
  emptyState: string;
  messages: Message[];
  mode: 'block' | 'history';
  onClear?: () => void;
  onSaveToHistory?: () => void;
  onThreadResolved?: (threadId: string) => void;
  procedureContextOverride?: AIProcedureContextValue | null;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  threadId?: string | null;
  quickPrompts?: QuickPrompt[];
}

export default function AIChat({
  canSaveToHistory = false,
  emptyState,
  messages,
  mode,
  onClear,
  onSaveToHistory,
  onThreadResolved,
  procedureContextOverride,
  setMessages,
  threadId,
  quickPrompts = [],
}: AIChatProps) {
  const { lang } = useLang();
  const { procedureContext } = useAIProcedureContext();
  const hospitalProfile = useHospitalProfile();
  const effectiveProcedureContext = procedureContextOverride ?? procedureContext;
  const { ask, cancel, error, isLoading } = useAI();
  const [draft, setDraft] = useState('');
  const [responseMode, setResponseMode] = useLocalStorage<AIResponseMode>(
    'anesia-ai-response-mode',
    'plan',
  );
  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedPromptTemplate[]>(
    AI_TEMPLATE_STORAGE_KEY,
    [],
  );
  const [selectedScenario, setSelectedScenario] = useState<PromptScenario>('all');
  const endRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const piiIssues = useMemo(() => detectPIIInText(draft), [draft]);
  const copy =
    lang === 'fr'
      ? {
          confirmPII:
            'Une donnee potentiellement identifiable a ete detectee. Voulez-vous vraiment envoyer ?',
          requestFailed: "Impossible d'obtenir une reponse IA pour le moment.",
          piiBanner: "Ne pas introduire de donnees identifiables (nom, numero de dossier, etc.).",
          procedureBadge: 'Intervention',
          generating: 'Generation de la reponse...',
          placeholder: 'Ecrivez votre question...',
          piiDetected: 'PII potentielle detectee',
          missingInformation: 'Informations manquantes',
          plan: 'Plan',
          preop: 'Pre-op',
          intraop: 'Per-op',
          postop: 'Post-op',
          redFlags: 'Red flags',
          checklist: 'Checklist',
          citations: 'Sources',
          groundingMissing: 'Aucune source explicite n a ete reliee a cette reponse.',
          followUps: 'Questions suivantes',
          modeLabel: 'Mode',
          templatesLabel: 'Templates sauvegardes',
          templateSave: 'Sauver comme template',
          templateDelete: 'Supprimer template',
          templatePrompt: 'Nom du template',
          templateSaved: 'Template sauvegarde.',
          templateDeleted: 'Template supprime.',
          templateEmpty: 'Ecrivez un prompt avant de le sauvegarder.',
          templateCase: 'Cas actif',
          templatePinned: 'Epingle',
          scenariosLabel: 'Scenario',
          clear: 'Effacer',
          saveToHistory: "Enregistrer dans l'historique",
          stop: 'Arreter',
          send: 'Envoyer',
        }
      : lang === 'pt'
        ? {
            confirmPII:
              'Foi detetado um dado potencialmente identificavel. Queres mesmo enviar?',
            requestFailed: 'Nao foi possivel obter resposta da IA de momento.',
            piiBanner: 'Nao introduzir dados identificaveis (nome, numero de processo, etc.)',
            procedureBadge: 'Intervencao',
            generating: 'A gerar resposta...',
            placeholder: 'Escreve a tua pergunta...',
            piiDetected: 'Possivel PII detetada',
            missingInformation: 'Informacao em falta',
            plan: 'Plano',
            preop: 'Pre-op',
            intraop: 'Intra-op',
            postop: 'Pos-op',
            redFlags: 'Red flags',
            checklist: 'Checklist',
            citations: 'Fontes',
            groundingMissing: 'Nenhuma fonte explicita foi ligada a esta resposta.',
            followUps: 'Perguntas seguintes',
            modeLabel: 'Modo',
            templatesLabel: 'Templates guardados',
            templateSave: 'Guardar como template',
            templateDelete: 'Apagar template',
            templatePrompt: 'Nome do template',
            templateSaved: 'Template guardado.',
            templateDeleted: 'Template apagado.',
            templateEmpty: 'Escreve um prompt antes de o guardar.',
            templateCase: 'Caso ativo',
            templatePinned: 'Fixado',
            scenariosLabel: 'Cenario',
            clear: 'Limpar',
            saveToHistory: 'Guardar no historico',
            stop: 'Parar',
            send: 'Enviar',
          }
        : {
            confirmPII:
              'Potentially identifying data was detected. Do you want to send this anyway?',
            requestFailed: 'The AI response is unavailable right now.',
            piiBanner: 'Do not include identifiable data (name, record number, etc.).',
            procedureBadge: 'Intervention',
            generating: 'Generating response...',
            placeholder: 'Write your question...',
            piiDetected: 'Possible PII detected',
            missingInformation: 'Missing information',
            plan: 'Plan',
            preop: 'Pre-op',
            intraop: 'Intra-op',
            postop: 'Post-op',
            redFlags: 'Red flags',
            checklist: 'Checklist',
            citations: 'Grounding',
            groundingMissing: 'No explicit source was attached to this answer.',
            followUps: 'Follow-up prompts',
            modeLabel: 'Mode',
            templatesLabel: 'Saved templates',
            templateSave: 'Save as template',
            templateDelete: 'Delete template',
            templatePrompt: 'Template name',
            templateSaved: 'Template saved.',
            templateDeleted: 'Template deleted.',
            templateEmpty: 'Write a prompt before saving it.',
            templateCase: 'Current case',
            templatePinned: 'Pinned',
            scenariosLabel: 'Scenario',
            clear: 'Clear',
            saveToHistory: 'Save to history',
            stop: 'Stop',
            send: 'Send',
          };
  const responseModes = useMemo(
    () =>
      lang === 'fr'
        ? [
            { value: 'plan' as const, label: 'Plan' },
            { value: 'quick' as const, label: 'Rapide' },
            { value: 'risk' as const, label: 'Risque' },
            { value: 'checklist' as const, label: 'Checklist' },
          ]
        : lang === 'pt'
          ? [
              { value: 'plan' as const, label: 'Plano' },
              { value: 'quick' as const, label: 'Rapido' },
              { value: 'risk' as const, label: 'Risco' },
              { value: 'checklist' as const, label: 'Checklist' },
            ]
          : [
              { value: 'plan' as const, label: 'Plan' },
              { value: 'quick' as const, label: 'Quick' },
              { value: 'risk' as const, label: 'Risk' },
              { value: 'checklist' as const, label: 'Checklist' },
            ],
    [lang],
  );
  const scenarioOptions = useMemo(
    () =>
      lang === 'fr'
        ? [
            { value: 'all' as const, label: 'Tous' },
            { value: 'general' as const, label: 'General' },
            { value: 'fragile' as const, label: 'Fragile' },
            { value: 'airway' as const, label: 'Voie aerienne' },
            { value: 'ponv' as const, label: 'NVPO' },
            { value: 'regional' as const, label: 'ALR' },
            { value: 'pacu' as const, label: 'Reveil' },
            { value: 'hospital' as const, label: 'Hopital' },
          ]
        : lang === 'pt'
          ? [
              { value: 'all' as const, label: 'Todos' },
              { value: 'general' as const, label: 'Geral' },
              { value: 'fragile' as const, label: 'Fragil' },
              { value: 'airway' as const, label: 'Via aerea' },
              { value: 'ponv' as const, label: 'PONV' },
              { value: 'regional' as const, label: 'ALR' },
              { value: 'pacu' as const, label: 'Recobro' },
              { value: 'hospital' as const, label: 'Hospital' },
            ]
          : [
              { value: 'all' as const, label: 'All' },
              { value: 'general' as const, label: 'General' },
              { value: 'fragile' as const, label: 'Fragile' },
              { value: 'airway' as const, label: 'Airway' },
              { value: 'ponv' as const, label: 'PONV' },
              { value: 'regional' as const, label: 'Regional' },
              { value: 'pacu' as const, label: 'PACU' },
              { value: 'hospital' as const, label: 'Hospital' },
            ],
    [lang],
  );
  const languageTemplates = useMemo(
    () =>
      savedTemplates
        .filter((template) => template.language === lang)
        .filter((template) => selectedScenario === 'all' || template.scenario === selectedScenario)
        .sort((left, right) => {
          const leftCurrent = left.procedureId && left.procedureId === effectiveProcedureContext?.procedureId;
          const rightCurrent =
            right.procedureId && right.procedureId === effectiveProcedureContext?.procedureId;

          if (leftCurrent !== rightCurrent) {
            return rightCurrent ? 1 : -1;
          }

          if (left.pinned !== right.pinned) {
            return left.pinned ? -1 : 1;
          }

          return right.createdAt.localeCompare(left.createdAt);
        }),
    [effectiveProcedureContext?.procedureId, lang, savedTemplates, selectedScenario],
  );
  const filteredQuickPrompts = useMemo(
    () =>
      quickPrompts.filter(
        (prompt) => selectedScenario === 'all' || prompt.scenario === selectedScenario,
      ),
    [quickPrompts, selectedScenario],
  );

  const handleSaveTemplate = () => {
    const prompt = draft.trim();

    if (!prompt) {
      toast.error(copy.templateEmpty);
      return;
    }

    const label =
      window.prompt(copy.templatePrompt, prompt.slice(0, 36))?.trim() || prompt.slice(0, 36);

    if (!label) {
      return;
    }

    const nextTemplate: SavedPromptTemplate = {
      id: createAIId('tpl'),
      label,
      prompt,
      language: lang,
      createdAt: new Date().toISOString(),
      pinned: false,
      procedureId: effectiveProcedureContext?.procedureId || null,
      procedureTitle: effectiveProcedureContext?.procedureTitle || null,
      scenario: selectedScenario === 'all' ? 'general' : selectedScenario,
    };

    setSavedTemplates((current) => [nextTemplate, ...current].slice(0, 18));
    toast.success(copy.templateSaved);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setSavedTemplates((current) => current.filter((template) => template.id !== templateId));
    toast.success(copy.templateDeleted);
  };

  const handleTogglePinnedTemplate = (templateId: string) => {
    setSavedTemplates((current) =>
      current.map((template) =>
        template.id === templateId ? { ...template, pinned: !template.pinned } : template,
      ),
    );
  };

  const renderStructuredMessage = (message: Message) => {
    if (!message.structured) {
      return <p className="whitespace-pre-wrap break-words">{message.content}</p>;
    }

    const { structured } = message;
    const planSections = [
      { key: 'preop', label: copy.preop, items: structured.plan.preop },
      { key: 'intraop', label: copy.intraop, items: structured.plan.intraop },
      { key: 'postop', label: copy.postop, items: structured.plan.postop },
    ].filter((section) => section.items.length > 0);

    return (
      <div className="space-y-3">
        <p className="whitespace-pre-wrap break-words font-medium">
          {structured.assessment || message.content}
        </p>

        {structured.missingInformation.length > 0 && (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
            <p className="font-semibold">{copy.missingInformation}</p>
            <ul className="mt-1 space-y-1">
              {structured.missingInformation.map((item) => (
                <li key={item} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {planSections.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{copy.plan}</p>
            <div className="grid gap-2">
              {planSections.map((section) => (
                <div
                  key={section.key}
                  className="rounded-xl border border-border/70 bg-background/70 px-3 py-2"
                >
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    {section.label}
                  </p>
                  <ul className="mt-1 space-y-1 text-xs text-foreground">
                    {section.items.map((item) => (
                      <li key={`${section.key}-${item}`} className="flex gap-2">
                        <ArrowRight className="mt-0.5 h-3 w-3 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {structured.redFlags.length > 0 && (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs">
            <p className="font-semibold text-destructive">{copy.redFlags}</p>
            <ul className="mt-1 space-y-1 text-foreground">
              {structured.redFlags.map((item) => (
                <li key={item} className="flex gap-2">
                  <span>•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {structured.checklist.length > 0 && (
          <div className="rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs">
            <p className="font-semibold text-foreground">{copy.checklist}</p>
            <ul className="mt-1 space-y-1 text-foreground">
              {structured.checklist.map((item) => (
                <li key={item} className="flex gap-2">
                  <span>□</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {structured.citations.length > 0 ? (
          <div className="space-y-1 rounded-xl border border-border/70 bg-background/70 px-3 py-2 text-xs">
            <p className="font-semibold text-foreground">{copy.citations}</p>
            <div className="flex flex-wrap gap-2">
              {structured.citations.map((citation) => (
                <a
                  key={citation.id}
                  href={citation.url || undefined}
                  className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-1 text-xs text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  target={citation.url?.startsWith('http') ? '_blank' : undefined}
                  rel={citation.url?.startsWith('http') ? 'noreferrer' : undefined}
                >
                  <span>{citation.label}</span>
                </a>
              ))}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-amber-300/60 bg-amber-50/80 px-3 py-2 text-xs text-amber-950">
            <p className="font-semibold">{copy.citations}</p>
            <p>{copy.groundingMissing}</p>
          </div>
        )}

        {message.followUpQuestions && message.followUpQuestions.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">{copy.followUps}</p>
            <div className="flex flex-wrap gap-2">
              {message.followUpQuestions.map((item) => (
                <Button
                  key={item}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-7 rounded-full px-2.5 text-[11px]"
                  onClick={() => setDraft(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const focusTextarea = () => {
    textareaRef.current?.focus();
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      focusTextarea();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [mode, threadId]);

  const handleSend = async () => {
    const question = draft.trim();

    if (!question || isLoading) {
      return;
    }

    const issues = detectPIIInText(question);

    if (issues.length > 0) {
      const shouldContinue = window.confirm(copy.confirmPII);

      if (!shouldContinue) {
        return;
      }
    }

    const userMessage: Message = {
      id: createAIId('msg'),
      role: 'user',
      content: question,
      createdAt: new Date().toISOString(),
      ...(issues.length > 0 ? { flags: issues } : {}),
    };

    setMessages((currentMessages) => [...currentMessages, userMessage]);
    setDraft('');

    try {
      const result = await ask({
        question,
        procedureId: effectiveProcedureContext?.procedureId,
        threadId: threadId || undefined,
        language: lang,
        responseMode,
        constraints: hospitalProfile?.id
          ? {
              hospitalId: hospitalProfile.id,
            }
          : undefined,
      });

      const assistantMessage: Message = {
        id: createAIId('msg'),
        role: 'assistant',
        content: result.answer,
        createdAt: new Date().toISOString(),
        ...(result.flags.length > 0 ? { flags: result.flags } : {}),
        ...(result.followUpQuestions.length > 0
          ? { followUpQuestions: result.followUpQuestions }
          : {}),
        ...(result.structured ? { structured: result.structured } : {}),
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);

      if (result.threadId) {
        onThreadResolved?.(result.threadId);
      }
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') {
        return;
      }

      const failureMessage = copy.requestFailed;

      toast.error(
        requestError instanceof Error && requestError.message
          ? requestError.message
          : failureMessage,
      );

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createAIId('msg'),
          role: 'assistant',
          content: failureMessage,
          createdAt: new Date().toISOString(),
          flags: ['request_error'],
        },
      ]);
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
        {copy.piiBanner}
      </div>

      {effectiveProcedureContext?.procedureId && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2">
          <Badge variant="secondary">{copy.procedureBadge}</Badge>
          <span className="text-xs font-medium text-foreground">
            {effectiveProcedureContext.procedureId}
          </span>
          {effectiveProcedureContext.procedureTitle && (
            <span className="text-xs text-muted-foreground">
              {effectiveProcedureContext.procedureTitle}
            </span>
          )}
        </div>
      )}

      {mode === 'block' && (
        <div className="rounded-xl border border-border/70 bg-background px-3 py-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.scenariosLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {scenarioOptions.map((scenario) => (
              <Button
                key={scenario.value}
                type="button"
                variant={selectedScenario === scenario.value ? 'default' : 'outline'}
                size="sm"
                className="h-7 rounded-full px-2.5 text-[11px]"
                onClick={() => setSelectedScenario(scenario.value)}
              >
                {scenario.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {mode === 'block' && filteredQuickPrompts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredQuickPrompts.map((prompt) => (
            <Button
              key={prompt.label}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setDraft(prompt.prompt)}
            >
              {prompt.label}
            </Button>
          ))}
        </div>
      )}

      {mode === 'block' && languageTemplates.length > 0 && (
        <div className="rounded-xl border border-border/70 bg-background px-3 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {copy.templatesLabel}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {languageTemplates.slice(0, 6).map((template) => (
              <div
                key={template.id}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/30 pr-1"
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 rounded-full px-3 text-xs"
                  onClick={() => setDraft(template.prompt)}
                >
                  <span>{template.label}</span>
                  {template.procedureId === effectiveProcedureContext?.procedureId && (
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] text-primary">
                      {copy.templateCase}
                    </span>
                  )}
                  {template.pinned && (
                    <span className="rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] text-accent">
                      {copy.templatePinned}
                    </span>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => handleTogglePinnedTemplate(template.id)}
                  aria-label={copy.templatePinned}
                >
                  <Star
                    className={`h-3.5 w-3.5 ${template.pinned ? 'fill-current text-accent' : ''}`}
                  />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-full"
                  onClick={() => handleDeleteTemplate(template.id)}
                  aria-label={copy.templateDelete}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {copy.modeLabel}
        </span>
        {responseModes.map((modeOption) => (
          <Button
            key={modeOption.value}
            type="button"
            variant={responseMode === modeOption.value ? 'default' : 'outline'}
            size="sm"
            className="h-7 rounded-full px-2.5 text-[11px]"
            onClick={() => setResponseMode(modeOption.value)}
          >
            {modeOption.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="min-h-[14rem] flex-1 rounded-2xl border border-border/70 bg-background p-3">
        <div className="space-y-3">
          {messages.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 px-4 py-6 text-center text-sm text-muted-foreground">
              <Sparkles className="mx-auto mb-2 h-5 w-5 text-primary" />
              {emptyState}
            </div>
          )}

          {messages.map((message) => {
            const isUser = message.role === 'user';

            return (
              <div
                key={message.id}
                className={cn('flex', isUser ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-3 py-2 text-sm shadow-sm',
                    isUser
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground',
                  )}
                >
                  {isUser ? (
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                  ) : (
                    renderStructuredMessage(message)
                  )}
                  {message.flags && message.flags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.flags.map((flag) => (
                        <Badge
                          key={`${message.id}-${flag}`}
                          variant={flag === 'request_error' ? 'destructive' : 'outline'}
                          className="text-[10px]"
                        >
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex justify-start">
              <div className="rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">
                {copy.generating}
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>
      </ScrollArea>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          <AlertTriangle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div
        className="space-y-3 rounded-2xl border border-border/70 bg-background p-3"
        data-vaul-no-drag
        onMouseDown={(event) => event.stopPropagation()}
        onPointerDown={(event) => event.stopPropagation()}
        onTouchStart={(event) => event.stopPropagation()}
      >
        <Textarea
          ref={textareaRef}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={copy.placeholder}
          className="min-h-[110px] resize-none"
          data-testid="ai-chat-textarea"
          data-vaul-no-drag
          autoFocus
          onFocus={(event) => event.stopPropagation()}
          onMouseDown={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onTouchStart={(event) => event.stopPropagation()}
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
              event.preventDefault();
              void handleSend();
            }
          }}
        />

        {piiIssues.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <span>
              {copy.piiDetected}: {piiIssues.join(', ')}.
            </span>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {mode === 'block' && onClear && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClear}
                disabled={messages.length === 0 && !draft}
              >
                <Trash2 className="h-4 w-4" />
                {copy.clear}
              </Button>
            )}
            {mode === 'block' && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleSaveTemplate}
                disabled={!draft.trim()}
              >
                <Save className="h-4 w-4" />
                {copy.templateSave}
              </Button>
            )}
            {mode === 'block' && onSaveToHistory && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={onSaveToHistory}
                disabled={!canSaveToHistory}
              >
                <Save className="h-4 w-4" />
                {copy.saveToHistory}
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <Button type="button" variant="outline" size="sm" onClick={cancel}>
                <Square className="h-3.5 w-3.5" />
                {copy.stop}
              </Button>
            )}
            <Button type="button" size="sm" onClick={handleSend} disabled={!draft.trim() || isLoading}>
              <SendHorizonal className="h-4 w-4" />
              {copy.send}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
