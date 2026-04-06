import { useState } from 'react';
import AdminLayout from '../../components/admin-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '../../shared/auth/session';
import { hasPermission } from '../../shared/auth/permissions';

export default function HallsManagement() {
  const { user } = useSession();
  const canManageHalls = user ? hasPermission(user.role, 'halls.write') : false;

  const [halls, setHalls] = useState([
    { id: 1, name: 'Археология', code: 'archaeology', exhibitsCount: 12 },
    { id: 2, name: 'История', code: 'history', exhibitsCount: 8 },
    { id: 3, name: 'Нумизматика', code: 'numismatics', exhibitsCount: 6 },
    { id: 4, name: 'Искусство', code: 'art', exhibitsCount: 15 },
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHall, setEditingHall] = useState<any>(null);
  const [formData, setFormData] = useState({ name: '', code: '' });

  const handleOpenDialog = (hall?: any) => {
    if (hall) {
      setEditingHall(hall);
      setFormData({ name: hall.name, code: hall.code });
    } else {
      setEditingHall(null);
      setFormData({ name: '', code: '' });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingHall(null);
    setFormData({ name: '', code: '' });
  };

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      toast.error('Заполните все поля');
      return;
    }

    if (editingHall) {
      setHalls(
        halls.map((h) =>
          h.id === editingHall.id
            ? { ...h, name: formData.name, code: formData.code }
            : h
        )
      );
      toast.success('Зал обновлен');
    } else {
      const newHall = {
        id: Math.max(...halls.map((h) => h.id)) + 1,
        name: formData.name,
        code: formData.code,
        exhibitsCount: 0,
      };
      setHalls([...halls, newHall]);
      toast.success('Зал создан');
    }

    handleCloseDialog();
  };

  const handleDelete = (id: number) => {
    setHalls(halls.filter((h) => h.id !== id));
    toast.success('Зал удален');
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl">Залы музея</h1>
            <p className="text-muted-foreground mt-1">
              Управление залами и секциями
            </p>
          </div>
          {canManageHalls && (
            <Button size="lg" onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 w-5 h-5" />
              Создать зал
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Код</TableHead>
                  <TableHead>Количество экспонатов</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {halls.map((hall) => (
                  <TableRow key={hall.id}>
                    <TableCell className="font-medium">{hall.name}</TableCell>
                    <TableCell>
                      <code className="px-2 py-1 bg-muted rounded text-sm">
                        {hall.code}
                      </code>
                    </TableCell>
                    <TableCell>{hall.exhibitsCount}</TableCell>
                    <TableCell className="text-right">
                      {canManageHalls && (
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenDialog(hall)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(hall.id)}
                            disabled={hall.exhibitsCount > 0}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Create/Edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingHall ? 'Редактировать зал' : 'Создать зал'}
            </DialogTitle>
            <DialogDescription>
              {editingHall
                ? 'Обновите информацию о зале'
                : 'Добавьте новый зал в систему'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="hall-name">Название</Label>
              <Input
                id="hall-name"
                placeholder="Археология"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hall-code">Код</Label>
              <Input
                id="hall-code"
                placeholder="archaeology"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Отмена
            </Button>
            <Button onClick={handleSave}>
              {editingHall ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
