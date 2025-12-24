import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Download, FileText, ExternalLink } from 'lucide-react';

interface PdfCatalog {
  id: string;
  title: string;
  description: string | null;
  file_url: string;
  display_order: number;
}

export default function Catalogos() {
  const { user, loading, isSetupComplete } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [catalogs, setCatalogs] = useState<PdfCatalog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewingPdf, setViewingPdf] = useState<string | null>(null);

  // Redirect if not logged in or setup not complete
  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/auth');
      } else if (!isSetupComplete) {
        navigate('/setup');
      }
    }
  }, [user, loading, isSetupComplete, navigate]);

  // Fetch catalogs
  useEffect(() => {
    const fetchCatalogs = async () => {
      try {
        const { data, error } = await supabase
          .from('pdf_catalogs')
          .select('*')
          .eq('enabled', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setCatalogs(data as PdfCatalog[]);
      } catch (error: any) {
        toast({
          title: 'Error',
          description: 'No se pudieron cargar los catálogos.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (user && isSetupComplete) {
      fetchCatalogs();
    }
  }, [user, isSetupComplete, toast]);

  const handleDownload = (catalog: PdfCatalog) => {
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = catalog.file_url;
    link.download = `${catalog.title}.pdf`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: 'Descargando',
      description: `Descargando ${catalog.title}...`,
    });
  };

  const handleView = (catalog: PdfCatalog) => {
    setViewingPdf(viewingPdf === catalog.id ? null : catalog.id);
  };

  if (loading || isLoading) {
    return (
      <AppLayout>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6" /> Catálogos PDF
            </h1>
            <p className="text-muted-foreground">
              Descargá los catálogos de productos disponibles
            </p>
          </div>

          {catalogs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No hay catálogos disponibles.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {catalogs.map((catalog) => (
                <Card key={catalog.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <FileText className="h-5 w-5 text-accent" />
                      {catalog.title}
                    </CardTitle>
                    {catalog.description && (
                      <CardDescription>{catalog.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent className="flex-1 flex flex-col justify-end">
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(catalog)}
                        className="flex-1"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {viewingPdf === catalog.id ? 'Cerrar' : 'Ver'}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(catalog)}
                        className="flex-1"
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Descargar
                      </Button>
                    </div>
                    
                    {/* Embedded PDF viewer */}
                    {viewingPdf === catalog.id && (
                      <div className="mt-4 border rounded overflow-hidden">
                        <iframe
                          src={catalog.file_url}
                          className="w-full h-[400px]"
                          title={catalog.title}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
