import { Copy, Pencil, Search, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLang } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { formatAIThreadDate, type Thread } from './AIWidget.types';

interface AIThreadListProps {
  search: string;
  selectedThreadId: string | null;
  threads: Thread[];
  onDeleteThread: (threadId: string) => void;
  onDuplicateThread: (threadId: string) => void;
  onRenameThread: (threadId: string) => void;
  onSearchChange: (value: string) => void;
  onSelectThread: (threadId: string) => void;
}

export default function AIThreadList({
  search,
  selectedThreadId,
  threads,
  onDeleteThread,
  onDuplicateThread,
  onRenameThread,
  onSearchChange,
  onSelectThread,
}: AIThreadListProps) {
  const { lang } = useLang();
  const copy =
    lang === 'fr'
      ? {
          search: 'Rechercher par titre',
          empty: 'Aucune conversation trouvee.',
          rename: 'Renommer',
          duplicate: 'Dupliquer vers le Bloc',
          delete: 'Supprimer',
        }
      : lang === 'pt'
        ? {
            search: 'Pesquisar por titulo',
            empty: 'Nenhuma conversa encontrada.',
            rename: 'Renomear',
            duplicate: 'Duplicar para Bloco',
            delete: 'Apagar',
          }
        : {
            search: 'Search by title',
            empty: 'No conversations found.',
            rename: 'Rename',
            duplicate: 'Duplicate to workspace',
            delete: 'Delete',
          };

  return (
    <div className="space-y-3 rounded-2xl border border-border/70 bg-muted/20 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={copy.search}
          className="pl-9"
        />
      </div>

      <ScrollArea className="h-56 pr-3">
        <div className="space-y-2">
          {threads.length === 0 && (
            <div className="rounded-xl border border-dashed border-border bg-background/80 px-3 py-4 text-sm text-muted-foreground">
              {copy.empty}
            </div>
          )}

          {threads.map((thread) => {
            const isSelected = thread.id === selectedThreadId;

            return (
              <div
                key={thread.id}
                className={cn(
                  'flex items-start justify-between gap-3 rounded-xl border p-3 transition-colors',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border bg-background hover:border-primary/40 hover:bg-muted/50',
                )}
              >
                <button
                  type="button"
                  onClick={() => onSelectThread(thread.id)}
                  className="min-w-0 flex-1 text-left"
                >
                    <p className="truncate text-sm font-semibold text-foreground">{thread.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatAIThreadDate(thread.updatedAt)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {thread.procedureId && (
                        <Badge variant="secondary" className="max-w-full truncate text-[10px]">
                          {thread.procedureId}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {thread.language}
                      </Badge>
                    </div>
                </button>

                <div className="flex shrink-0 items-center gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onRenameThread(thread.id)}
                    aria-label={copy.rename}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => onDuplicateThread(thread.id)}
                    aria-label={copy.duplicate}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => onDeleteThread(thread.id)}
                    aria-label={copy.delete}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
