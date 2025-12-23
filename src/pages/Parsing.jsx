import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router";
import { AlertCircle, CheckCircle2 } from "lucide-react";

export default function Parsing() {
  const navigate = useNavigate();
  const [jsonInput, setJsonInput] = useState("");
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleParse = () => {
    setIsParsing(true);
    setErrors([]);
    setIsValid(false);

    try {
      // Validasi JSON
      const parsed = JSON.parse(jsonInput);

      // Validasi struktur dasar (contoh validasi)
      const validationErrors = [];

      if (!parsed.classes || !Array.isArray(parsed.classes)) {
        validationErrors.push('Property "classes" harus berupa array');
      }

      if (!parsed.relationships || !Array.isArray(parsed.relationships)) {
        validationErrors.push('Property "relationships" harus berupa array');
      }

      if (validationErrors.length > 0) {
        setErrors(validationErrors);
        setIsValid(false);
      } else {
        setIsValid(true);
        // Simpan parsed data ke localStorage atau state management
        localStorage.setItem("parsedModel", JSON.stringify(parsed));
      }
    } catch (error) {
      setErrors([`JSON tidak valid: ${error.message}`]);
      setIsValid(false);
    } finally {
      setIsParsing(false);
    }
  };

  const handleContinue = () => {
    navigate("/visualization");
  };

  const exampleJSON = `{
  "classes": [
    {
      "name": "User",
      "attributes": [
        { "name": "id", "type": "string" },
        { "name": "name", "type": "string" },
        { "name": "email", "type": "string" }
      ],
      "methods": [
        { "name": "login", "returnType": "boolean" },
        { "name": "logout", "returnType": "void" }
      ]
    }
  ],
  "relationships": [
    {
      "from": "User",
      "to": "Order",
      "type": "hasMany"
    }
  ]
}`;

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">JSON Parsing</h1>
          <p className="text-muted-foreground">
            Input model JSON Anda dan validasi strukturnya
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Input JSON Model</CardTitle>
              <CardDescription>Paste JSON model Anda di sini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
                placeholder="Masukkan JSON model..."
                className="min-h-[400px] font-mono text-sm"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleParse}
                  disabled={!jsonInput || isParsing}
                >
                  {isParsing ? "Parsing..." : "Parse & Validasi"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setJsonInput(exampleJSON)}
                >
                  Load Example
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hasil Validasi</CardTitle>
              <CardDescription>
                Status dan error dari proses parsing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Validation Errors:</div>
                    <ul className="list-disc list-inside space-y-1">
                      {errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {isValid && (
                <>
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <div className="font-semibold mb-1">JSON Valid!</div>
                      <p className="text-sm">
                        Model berhasil diparse dan siap untuk divisualisasikan.
                      </p>
                    </AlertDescription>
                  </Alert>

                  <Button onClick={handleContinue} className="w-full">
                    Lanjut ke Visualisasi →
                  </Button>
                </>
              )}

              {!isValid && errors.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-4">Belum ada data yang diparse.</p>
                  <div className="space-y-2">
                    <p className="font-semibold">
                      Format JSON yang diharapkan:
                    </p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {`{
  "classes": [...],
  "relationships": [...]
}`}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
