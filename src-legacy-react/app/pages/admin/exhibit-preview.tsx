import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ArrowLeft, Monitor, Tablet, Smartphone } from 'lucide-react';
import ExhibitPage from '../user/exhibit-page';

type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export default function ExhibitPreview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [breakpoint, setBreakpoint] = useState<Breakpoint>('desktop');

  const breakpointSizes = {
    mobile: { width: '360px', label: 'Mobile 360px' },
    tablet: { width: '768px', label: 'Tablet 768px' },
    desktop: { width: '100%', label: 'Desktop 1440px' },
  };

  return (
    <div className="min-h-screen bg-muted">
      {/* Preview toolbar */}
      <div className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/admin/exhibits/${id}`)}
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              Назад к редактированию
            </Button>
            <Badge variant="secondary">Preview</Badge>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={breakpoint === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBreakpoint('mobile')}
            >
              <Smartphone className="mr-2 w-4 h-4" />
              Mobile
            </Button>
            <Button
              variant={breakpoint === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBreakpoint('tablet')}
            >
              <Tablet className="mr-2 w-4 h-4" />
              Tablet
            </Button>
            <Button
              variant={breakpoint === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setBreakpoint('desktop')}
            >
              <Monitor className="mr-2 w-4 h-4" />
              Desktop
            </Button>
          </div>
        </div>
      </div>

      {/* Preview frame */}
      <div className="flex items-start justify-center p-8">
        <div
          className="bg-background shadow-2xl transition-all duration-300 overflow-hidden"
          style={{
            width: breakpointSizes[breakpoint].width,
            maxWidth: '100%',
            minHeight: '600px',
            borderRadius: breakpoint === 'mobile' ? '2rem' : '0.5rem',
          }}
        >
          <div className="relative">
            {/* Preview content */}
            <ExhibitPage />

            {/* Overlay indicator */}
            <div className="absolute top-4 right-4 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
              {breakpointSizes[breakpoint].label}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
