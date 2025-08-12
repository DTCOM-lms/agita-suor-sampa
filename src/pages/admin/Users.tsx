import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Shield, UserMinus, UserPlus } from "lucide-react";
import { useAdminUsers, useAdminToggleAdmin } from "@/hooks/useAdminUsers";

export default function Users() {
  const [search, setSearch] = React.useState("");
  const { data: users, isLoading, refetch } = useAdminUsers(search);
  const toggleAdmin = useAdminToggleAdmin();

  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Usuários</h2>
          <p className="text-muted-foreground">Gerencie todos os usuários do sistema</p>
        </div>
        <Button variant="outline" onClick={() => refetch()} disabled={isLoading}>Atualizar</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Usuários</CardTitle>
          <CardDescription>
            Todos os usuários registrados na plataforma
          </CardDescription>
          <div className="flex gap-4 mt-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Buscar usuários..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Nível</TableHead>
                <TableHead>Atividades</TableHead>
                <TableHead>SUOR Total</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(users || []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.full_name}</TableCell>
                  <TableCell>
                    {u.is_admin ? (
                      <Badge className="gap-1"><Shield className="h-3 w-3"/> Admin</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>{u.level}</TableCell>
                  <TableCell>{u.total_activities}</TableCell>
                  <TableCell className="font-medium">{u.total_suor}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant={u.is_admin ? 'destructive' : 'outline'}
                      onClick={() => toggleAdmin.mutate({ userId: u.id, isAdmin: !u.is_admin })}
                    >
                      {u.is_admin ? (<><UserMinus className="h-4 w-4 mr-1"/> Remover Admin</>) : (<><UserPlus className="h-4 w-4 mr-1"/> Tornar Admin</>)}
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