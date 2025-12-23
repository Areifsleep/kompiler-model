import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router';

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Kompiler Model</h1>
          <p className="text-lg text-muted-foreground">
            Aplikasi untuk parsing, visualisasi, dan translasi model JSON
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/parsing')}>
            <CardHeader>
              <CardTitle>1. Parsing</CardTitle>
              <CardDescription>Input dan validasi JSON model</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Masukkan model JSON Anda dan validasi strukturnya
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/visualization')}>
            <CardHeader>
              <CardTitle>2. Visualisasi</CardTitle>
              <CardDescription>Diagram class dan relasi</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Lihat visualisasi class dan relationship dalam bentuk diagram
              </p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate('/translation')}>
            <CardHeader>
              <CardTitle>3. Translasi</CardTitle>
              <CardDescription>Generate kode program</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Translasi model ke berbagai bahasa pemrograman
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Workflow</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Input JSON model dan validasi struktur</li>
              <li>Visualisasi class diagram dan relationship</li>
              <li>Pilih bahasa target untuk translasi kode</li>
              <li>Download hasil translasi</li>
            </ol>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <Button size="lg" onClick={() => navigate('/parsing')}>
            Mulai Parsing
          </Button>
        </div>
      </div>
    </div>
  );
}
