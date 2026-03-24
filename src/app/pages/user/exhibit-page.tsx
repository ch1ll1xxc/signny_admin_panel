import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { ChevronDown, AlertCircle, Moon, Sun } from 'lucide-react';
import { Button } from '../../components/ui/button';
import VideoPlayer from '../../components/video-player';
import { useTheme } from '../../components/theme-provider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '../../components/ui/collapsible';

export default function ExhibitPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [isDescriptionOpen, setIsDescriptionOpen] = useState(false);

  // Mock data
  const exhibit = {
    id: id || 'demo',
    title: 'Древняя керамика эпохи неолита',
    hall: 'Зал археологии',
    shortDescription: 'Уникальная коллекция керамических изделий',
    fullDescription:
      'Данная коллекция представляет собой уникальные образцы керамических изделий эпохи неолита, найденные в ходе археологических раскопок на территории региона. Изделия датируются периодом 5000-3000 лет до н.э. и демонстрируют высокий уровень мастерства древних ремесленников. Орнаменты на керамике отражают культурные традиции и верования народов того времени.',
    videoUrl: '/demo-video.mp4',
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-card border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="text-sm text-muted-foreground">Музей</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {/* Mobile: 360px, Tablet: 768px, Desktop: 1440px - Responsive layout */}
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Exhibit info */}
          <div className="space-y-2">
            <div className="text-sm text-primary">{exhibit.hall}</div>
            <h1 className="text-3xl md:text-4xl">{exhibit.title}</h1>
          </div>

          {/* Video section */}
          <div className="space-y-4">
            <div className="relative aspect-video bg-muted rounded-lg overflow-hidden">
              <VideoPlayer
                videoUrl={exhibit.videoUrl}
                onError={() => navigate('/error/playback')}
                className="w-full h-full"
              />
            </div>

            <Button size="lg" className="w-full sm:w-auto">
              Смотреть на РЖЯ
            </Button>
          </div>

          {/* Description */}
          <div className="bg-card border border-border rounded-lg p-6">
            <Collapsible open={isDescriptionOpen} onOpenChange={setIsDescriptionOpen}>
              <div className="space-y-4">
                <p className="text-muted-foreground">{exhibit.shortDescription}</p>
                <CollapsibleContent className="space-y-4">
                  <p className="text-muted-foreground">{exhibit.fullDescription}</p>
                </CollapsibleContent>
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" className="w-full">
                    {isDescriptionOpen ? 'Скрыть' : 'Подробнее'}
                    <ChevronDown
                      className={`ml-2 w-4 h-4 transition-transform ${
                        isDescriptionOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                </CollapsibleTrigger>
              </div>
            </Collapsible>
          </div>

          {/* Report issue */}
          <Button variant="outline" className="w-full sm:w-auto">
            <AlertCircle className="mr-2 w-4 h-4" />
            Сообщить о проблеме
          </Button>
        </div>
      </main>
    </div>
  );
}
