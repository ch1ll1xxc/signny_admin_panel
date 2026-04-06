import { useState } from 'react';
import { Link } from 'react-router';
import AdminLayout from '../../components/admin-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';
import { Badge } from '../../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Plus, Search, Edit, CheckCircle, XCircle } from 'lucide-react';
import { useSession } from '../../shared/auth/session';
import { hasPermission } from '../../shared/auth/permissions';

export default function ExhibitsList() {
  const { user } = useSession();
  const canEditExhibits = user ? hasPermission(user.role, 'exhibits.write') : false;

  const [searchQuery, setSearchQuery] = useState('');
  const [hallFilter, setHallFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const exhibits = [
    {
      id: 1,
      name: 'Древняя керамика эпохи неолита',
      hall: 'Археология',
      status: 'Published',
      hasVideo: true,
      hasSubtitles: true,
      subtitlesType: 'file',
      updated: '2026-02-20',
    },
    {
      id: 2,
      name: 'Средневековые рукописи',
      hall: 'История',
      status: 'Published',
      hasVideo: true,
      hasSubtitles: true,
      subtitlesType: 'embedded',
      updated: '2026-02-18',
    },
    {
      id: 3,
      name: 'Коллекция монет XVII века',
      hall: 'Нумизматика',
      status: 'Draft',
      hasVideo: true,
      hasSubtitles: false,
      subtitlesType: null,
      updated: '2026-02-15',
    },
    {
      id: 4,
      name: 'Археологические находки',
      hall: 'Археология',
      status: 'Draft',
      hasVideo: false,
      hasSubtitles: false,
      subtitlesType: null,
      updated: '2026-02-10',
    },
  ];

  const filteredExhibits = exhibits.filter((exhibit) => {
    const matchesSearch = exhibit.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesHall = hallFilter === 'all' || exhibit.hall === hallFilter;
    const matchesStatus = statusFilter === 'all' || exhibit.status === statusFilter;
    return matchesSearch && matchesHall && matchesStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl">Экспонаты</h1>
            <p className="text-muted-foreground mt-1">Управление экспонатами музея</p>
          </div>
          {canEditExhibits && (
            <Link to="/admin/exhibits/new">
              <Button size="lg">
                <Plus className="mr-2 w-5 h-5" />
                Создать экспонат
              </Button>
            </Link>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Поиск экспонатов..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={hallFilter} onValueChange={setHallFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Зал" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все залы</SelectItem>
              <SelectItem value="Археология">Археология</SelectItem>
              <SelectItem value="История">История</SelectItem>
              <SelectItem value="Нумизматика">Нумизматика</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Статус" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все статусы</SelectItem>
              <SelectItem value="Published">Published</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Зал</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Видео</TableHead>
                  <TableHead>Субтитры</TableHead>
                  <TableHead>Обновлено</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExhibits.map((exhibit) => (
                  <TableRow key={exhibit.id}>
                    <TableCell className="font-medium">{exhibit.name}</TableCell>
                    <TableCell>{exhibit.hall}</TableCell>
                    <TableCell>
                      <Badge
                        variant={exhibit.status === 'Published' ? 'default' : 'secondary'}
                      >
                        {exhibit.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {exhibit.hasVideo ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <XCircle className="w-4 h-4 text-muted-foreground" />
                      )}
                    </TableCell>
                    <TableCell>
                      {exhibit.hasSubtitles ? (
                        <span className="text-sm">
                          {exhibit.subtitlesType === 'embedded' ? 'Встроены' : 'Файл'}
                        </span>
                      ) : (
                        <span className="text-sm text-muted-foreground">Нет</span>
                      )}
                    </TableCell>
                    <TableCell>{exhibit.updated}</TableCell>
                    <TableCell className="text-right">
                      {canEditExhibits && (
                        <Link to={`/admin/exhibits/${exhibit.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
