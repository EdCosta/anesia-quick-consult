import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type BillingRequestRow = {
  id: string;
  user_id: string;
  method: 'stripe' | 'sepa_transfer' | 'invoice';
  status: 'pending' | 'approved' | 'paid' | 'rejected' | 'canceled';
  contact_email: string | null;
  notes: string | null;
  amount_cents: number | null;
  currency: string;
  created_at: string;
  admin_comment: string | null;
  approved_expires_at: string | null;
  external_payment_reference: string | null;
};

const STATUSES: BillingRequestRow['status'][] = [
  'pending',
  'approved',
  'paid',
  'rejected',
  'canceled',
];

function formatAmount(row: BillingRequestRow): string {
  if (!row.amount_cents || !row.currency) return '-';
  return new Intl.NumberFormat('fr-BE', {
    style: 'currency',
    currency: row.currency.toUpperCase(),
  }).format(row.amount_cents / 100);
}

export default function AdminBilling() {
  const { isAdmin, loading } = useIsAdmin();
  const [requests, setRequests] = useState<BillingRequestRow[]>([]);
  const [fetching, setFetching] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | BillingRequestRow['status']>('all');
  const [drafts, setDrafts] = useState<Record<string, { status: BillingRequestRow['status']; admin_comment: string; approved_expires_at: string }>>({});

  async function loadRequests() {
    setFetching(true);
    const { data, error } = await supabase
      .from('pro_upgrade_requests' as any)
      .select(
        'id,user_id,method,status,contact_email,notes,amount_cents,currency,created_at,admin_comment,approved_expires_at,external_payment_reference',
      )
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      toast.error(error.message);
      setFetching(false);
      return;
    }

    const rows = (Array.isArray(data) ? data : []) as BillingRequestRow[];
    setRequests(rows);
    setDrafts(
      Object.fromEntries(
        rows.map((row) => [
          row.id,
          {
            status: row.status,
            admin_comment: row.admin_comment || '',
            approved_expires_at: row.approved_expires_at
              ? new Date(row.approved_expires_at).toISOString().slice(0, 10)
              : '',
          },
        ]),
      ),
    );
    setFetching(false);
  }

  useEffect(() => {
    if (!isAdmin) return;
    void loadRequests();
  }, [isAdmin]);

  const visibleRows = useMemo(() => {
    if (filterStatus === 'all') return requests;
    return requests.filter((row) => row.status === filterStatus);
  }, [filterStatus, requests]);

  async function saveRow(id: string) {
    const draft = drafts[id];
    if (!draft) return;

    setSavingId(id);
    const payload = {
      status: draft.status,
      admin_comment: draft.admin_comment.trim() || null,
      approved_expires_at: draft.approved_expires_at
        ? new Date(draft.approved_expires_at).toISOString()
        : null,
    };

    const { error } = await supabase
      .from('pro_upgrade_requests' as any)
      .update(payload)
      .eq('id', id);

    if (error) {
      toast.error(error.message);
      setSavingId(null);
      return;
    }

    toast.success('Saved');
    await loadRequests();
    setSavingId(null);
  }

  if (loading) {
    return (
      <div className="container max-w-6xl py-6">
        <p className="text-sm text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-6xl py-6 space-y-3">
        <Link to="/" className="text-sm text-primary hover:underline">
          Back
        </Link>
        <p className="text-sm text-muted-foreground">Admin only.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-foreground">Billing requests</h2>
        <div className="flex items-center gap-2">
          <select
            className="rounded border border-border bg-background px-2 py-1 text-sm"
            value={filterStatus}
            onChange={(event) => setFilterStatus(event.target.value as 'all' | BillingRequestRow['status'])}
          >
            <option value="all">All</option>
            {STATUSES.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <Button size="sm" variant="outline" onClick={() => void loadRequests()}>
            Refresh
          </Button>
        </div>
      </div>

      {fetching ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : visibleRows.length === 0 ? (
        <p className="text-sm text-muted-foreground">No billing requests found.</p>
      ) : (
        <div className="space-y-3">
          {visibleRows.map((row) => {
            const draft = drafts[row.id];
            return (
              <Card key={row.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">
                    {row.method} • {formatAmount(row)} • {row.status}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="grid gap-2 md:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">User ID</p>
                      <p className="font-mono text-xs break-all">{row.user_id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Contact</p>
                      <p>{row.contact_email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p>{new Date(row.created_at).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="break-all">{row.external_payment_reference || '-'}</p>
                    </div>
                  </div>

                  {row.notes && (
                    <div>
                      <p className="text-xs text-muted-foreground">User note</p>
                      <p className="text-sm">{row.notes}</p>
                    </div>
                  )}

                  <div className="grid gap-2 md:grid-cols-3">
                    <label className="space-y-1">
                      <span className="text-xs text-muted-foreground">Status</span>
                      <select
                        className="w-full rounded border border-border bg-background px-2 py-1 text-sm"
                        value={draft?.status || row.status}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [row.id]: {
                              ...(prev[row.id] || {
                                status: row.status,
                                admin_comment: row.admin_comment || '',
                                approved_expires_at: '',
                              }),
                              status: event.target.value as BillingRequestRow['status'],
                            },
                          }))
                        }
                      >
                        {STATUSES.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs text-muted-foreground">Pro expires (optional)</span>
                      <Input
                        type="date"
                        value={draft?.approved_expires_at || ''}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [row.id]: {
                              ...(prev[row.id] || {
                                status: row.status,
                                admin_comment: row.admin_comment || '',
                                approved_expires_at: '',
                              }),
                              approved_expires_at: event.target.value,
                            },
                          }))
                        }
                      />
                    </label>

                    <label className="space-y-1">
                      <span className="text-xs text-muted-foreground">Admin comment</span>
                      <Input
                        value={draft?.admin_comment || ''}
                        onChange={(event) =>
                          setDrafts((prev) => ({
                            ...prev,
                            [row.id]: {
                              ...(prev[row.id] || {
                                status: row.status,
                                admin_comment: row.admin_comment || '',
                                approved_expires_at: '',
                              }),
                              admin_comment: event.target.value,
                            },
                          }))
                        }
                      />
                    </label>
                  </div>

                  <Button
                    size="sm"
                    onClick={() => void saveRow(row.id)}
                    disabled={savingId === row.id}
                  >
                    {savingId === row.id ? 'Saving...' : 'Save'}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
