import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAdminActivities, useAdminUpdateActivityStatus, useAdminDeleteActivity, type AdminActivityStatus } from '@/hooks/useAdminActivities';
import { Search, Trash2, CheckCircle2, XCircle, PauseCircle, RefreshCw } from 'lucide-react';

export default function ActivitiesAdmin() {
  const [search, setSearch] = React.useState('');
  const [status, setStatus] = React.useState<AdminActivityStatus | undefined>(undefined);
  const { data: activities, isLoading, refetch } = useAdminActivities({ search, status });
  const updateStatus = useAdminUpdateActivityStatus();
  const del = useAdminDeleteActivity();

  const onChangeStatus = async (id: string, s: AdminActivityStatus) => {
    await updateStatus.mutateAsync({ activityId: id, status: s });
  };

  const onDelete = async (id: string) => {
    if (!confirm('Remover atividade?')) return;
    await del.mutateAsync(id);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Atividades</h1>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2"/> Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtro</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Buscar por título" className="pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button variant={status === undefined ? 'default' : 'outline'} onClick={() => setStatus(undefined)}>Todos</Button>
            <Button variant={status === 'active' ? 'default' : 'outline'} onClick={() => setStatus('active')}>Ativas</Button>
            <Button variant={status === 'completed' ? 'default' : 'outline'} onClick={() => setStatus('completed')}>Concluídas</Button>
            <Button variant={status === 'paused' ? 'default' : 'outline'} onClick={() => setStatus('paused')}>Pausadas</Button>
            <Button variant={status === 'cancelled' ? 'default' : 'outline'} onClick={() => setStatus('cancelled')}>Canceladas</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Atividades</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duração (min)</TableHead>
                <TableHead>Distância (km)</TableHead>
                <TableHead>SUOR</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(activities || []).map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-medium">{a.profiles?.full_name || a.user_id.slice(0,8)}</TableCell>
                  <TableCell>{a.title || '-'}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{a.status}</Badge>
                  </TableCell>
                  <TableCell>{a.duration_minutes ?? '-'}</TableCell>
                  <TableCell>{a.distance_km ?? '-'}</TableCell>
                  <TableCell className="font-medium">{a.suor_earned}</TableCell>
                  <TableCell>{a.activity_types?.name || '-'}</TableCell>
                  <TableCell className="flex gap-2 justify-end">
                    <Button size="sm" variant="outline" onClick={() => onChangeStatus(a.id, 'completed')}>
                      <CheckCircle2 className="h-4 w-4 mr-1"/> Concluir
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onChangeStatus(a.id, 'paused')}>
                      <PauseCircle className="h-4 w-4 mr-1"/> Pausar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => onChangeStatus(a.id, 'cancelled')}>
                      <XCircle className="h-4 w-4 mr-1"/> Cancelar
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => onDelete(a.id)}>
                      <Trash2 className="h-4 w-4 mr-1"/> Remover
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

