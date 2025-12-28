import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router";
import { CheckCircle2 } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { useTheme } from "@/components/theme-provider";
import { XtUMLParser, getLineContext } from "../utils/xtuml-validator";
import ErrorDisplay from "../components/ErrorDisplay";
import { exampleJSON } from "@/constants/example-json";
import { getEditorTheme } from "@/lib/get-editor-theme";
import { useModel } from "@/contexts/ModelContext";

export default function ParsingPage() {
  const navigate = useNavigate();
  const { saveModel } = useModel();
  const [jsonInput, setJsonInput] = useState("");
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);

  const handleFileLoad = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validasi ekstensi file
    if (!file.name.endsWith(".json")) {
      setErrors(["File harus berformat .json"]);
      setIsValid(false);
      return;
    }

    // Baca file
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result;
      if (typeof content === "string") {
        setJsonInput(content);
        setErrors([]);
        setIsValid(false);
      }
    };
    reader.onerror = () => {
      setErrors(["Gagal membaca file"]);
      setIsValid(false);
    };
    reader.readAsText(file);

    // Reset input agar file yang sama bisa dipilih lagi
    event.target.value = "";
  };

  const handleParse = () => {
    setIsParsing(true);
    setErrors([]);
    setIsValid(false);
    // Clear model saat mulai parsing
    saveModel(null, "");

    try {
      // Validasi JSON
      const parsed = JSON.parse(jsonInput);
      console.log("Parsed JSON:", parsed);

      // Gunakan XtUMLParser untuk validasi mendalam
      const parser = new XtUMLParser();
      const validationErrors = parser.parse(parsed, jsonInput);
      console.log("Validation Errors:", validationErrors);

      // Enhance errors dengan code preview jika ada line number
      const enhancedErrors = validationErrors.map((error) => {
        if (error.line && jsonInput) {
          const codePreview = getLineContext(jsonInput, error.line, 2);
          return { ...error, codePreview };
        }
        return error;
      });

      if (enhancedErrors.length > 0) {
        setErrors(enhancedErrors);
        setIsValid(false);
        // Pastikan model tidak tersimpan jika ada error validasi
        saveModel(null, "");
      } else {
        setIsValid(true);
        // Simpan parsed data ke context HANYA jika validasi berhasil
        saveModel(parsed, jsonInput);
      }

      // Auto scroll to results
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } catch (error) {
      console.error("Parse Error:", error);
      setErrors([
        {
          type: "JSON_PARSE_ERROR",
          severity: "error",
          message: "Format JSON tidak valid",
          context: `${error.message}`,
          suggestion: "Periksa kembali sintaks JSON Anda (kurung kurawal, koma, tanda kutip, dll)",
          phase: "Parsing",
        },
      ]);
      setIsValid(false);
      // Pastikan model tidak tersimpan jika JSON parse error
      saveModel(null, "");

      // Auto scroll to results untuk menampilkan error
      setTimeout(() => {
        resultRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    } finally {
      setIsParsing(false);
    }
  };

  const handleContinue = () => {
    navigate("/visualization");
  };

  const { theme } = useTheme();

  return (
    <div className="w-full p-6">
      <div className="w-full space-y-6">
        <div className="mb-6 max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">JSON Parsing</h1>
          <p className="text-muted-foreground">Input model JSON Anda dan validasi strukturnya</p>
        </div>

        <div className="w-full space-y-6 max-w-7xl mx-auto">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Input JSON Model</CardTitle>
              <CardDescription>Paste JSON model Anda di sini</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CodeMirror
                value={jsonInput}
                height="500px"
                extensions={[json()]}
                onChange={(value) => setJsonInput(value)}
                placeholder="Masukkan JSON model..."
                theme={getEditorTheme(theme)}
                basicSetup={{
                  lineNumbers: true,
                  highlightActiveLineGutter: true,
                  highlightSpecialChars: true,
                  foldGutter: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightActiveLine: true,
                  highlightSelectionMatches: true,
                }}
                className="border rounded-md overflow-hidden"
              />

              <div className="flex gap-2">
                <Button
                  onClick={handleParse}
                  disabled={!jsonInput || isParsing}
                >
                  {isParsing ? "Parsing..." : "Parse & Validasi"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept=".json"
                  onChange={handleFileLoad}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Load File
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

          <Card
            ref={resultRef}
            className="w-full"
          >
            <CardHeader>
              <CardTitle>Hasil Validasi</CardTitle>
              <CardDescription>Status dan error dari proses parsing</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {errors.length > 0 && <ErrorDisplay errors={errors} />}

              {isValid && (
                <>
                  <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <AlertDescription className="text-green-800 dark:text-green-200">
                      <div className="font-semibold mb-1">Validation Passed!</div>
                      <p className="text-sm">Model berhasil diparse tanpa error dan siap untuk divisualisasikan.</p>
                    </AlertDescription>
                  </Alert>

                  <Button
                    onClick={handleContinue}
                    className="w-full"
                  >
                    Lanjut ke Visualisasi →
                  </Button>
                </>
              )}

              {!isValid && errors.length === 0 && (
                <div className="text-sm text-muted-foreground">
                  <p className="mb-4">Belum ada data yang diparse.</p>
                  <div className="space-y-2">
                    <p className="font-semibold">Format JSON xtUML yang diharapkan:</p>
                    <pre className="bg-muted p-3 rounded text-xs overflow-x-auto">
                      {`{
  "system_model": {
    "subsystems": [{
      "classes": [...],
      "external_entities": [...]
    }]
  }
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
