import { AlertCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useNavigate } from 'react-router';

export default function NotFoundError() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="flex flex-col items-center gap-6 max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
          <AlertCircle className="w-10 h-10 text-destructive" />
        </div>
        <h1 className="text-2xl">Экспонат не найден</h1>
        <p className="text-muted-foreground">
          Проверьте правильность QR-кода или обратитесь к сотруднику музея
        </p>
        <Button 
          size="lg" 
          className="w-full max-w-xs"
          onClick={() => navigate('/exhibit/demo')}
        >
          Повторить
        </Button>
      </div>
    </div>
  );
}
