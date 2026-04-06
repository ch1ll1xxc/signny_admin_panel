import { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Play, Package, AlertCircle, TrendingUp, Plus } from 'lucide-react';
import { Link } from 'react-router';
import { useSession } from '../../shared/auth/session';
import { hasPermission } from '../../shared/auth/permissions';
import {
  getPublicContourState,
  PublicContourState,
} from '../../shared/integration/public-contour';
import {
  demoPublicSyncPayload,
  pushPublicSync,
} from '../../shared/integration/push-public-sync';

export default function AdminDashboard() {
  const { user } = useSession();
  const canEditExhibits = user ? hasPermission(user.role, 'exhibits.write') : false;
  const [publicState, setPublicState] = useState<PublicContourState | null>(null);
  const [publicStateError, setPublicStateError] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  const loadPublicState = async () => {
    try {
      const data = await getPublicContourState();
      setPublicState(data);
      setPublicStateError(null);
    } catch (error: unknown) {
      setPublicState(null);
      setPublicStateError(
        error instanceof Error ? error.message : 'Failed to load public contour state'
      );
    }
  };

  useEffect(() => {
    loadPublicState();
  }, []);

  const handleSyncPublicContour = async () => {
    setIsSyncing(true);
    setSyncMessage(null);

    try {
      await pushPublicSync(demoPublicSyncPayload);
      setSyncMessage('Синхронизация с публичным контуром выполнена');
      await loadPublicState();
    } catch (error: unknown) {
      setSyncMessage(
        error instanceof Error ? error.message : 'Не удалось синхронизировать контуры'
      );
    } finally {
      setIsSyncing(false);
    }
  };

  const stats = [
    {
      title: 'Запуски видео',
      value: '1,247',
      icon: Play,
      trend: '+12% за неделю',
    },
    {
      title: 'Экспонаты',
      value: '48',
      icon: Package,
      trend: '32 опубликовано',
    },
    {
      title: 'Просмотры сегодня',
      value: '156',
      icon: TrendingUp,
      trend: '+8% к вчера',
    },
    {
      title: 'Жалобы',
      value: '3',
      icon: AlertCircle,
      trend: 'Требуют внимания',
    },
  ];

  const topExhibits = [
    { name: 'Древняя керамика эпохи неолита', views: 324, hall: 'Археология' },
    { name: 'Средневековые рукописи', views: 287, hall: 'История' },
    { name: 'Коллекция монет XVII века', views: 241, hall: 'Нумизматика' },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Общая статистика системы</p>
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

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className="w-4 h-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.trend}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Top exhibits */}
        <Card>
          <CardHeader>
            <CardTitle>Топ экспонаты</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topExhibits.map((exhibit, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-muted rounded-lg"
                >
                  <div className="space-y-1">
                    <div className="font-medium">{exhibit.name}</div>
                    <div className="text-sm text-muted-foreground">{exhibit.hall}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{exhibit.views}</div>
                    <div className="text-sm text-muted-foreground">просмотров</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick actions */}
        <Card>
          <CardHeader>
            <CardTitle>Быстрые действия</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {canEditExhibits && (
                <Link to="/admin/exhibits/new">
                  <Button variant="outline" className="w-full">
                    <Plus className="mr-2 w-4 h-4" />
                    Создать экспонат
                  </Button>
                </Link>
              )}
              <Link to="/admin/exhibits">
                <Button variant="outline" className="w-full">
                  <Package className="mr-2 w-4 h-4" />
                  Экспонаты
                </Button>
              </Link>
              <Link to="/admin/media">
                <Button variant="outline" className="w-full">
                  <Play className="mr-2 w-4 h-4" />
                  Медиа
                </Button>
              </Link>
              <Link to="/admin/halls">
                <Button variant="outline" className="w-full">
                  <TrendingUp className="mr-2 w-4 h-4" />
                  Залы
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Связь с публичным контуром</CardTitle>
          </CardHeader>
          <CardContent>
            {canEditExhibits && (
              <div className="mb-4">
                <Button
                  variant="outline"
                  onClick={handleSyncPublicContour}
                  disabled={isSyncing}
                >
                  {isSyncing ? 'Синхронизация...' : 'Синхронизировать публикацию'}
                </Button>
              </div>
            )}

            {syncMessage && (
              <p className="text-sm mb-3 text-muted-foreground">{syncMessage}</p>
            )}

            {publicStateError ? (
              <p className="text-sm text-destructive">{publicStateError}</p>
            ) : publicState ? (
              <div className="space-y-2 text-sm">
                <div>
                  Публичных экспонатов: <span className="font-medium">{publicState.exhibits.publishedCount}</span>
                </div>
                <div>
                  Опубликованных FAQ: <span className="font-medium">{publicState.faq.publishedCount}</span>
                </div>
                <div>
                  Версий контента: <span className="font-medium">{publicState.contentVersions.totalCount}</span>
                </div>
                <div className="text-muted-foreground">
                  Последняя синхронизация: {new Date(publicState.generatedAt).toLocaleString()}
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Загрузка состояния...</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
