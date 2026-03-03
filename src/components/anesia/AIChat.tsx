import {
  AlertTriangle,
  Save,
  SendHorizonal,
  Sparkles,
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
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { createAIId, detectPIIInText, type Message } from './AIWidget.types';

interface AIChatProps {
  canSaveToHistory?: boolean;
  emptyState: string;
  messages: Message[];
  mode: 'block' | 'history';
  onClear?: () => void;
  onSaveToHistory?: () => void;
  procedureContextOverride?: AIProcedureContextValue | null;
  setMessages: Dispatch<SetStateAction<Message[]>>;
  quickPrompts?: string[];
}

export default function AIChat({
  canSaveToHistory = false,
  emptyState,
  messages,
  mode,
  onClear,
  onSaveToHistory,
  procedureContextOverride,
  setMessages,
  quickPrompts = [],
}: AIChatProps) {
  const { lang } = useLang();
  const { procedureContext } = useAIProcedureContext();
  const effectiveProcedureContext = procedureContextOverride ?? procedureContext;
  const { ask, cancel, error, isLoading } = useAI();
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement | null>(null);
  const piiIssues = useMemo(() => detectPIIInText(draft), [draft]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isLoading]);

  const handleSend = async () => {
    const question = draft.trim();

    if (!question || isLoading) {
      return;
    }

    const issues = detectPIIInText(question);

    if (issues.length > 0) {
      const shouldContinue = window.confirm(
        'Foi detetado possivel dado identificavel. Confirma que pretende enviar mesmo assim?',
      );

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
      const answer = await ask({
        question,
        procedureId: effectiveProcedureContext?.procedureId,
        procedureTitle: effectiveProcedureContext?.procedureTitle,
        language: lang,
      });

      const assistantMessage: Message = {
        id: createAIId('msg'),
        role: 'assistant',
        content: answer,
        createdAt: new Date().toISOString(),
      };

      setMessages((currentMessages) => [...currentMessages, assistantMessage]);
    } catch (requestError) {
      if (requestError instanceof DOMException && requestError.name === 'AbortError') {
        return;
      }

      const failureMessage = 'Nao foi possivel obter resposta da IA de momento.';

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
        Nao introduzir dados identificaveis (nome, n processo, etc.)
      </div>

      {effectiveProcedureContext?.procedureId && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border/70 bg-background px-3 py-2">
          <Badge variant="secondary">Procedure</Badge>
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

      {mode === 'block' && quickPrompts.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quickPrompts.map((prompt) => (
            <Button
              key={prompt}
              type="button"
              variant="outline"
              size="sm"
              className="h-8 rounded-full px-3 text-xs"
              onClick={() => setDraft(prompt)}
            >
              {prompt}
            </Button>
          ))}
        </div>
      )}

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
                  <p className="whitespace-pre-wrap break-words">{message.content}</p>
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
                A gerar resposta...
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

      <div className="space-y-3 rounded-2xl border border-border/70 bg-background p-3">
        <Textarea
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Escreva a sua pergunta..."
          className="min-h-[110px] resize-none"
        />

        {piiIssues.length > 0 && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-300/60 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <AlertTriangle className="h-4 w-4" />
            <span>Possivel PII detetada: {piiIssues.join(', ')}.</span>
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
                Limpar
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
                Guardar no historico
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isLoading && (
              <Button type="button" variant="outline" size="sm" onClick={cancel}>
                <Square className="h-3.5 w-3.5" />
                Parar
              </Button>
            )}
            <Button type="button" size="sm" onClick={handleSend} disabled={!draft.trim() || isLoading}>
              <SendHorizonal className="h-4 w-4" />
              Enviar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
