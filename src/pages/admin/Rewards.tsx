import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAdminRewards, useAdminUpsertReward, useAdminDeleteReward, type AdminReward } from '@/hooks/useAdminRewards';
import { Plus, Trash2, Pencil, RefreshCw } from 'lucide-react';

const emptyForm: Partial<AdminReward> = {
  name: '',
  description: '',
  category: 'fitness',
  type: 'product',
  suor_price: 100,
  original_price: undefined,
  stock_quantity: 0,
  max_per_user: 1,
  partner_name: '',
  image_urls: [],
  redemption_instructions: '',
  is_featured: false,
  is_active: true,
  order_index: 0,
};

export default function Rewards() {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<Partial<AdminReward> | null>(null);
  const [open, setOpen] = useState(false);
  const { data: rewards, refetch, isLoading } = useAdminRewards(search);
  const upsert = useAdminUpsertReward();
  const del = useAdminDeleteReward();

  const onCreate = () => {
    setEditing(emptyForm);
    setOpen(true);
  };

  const onEdit = (r: AdminReward) => {
    setEditing(r);
    setOpen(true);
  };

  const onDelete = async (id: string) => {
    if (!confirm('Remover recompensa? Esta ação é irreversível.')) return;
    await del.mutateAsync(id);
  };

  const handleSave = async () => {
    if (!editing) return;
    const payload = { ...editing } as any;
    // Normalizações simples
    if (!payload.name || !payload.partner_name) return;
    await upsert.mutateAsync(payload);
    setOpen(false);
    setEditing(null);
  };

  const list = useMemo(() => rewards || [], [rewards]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Recompensas</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" /> Atualizar
          </Button>
          <Button onClick={onCreate}>
            <Plus className="h-4 w-4 mr-2" /> Nova Recompensa
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Input placeholder="Buscar por nome" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />
      </div>

      <Separator />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((r) => (
          <Card key={r.id} className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="truncate">{r.name}</span>
                <div className="flex items-center gap-2">
                  {r.is_featured && <Badge variant="secondary">Destaque</Badge>}
                  {!r.is_active && <Badge variant="destructive">Inativa</Badge>}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground line-clamp-2">{r.description}</div>
              <div className="text-sm">
                <span className="font-medium">Preço: </span>{r.suor_price} SUOR
              </div>
              <div className="text-sm">
                <span className="font-medium">Parceiro: </span>{r.partner_name}
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => onEdit(r)}>
                  <Pencil className="h-4 w-4 mr-1"/> Editar
                </Button>
                <Button size="sm" variant="destructive" onClick={() => onDelete(r.id)}>
                  <Trash2 className="h-4 w-4 mr-1"/> Remover
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Editar Recompensa' : 'Nova Recompensa'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Input placeholder="Nome" value={editing?.name || ''} onChange={(e) => setEditing({ ...editing!, name: e.target.value })} />
            <Input placeholder="Parceiro" value={editing?.partner_name || ''} onChange={(e) => setEditing({ ...editing!, partner_name: e.target.value })} />
            <Input placeholder="Preço em SUOR" type="number" value={editing?.suor_price ?? 0} onChange={(e) => setEditing({ ...editing!, suor_price: Number(e.target.value) })} />
            <Input placeholder="Estoque" type="number" value={editing?.stock_quantity ?? 0} onChange={(e) => setEditing({ ...editing!, stock_quantity: Number(e.target.value) })} />
            <Input placeholder="Máx. por usuário" type="number" value={editing?.max_per_user ?? 1} onChange={(e) => setEditing({ ...editing!, max_per_user: Number(e.target.value) })} />
            <Input placeholder="Ordem" type="number" value={editing?.order_index ?? 0} onChange={(e) => setEditing({ ...editing!, order_index: Number(e.target.value) })} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={upsert.isPending}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

