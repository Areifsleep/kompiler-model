import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { AlertCircle, Download, Copy, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

// Asumsikan path ini benar berdasarkan snippet Anda
import { TypeScriptTranslator } from "../utils/typescript-translator";
import { useTheme } from "@/components/theme-provider";
import { getEditorTheme } from "@/lib/get-editor-theme";

export default function TranslationPage() {
  const navigate = useNavigate();
  const [modelData, setModelData] = useState(null);
  const [translatedCode, setTranslatedCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState(null);

  const { theme } = useTheme();

  useEffect(() => {
    const stored = localStorage.getItem("parsedModel");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setModelData(data);
        translateModel(data);
      } catch (error) {
        console.error("Error loading model data:", error);
        setError("Gagal memuat data model");
      }
    }
  }, []);

  const translateModel = async (data) => {
    setTranslating(true);
    setError(null);

    try {
      // Menggunakan class utility yang diimport
      const translator = new TypeScriptTranslator(data);
      const code = translator.translate();

      setTranslatedCode(code);
      // toast.success("Translasi berhasil!");
    } catch (error) {
      console.error("Translation error:", error);
      setError(error.message || "Gagal melakukan translasi");
      toast.error("Translasi gagal");
    } finally {
      setTranslating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedCode);
    setCopied(true);
    toast.success("Kode berhasil disalin!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([translatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    const systemName = modelData?.system_model?.system_name || "model";
    const filename = systemName.toLowerCase().replace(/\s+/g, "-");

    a.href = url;
    a.download = `${filename}.ts`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("File berhasil diunduh!");
  };

  const handleRetranslate = () => {
    if (modelData) {
      translateModel(modelData);
    }
  };

  // State: Jika tidak ada data model
  if (!modelData) {
    return (
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-2">Tidak ada data model</div>
              <p className="text-sm mb-4">Silakan parse JSON model terlebih dahulu.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/parsing")}
              >
                Kembali ke Parsing
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // State: Main UI
  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">TypeScript Code Generator</h1>
          <p className="text-muted-foreground">Generate TypeScript code dari model {modelData.system_model?.system_name || "xtUML"}</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <div className="font-semibold mb-1">Translation Error</div>
              <p className="text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={handleRetranslate}
              >
                Coba Lagi
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {!error && translatedCode && (
          <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <div className="font-semibold mb-1">Translation Success!</div>
              <p className="text-sm">
                Berhasil men-translate {modelData.system_model?.subsystems?.[0]?.classes?.length || 0} class dan{" "}
                {modelData.system_model?.subsystems?.[0]?.relationships?.length || 0} relationship
              </p>
            </AlertDescription>
          </Alert>
        )}

        {/* Code Output Card */}
        <Card>
          <CardHeader>
            <CardTitle>Generated TypeScript Code</CardTitle>
            <CardDescription>Clean TypeScript code tanpa contoh dan testing</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {translatedCode.split("\n").length} lines | {(translatedCode.length / 1024).toFixed(2)} KB
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                  disabled={!translatedCode}
                >
                  {copied ? <CheckCircle2 className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={!translatedCode}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download .ts
                </Button>
              </div>
            </div>

            <CodeMirror
              value={translating ? "// Translating..." : translatedCode}
              height="600px"
              extensions={[javascript({ typescript: true })]}
              readOnly
              theme={getEditorTheme(theme)}
              className="border rounded-md overflow-hidden"
            />
          </CardContent>
        </Card>

        {/* Footer Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={() => navigate("/visualization")}
          >
            ← Kembali ke Visualisasi
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate("/")}
          >
            Kembali ke Home
          </Button>
        </div>
      </div>
    </div>
  );
}
