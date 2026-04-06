import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import AdminLayout from '../../components/admin-layout';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
import { Switch } from '../../components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import {
  Upload,
  Download,
  Eye,
  Save,
  QrCode,
  Printer,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

export default function ExhibitEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewExhibit = !id;

  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showPreviewWarning, setShowPreviewWarning] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: id ? 'Древняя керамика эпохи неолита' : '',
    hall: id ? 'archaeology' : '',
    shortDescription: id ? 'Уникальная коллекция керамических изделий' : '',
    fullDescription: id
      ? 'Данная коллекция представляет собой уникальные образцы керамических изделий эпохи неолита.'
      : '',
    tags: id ? 'археология, неолит, керамика' : '',
    status: id ? 'Published' : 'Draft',
    videoStatus: id ? 'ready' : 'none',
    videoFile: null as File | null,
    uploadProgress: 0,
    subtitlesEmbedded: id ? false : false,
    subtitlesFile: null as File | null,
    subtitlesStatus: id ? 'uploaded' : 'none',
    qrId: id ? 'EXH-2024-001' : '',
  });

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('videoFile', file);
      handleChange('videoStatus', 'uploading');
      handleChange('uploadProgress', 0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setFormData((prev) => {
          const newProgress = prev.uploadProgress + 10;
          if (newProgress >= 100) {
            clearInterval(interval);
            return {
              ...prev,
              uploadProgress: 100,
              videoStatus: 'processing',
            };
          }
          return { ...prev, uploadProgress: newProgress };
        });
      }, 500);

      // Simulate processing
      setTimeout(() => {
        handleChange('videoStatus', 'ready');
        toast.success('Видео успешно загружено');
      }, 6000);
    }
  };

  const handleSubtitlesUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleChange('subtitlesFile', file);
      handleChange('subtitlesStatus', 'uploaded');
      toast.success('Субтитры загружены');
    }
  };

  const handleSave = () => {
    // Validation
    if (!formData.name || !formData.hall) {
      toast.error('Заполните обязательные поля');
      return;
    }

    if (formData.status === 'Published' && formData.videoStatus !== 'ready') {
      toast.error('Невозможно опубликовать без видео');
      return;
    }

    toast.success('Изменения сохранены');
    setHasUnsavedChanges(false);
  };

  const handlePreview = () => {
    if (hasUnsavedChanges) {
      setShowPreviewWarning(true);
    } else {
      navigate(`/admin/exhibits/${id || 'new'}/preview`);
    }
  };

  const handleGenerateQR = () => {
    const newId = `EXH-${new Date().getFullYear()}-${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, '0')}`;
    handleChange('qrId', newId);
    toast.success('QR-код сгенерирован');
  };

  const getVideoStatusBadge = () => {
    switch (formData.videoStatus) {
      case 'uploading':
        return <Badge variant="secondary">Загружается...</Badge>;
      case 'processing':
        return <Badge variant="secondary">Обработка...</Badge>;
      case 'ready':
        return <Badge className="bg-green-600">Готово</Badge>;
      case 'error':
        return <Badge variant="destructive">Ошибка</Badge>;
      default:
        return <Badge variant="outline">Не загружено</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl">
              {isNewExhibit ? 'Создать экспонат' : 'Редактировать экспонат'}
            </h1>
            <p className="text-muted-foreground mt-1">
              {isNewExhibit
                ? 'Добавьте новый экспонат в систему'
                : 'Обновите информацию об экспонате'}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="lg" onClick={handlePreview}>
              <Eye className="mr-2 w-5 h-5" />
              Просмотреть
            </Button>
            <Button size="lg" onClick={handleSave}>
              <Save className="mr-2 w-5 h-5" />
              Сохранить
            </Button>
          </div>
        </div>

        {/* Warning banner */}
        {formData.status === 'Published' && formData.videoStatus !== 'ready' && (
          <div className="flex items-center gap-2 p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <p className="text-sm text-destructive">
              Невозможно опубликовать экспонат без видео
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic info */}
            <Card>
              <CardHeader>
                <CardTitle>Основная информация</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    Название <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="Введите название экспоната"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="hall">
                    Зал <span className="text-destructive">*</span>
                  </Label>
                  <Select value={formData.hall} onValueChange={(v) => handleChange('hall', v)}>
                    <SelectTrigger id="hall">
                      <SelectValue placeholder="Выберите зал" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="archaeology">Археология</SelectItem>
                      <SelectItem value="history">История</SelectItem>
                      <SelectItem value="numismatics">Нумизматика</SelectItem>
                      <SelectItem value="art">Искусство</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shortDescription">Краткое описание</Label>
                  <Input
                    id="shortDescription"
                    placeholder="1-2 строки"
                    value={formData.shortDescription}
                    onChange={(e) => handleChange('shortDescription', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fullDescription">Полное описание</Label>
                  <Textarea
                    id="fullDescription"
                    placeholder="Детальное описание экспоната"
                    rows={5}
                    value={formData.fullDescription}
                    onChange={(e) => handleChange('fullDescription', e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Теги</Label>
                  <Input
                    id="tags"
                    placeholder="археология, неолит, керамика"
                    value={formData.tags}
                    onChange={(e) => handleChange('tags', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Video */}
            <Card>
              <CardHeader>
                <CardTitle>Видео РЖЯ</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Статус видео</Label>
                    <div>{getVideoStatusBadge()}</div>
                  </div>
                </div>

                {formData.videoStatus === 'uploading' && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Загрузка...</span>
                      <span className="font-medium">{formData.uploadProgress}%</span>
                    </div>
                    <Progress value={formData.uploadProgress} />
                  </div>
                )}

                {formData.videoStatus === 'processing' && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Обработка видео...
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" asChild>
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="mr-2 w-4 h-4" />
                      {formData.videoStatus === 'ready' ? 'Заменить видео' : 'Загрузить видео'}
                      <input
                        id="video-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoUpload}
                      />
                    </label>
                  </Button>

                  {formData.videoStatus === 'ready' && (
                    <>
                      <Button variant="outline">
                        <Eye className="mr-2 w-4 h-4" />
                        Просмотреть видео
                      </Button>
                      <Button variant="outline">
                        <Download className="mr-2 w-4 h-4" />
                        Скачать видео
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Subtitles */}
            <Card>
              <CardHeader>
                <CardTitle>Субтитры</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="subtitlesEmbedded">Субтитры встроены в видео</Label>
                  <Switch
                    id="subtitlesEmbedded"
                    checked={formData.subtitlesEmbedded}
                    onCheckedChange={(checked) => handleChange('subtitlesEmbedded', checked)}
                  />
                </div>

                {!formData.subtitlesEmbedded && (
                  <>
                    <div className="space-y-2">
                      <Label>Файл субтитров (.vtt, .srt)</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant={formData.subtitlesStatus === 'uploaded' ? 'default' : 'outline'}>
                          {formData.subtitlesStatus === 'uploaded' ? 'Загружено' : 'Не загружено'}
                        </Badge>
                        {formData.subtitlesFile && (
                          <span className="text-sm text-muted-foreground">
                            {formData.subtitlesFile.name}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" asChild>
                        <label htmlFor="subtitles-upload" className="cursor-pointer">
                          <Upload className="mr-2 w-4 h-4" />
                          {formData.subtitlesStatus === 'uploaded'
                            ? 'Заменить файл'
                            : 'Загрузить файл'}
                          <input
                            id="subtitles-upload"
                            type="file"
                            accept=".vtt,.srt"
                            className="hidden"
                            onChange={handleSubtitlesUpload}
                          />
                        </label>
                      </Button>

                      {formData.subtitlesStatus === 'uploaded' && (
                        <Button variant="outline">
                          <Download className="mr-2 w-4 h-4" />
                          Скачать субтитры
                        </Button>
                      )}
                    </div>
                  </>
                )}

                <p className="text-sm text-muted-foreground">
                  Субтитры опциональны. По умолчанию всегда выключены при старте видео.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>Статус экспоната</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  value={formData.status}
                  onValueChange={(v) => handleChange('status', v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Published">Published</SelectItem>
                  </SelectContent>
                </Select>

                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    {formData.status === 'Published' ? (
                      <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-muted-foreground mt-0.5" />
                    )}
                    <div>
                      <div className="font-medium">
                        {formData.status === 'Published' ? 'Опубликовано' : 'Черновик'}
                      </div>
                      <div className="text-muted-foreground">
                        {formData.status === 'Published'
                          ? 'Видимо для посетителей'
                          : 'Не видимо для посетителей'}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR/NFC */}
            <Card>
              <CardHeader>
                <CardTitle>QR / NFC</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="qrId">ID экспоната</Label>
                  <Input
                    id="qrId"
                    placeholder="EXH-2024-001"
                    value={formData.qrId}
                    onChange={(e) => handleChange('qrId', e.target.value)}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <Button variant="outline" onClick={handleGenerateQR}>
                    <QrCode className="mr-2 w-4 h-4" />
                    Сгенерировать QR
                  </Button>
                  <Button variant="outline" disabled={!formData.qrId}>
                    <Printer className="mr-2 w-4 h-4" />
                    Экспорт для печати
                  </Button>
                </div>

                {formData.qrId && (
                  <div className="p-4 bg-muted rounded-lg flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-muted-foreground" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Preview warning dialog */}
      <Dialog open={showPreviewWarning} onOpenChange={setShowPreviewWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Несохранённые изменения</DialogTitle>
            <DialogDescription>
              Есть несохранённые изменения. Просмотр покажет последнюю сохранённую версию.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewWarning(false)}>
              Отмена
            </Button>
            <Button onClick={() => navigate(`/admin/exhibits/${id || 'new'}/preview`)}>
              Открыть просмотр
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
