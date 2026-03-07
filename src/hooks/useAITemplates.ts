import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { SupportedLang } from '@/lib/types';

export type PromptScenario =
  | 'general'
  | 'fragile'
  | 'airway'
  | 'ponv'
  | 'regional'
  | 'pacu'
  | 'hospital';

export type SavedPromptTemplate = {
  id: string;
  label: string;
  prompt: string;
  language: SupportedLang;
  createdAt: string;
  pinned: boolean;
  procedureId?: string | null;
  procedureTitle?: string | null;
  scenario?: PromptScenario;
};

const AI_TEMPLATE_STORAGE_KEY = 'anesia-ai-saved-templates-v1';
const QUERY_KEY = ['ai-prompt-templates'];

type TemplateRow = {
  id: string;
  created_at: string;
  label: string;
  language: string;
  pinned: boolean;
  procedure_id: string | null;
  procedure_title: string | null;
  prompt: string;
  scenario: string;
  updated_at: string;
  user_id: string;
};

function isBrowser() {
  return typeof window !== 'undefined';
}

function readLocalTemplates() {
  if (!isBrowser()) return [] as SavedPromptTemplate[];

  try {
    const raw = window.localStorage.getItem(AI_TEMPLATE_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as SavedPromptTemplate[]) : [];
  } catch {
    return [];
  }
}

function writeLocalTemplates(templates: SavedPromptTemplate[]) {
  if (!isBrowser()) return;

  try {
    window.localStorage.setItem(AI_TEMPLATE_STORAGE_KEY, JSON.stringify(templates));
  } catch {
    // Ignore storage failures.
  }
}

function normalizeScenario(value: string | null | undefined): PromptScenario {
  if (
    value === 'fragile' ||
    value === 'airway' ||
    value === 'ponv' ||
    value === 'regional' ||
    value === 'pacu' ||
    value === 'hospital'
  ) {
    return value;
  }

  return 'general';
}

function normalizeLanguage(value: string): SupportedLang {
  return value === 'pt' || value === 'en' || value === 'fr' ? value : 'fr';
}

function toTemplate(row: TemplateRow): SavedPromptTemplate {
  return {
    id: row.id,
    label: row.label,
    prompt: row.prompt,
    language: normalizeLanguage(row.language),
    createdAt: row.created_at,
    pinned: row.pinned,
    procedureId: row.procedure_id,
    procedureTitle: row.procedure_title,
    scenario: normalizeScenario(row.scenario),
  };
}

function getFingerprint(template: Pick<SavedPromptTemplate, 'label' | 'prompt' | 'language' | 'scenario' | 'procedureId'>) {
  return [
    template.label.trim().toLowerCase(),
    template.prompt.trim().toLowerCase(),
    template.language,
    template.scenario || 'general',
    template.procedureId || '',
  ].join('::');
}

async function getCurrentUserId() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  return session?.user?.id || null;
}

async function fetchRemoteTemplates() {
  const userId = await getCurrentUserId();
  if (!userId) {
    return { userId: null, templates: [] as SavedPromptTemplate[] };
  }

  const { data, error } = await supabase
    .from('ai_prompt_templates')
    .select(
      'id,created_at,label,language,pinned,procedure_id,procedure_title,prompt,scenario,updated_at,user_id',
    )
    .order('updated_at', { ascending: false });

  if (error) {
    throw error;
  }

  return {
    userId,
    templates: (data || []).map((row) => toTemplate(row as TemplateRow)),
  };
}

export function useAITemplates() {
  const queryClient = useQueryClient();
  const [userId, setUserId] = useState<string | null>(null);
  const [localTemplates, setLocalTemplates] = useState<SavedPromptTemplate[]>(() => readLocalTemplates());

  useEffect(() => {
    writeLocalTemplates(localTemplates);
  }, [localTemplates]);

  useEffect(() => {
    let mounted = true;

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setUserId(session?.user?.id || null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id || null);
      void queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [queryClient]);

  const templatesQuery = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchRemoteTemplates,
    staleTime: 30_000,
  });

  useEffect(() => {
    if (!userId || templatesQuery.isLoading || templatesQuery.isFetching) {
      return;
    }

    const remoteTemplates = templatesQuery.data?.templates || [];
    if (localTemplates.length === 0) {
      return;
    }

    const remoteFingerprints = new Set(remoteTemplates.map((template) => getFingerprint(template)));
    const missingTemplates = localTemplates.filter(
      (template) => !remoteFingerprints.has(getFingerprint(template)),
    );

    if (missingTemplates.length === 0) {
      setLocalTemplates([]);
      return;
    }

    void (async () => {
      const inserts = missingTemplates.map((template) => ({
        user_id: userId,
        label: template.label,
        prompt: template.prompt,
        language: template.language,
        pinned: template.pinned,
        procedure_id: template.procedureId || null,
        procedure_title: template.procedureTitle || null,
        scenario: template.scenario || 'general',
      }));

      const { error } = await supabase.from('ai_prompt_templates').insert(inserts);

      if (error) {
        return;
      }

      setLocalTemplates([]);
      await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    })();
  }, [
    localTemplates,
    queryClient,
    templatesQuery.data?.templates,
    templatesQuery.isFetching,
    templatesQuery.isLoading,
    userId,
  ]);

  const templates = useMemo(() => {
    if (!userId) {
      return localTemplates;
    }

    const remoteTemplates = templatesQuery.data?.templates || [];
    const remoteFingerprints = new Set(remoteTemplates.map((template) => getFingerprint(template)));
    const localFallback = localTemplates.filter(
      (template) => !remoteFingerprints.has(getFingerprint(template)),
    );

    return [...remoteTemplates, ...localFallback];
  }, [localTemplates, templatesQuery.data?.templates, userId]);

  const saveTemplate = async (template: Omit<SavedPromptTemplate, 'id' | 'createdAt'>) => {
    const nextTemplate: SavedPromptTemplate = {
      ...template,
      id: `tpl-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    if (!userId) {
      setLocalTemplates((current) => [nextTemplate, ...current].slice(0, 18));
      return nextTemplate;
    }

    const { data, error } = await supabase
      .from('ai_prompt_templates')
      .insert({
        user_id: userId,
        label: template.label,
        prompt: template.prompt,
        language: template.language,
        pinned: template.pinned,
        procedure_id: template.procedureId || null,
        procedure_title: template.procedureTitle || null,
        scenario: template.scenario || 'general',
      })
      .select(
        'id,created_at,label,language,pinned,procedure_id,procedure_title,prompt,scenario,updated_at,user_id',
      )
      .single();

    if (error || !data) {
      setLocalTemplates((current) => [nextTemplate, ...current].slice(0, 18));
      throw error || new Error('Failed to save template remotely.');
    }

    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    return toTemplate(data as TemplateRow);
  };

  const deleteTemplate = async (templateId: string) => {
    setLocalTemplates((current) => current.filter((template) => template.id !== templateId));

    if (!userId) {
      return;
    }

    const { error } = await supabase.from('ai_prompt_templates').delete().eq('id', templateId);
    if (error) {
      throw error;
    }
    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  const togglePinnedTemplate = async (templateId: string) => {
    const targetTemplate = templates.find((template) => template.id === templateId);
    if (!targetTemplate) {
      return;
    }

    setLocalTemplates((current) =>
      current.map((template) =>
        template.id === templateId ? { ...template, pinned: !template.pinned } : template,
      ),
    );

    if (!userId) {
      return;
    }

    const { error } = await supabase
      .from('ai_prompt_templates')
      .update({ pinned: !targetTemplate.pinned })
      .eq('id', templateId);

    if (error) {
      throw error;
    }

    await queryClient.invalidateQueries({ queryKey: QUERY_KEY });
  };

  return {
    userId,
    templates,
    isLoading: templatesQuery.isLoading,
    isFetching: templatesQuery.isFetching,
    error: templatesQuery.error,
    saveTemplate,
    deleteTemplate,
    togglePinnedTemplate,
  };
}
