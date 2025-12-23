import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router';
import { AlertCircle } from 'lucide-react';

export default function Visualization() {
  const navigate = useNavigate();
  const [modelData, setModelData] = useState(null);

  useEffect(() => {
    // Load parsed data dari localStorage
    const stored = localStorage.getItem('parsedModel');
    if (stored) {
      try {
        setModelData(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading model data:', error);
      }
    }
  }, []);

  const handleContinue = () => {
    navigate('/translation');
  };

  if (!modelData) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Tidak ada data model</div>
              <p className="text-sm mb-4">Silakan parse JSON model terlebih dahulu.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/parsing')}>
                Kembali ke Parsing
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">Model Visualization</h1>
          <p className="text-muted-foreground">
            Visualisasi class diagram dan relationship model
          </p>
        </div>

        <Tabs defaultValue="classes" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="classes">Classes</TabsTrigger>
            <TabsTrigger value="relationships">Relationships</TabsTrigger>
            <TabsTrigger value="diagram">Diagram</TabsTrigger>
          </TabsList>

          <TabsContent value="classes" className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {modelData.classes?.map((cls, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-xl">{cls.name}</CardTitle>
                    <CardDescription>Class Definition</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {cls.attributes && cls.attributes.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Attributes:</h4>
                        <ul className="space-y-1">
                          {cls.attributes.map((attr, i) => (
                            <li key={i} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {attr.name}: {attr.type}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    {cls.methods && cls.methods.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-sm">Methods:</h4>
                        <ul className="space-y-1">
                          {cls.methods.map((method, i) => (
                            <li key={i} className="text-sm font-mono bg-muted px-2 py-1 rounded">
                              {method.name}(): {method.returnType}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="relationships" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Relationships</CardTitle>
                <CardDescription>
                  Relasi antar class dalam model
                </CardDescription>
              </CardHeader>
              <CardContent>
                {modelData.relationships && modelData.relationships.length > 0 ? (
                  <div className="space-y-2">
                    {modelData.relationships.map((rel, index) => (
                      <div 
                        key={index} 
                        className="flex items-center gap-4 p-3 border rounded-lg"
                      >
                        <span className="font-semibold">{rel.from}</span>
                        <span className="text-muted-foreground">—</span>
                        <span className="px-3 py-1 bg-primary/10 text-primary rounded text-sm font-medium">
                          {rel.type}
                        </span>
                        <span className="text-muted-foreground">→</span>
                        <span className="font-semibold">{rel.to}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Tidak ada relationship yang didefinisikan.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="diagram" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Class Diagram</CardTitle>
                <CardDescription>
                  Visualisasi diagram (Coming Soon)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted rounded-lg h-96 flex items-center justify-center">
                  <p className="text-muted-foreground">
                    Diagram visualization akan ditambahkan di sini
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => navigate('/parsing')}>
            ← Kembali ke Parsing
          </Button>
          <Button onClick={handleContinue}>
            Lanjut ke Translasi →
          </Button>
        </div>
      </div>
    </div>
  );
}
