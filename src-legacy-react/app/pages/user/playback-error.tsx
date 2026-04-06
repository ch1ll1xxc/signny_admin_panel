import { VideoOff } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router';

export default function PlaybackError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <VideoOff className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl">Видео не загрузилось</h1>
        <p className="text-muted-foreground">
          Попробуйте перезагрузить страницу или обратитесь к сотруднику музея
        </p>
        <Button 
          size="lg" 
          className="w-full max-w-xs"
          onClick={() => navigate(-1)}
        >
          Повторить
        </Button>
      </div>
    </div>
  );
}
