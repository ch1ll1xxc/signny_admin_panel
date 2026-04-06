import { useState } from 'react';
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
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Search, Download, Eye, Video, FileText, Upload } from 'lucide-react';
import { useSession } from '../../shared/auth/session';
import { hasPermission } from '../../shared/auth/permissions';

export default function MediaLibrary() {
  const { user } = useSession();
  const canUploadMedia = user ? hasPermission(user.role, 'media.write') : false;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMedia, setSelectedMedia] = useState<any>(null);

  const mediaFiles = [
    {
      id: 1,
      name: 'ancient-pottery-rsl.mp4',
      type: 'video',
      status: 'ready',
      usedIn: ['Древняя керамика эпохи неолита'],
      uploadDate: '2026-02-20',
      size: '125 MB',
    },
    {
      id: 2,
      name: 'ancient-pottery-subtitles.vtt',
      type: 'subtitles',
      status: 'ready',
      usedIn: ['Древняя керамика эпохи неолита'],
      uploadDate: '2026-02-20',
      size: '12 KB',
    },
    {
      id: 3,
      name: 'medieval-manuscripts-rsl.mp4',
      type: 'video',
      status: 'processing',
      usedIn: ['Средневековые рукописи'],
      uploadDate: '2026-02-18',
      size: '98 MB',
    },
    {
      id: 4,
      name: 'coins-collection-rsl.mp4',
      type: 'video',
      status: 'ready',
      usedIn: ['Коллекция монет XVII века'],
      uploadDate: '2026-02-15',
      size: '87 MB',
    },
  ];

  const filteredMedia = mediaFiles.filter((media) =>
    media.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl">Медиа-библиотека</h1>
            <p className="text-muted-foreground mt-1">
              Управление видео и субтитрами
            </p>
          </div>
          {canUploadMedia && (
            <Button size="lg">
              <Upload className="mr-2 w-5 h-5" />
              Загрузить файл
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Media list */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Поиск файлов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Имя файла</TableHead>
                      <TableHead>Тип</TableHead>
                      <TableHead>Статус</TableHead>
                      <TableHead>Размер</TableHead>
                      <TableHead>Дата</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMedia.map((media) => (
                      <TableRow
                        key={media.id}
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedMedia(media)}
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {media.type === 'video' ? (
                              <Video className="w-4 h-4 text-muted-foreground" />
                            ) : (
                              <FileText className="w-4 h-4 text-muted-foreground" />
                            )}
                            {media.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {media.type === 'video' ? 'Видео' : 'Субтитры'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={media.status === 'ready' ? 'default' : 'secondary'}
                          >
                            {media.status === 'ready' ? 'Готово' : 'Обработка'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {media.size}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {media.uploadDate}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Details panel */}
          <div>
            {selectedMedia ? (
              <Card>
                <CardHeader>
                  <CardTitle>Детали файла</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Имя файла</div>
                    <div className="font-medium">{selectedMedia.name}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Тип</div>
                    <Badge variant="outline">
                      {selectedMedia.type === 'video' ? 'Видео' : 'Субтитры'}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Статус</div>
                    <Badge
                      variant={selectedMedia.status === 'ready' ? 'default' : 'secondary'}
                    >
                      {selectedMedia.status === 'ready' ? 'Готово' : 'Обработка'}
                    </Badge>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">Размер</div>
                    <div>{selectedMedia.size}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Дата загрузки
                    </div>
                    <div>{selectedMedia.uploadDate}</div>
                  </div>

                  <div>
                    <div className="text-sm text-muted-foreground mb-1">
                      Используется в
                    </div>
                    <div className="space-y-1">
                      {selectedMedia.usedIn.map((exhibit: string, index: number) => (
                        <div key={index} className="text-sm">
                          {exhibit}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-4">
                    {selectedMedia.type === 'video' && (
                      <Button variant="outline">
                        <Eye className="mr-2 w-4 h-4" />
                        Просмотреть
                      </Button>
                    )}
                    <Button variant="outline">
                      <Download className="mr-2 w-4 h-4" />
                      Скачать
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center text-muted-foreground">
                  Выберите файл для просмотра деталей
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
