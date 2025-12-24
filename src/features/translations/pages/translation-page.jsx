import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "react-router";
import { AlertCircle, Download, Copy } from "lucide-react";
import CodeMirror from "@uiw/react-codemirror";
import { javascript } from "@codemirror/lang-javascript";
import { useTheme } from "@/components/theme-provider";

export default function TranslationPage() {
  const navigate = useNavigate();
  const [modelData, setModelData] = useState(null);
  const [translatedCode, setTranslatedCode] = useState("");
  const [copied, setCopied] = useState(false);

  const { theme } = useTheme();

  const editorTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
    ? theme === "system"
      ? "dark"
      : theme
    : theme === "system"
    ? "light"
    : theme;

  useEffect(() => {
    // Load parsed data dari localStorage
    const stored = localStorage.getItem("parsedModel");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setModelData(data);
        // Generate TypeScript code
        generateCode(data);
      } catch (error) {
        console.error("Error loading model data:", error);
      }
    }
  }, []);

  const generateCode = (data) => {
    if (!data || !data.classes) return;
    const code = generateTypeScriptCode(data);
    setTranslatedCode(code);
  };

  const generateTypeScriptCode = (data) => {
    return data.classes
      .map((cls) => {
        let code = `export class ${cls.name} {\n`;

        // Attributes
        if (cls.attributes) {
          cls.attributes.forEach((attr) => {
            const tsType = mapTypeToTypeScript(attr.type);
            code += `    private ${attr.name}: ${tsType};\n`;
          });
          code += "\n";
        }

        // Constructor
        code += `    constructor(`;
        if (cls.attributes && cls.attributes.length > 0) {
          const params = cls.attributes
            .map((attr) => {
              const tsType = mapTypeToTypeScript(attr.type);
              return `${attr.name}?: ${tsType}`;
            })
            .join(", ");
          code += params;
        }
        code += `) {\n`;

        if (cls.attributes && cls.attributes.length > 0) {
          cls.attributes.forEach((attr) => {
            code += `        this.${attr.name} = ${attr.name};\n`;
          });
        }
        code += `    }\n\n`;

        // Methods
        if (cls.methods) {
          cls.methods.forEach((method) => {
            const tsReturnType = mapTypeToTypeScript(method.returnType);
            code += `    ${method.name}(): ${tsReturnType} {\n`;
            code += `        // TODO: Implement method\n`;
            if (method.returnType !== "void") {
              code += `        return null as any;\n`;
            }
            code += `    }\n\n`;
          });
        }

        code += "}\n";
        return code;
      })
      .join("\n\n");
  };

  const mapTypeToTypeScript = (type) => {
    const typeMap = {
      string: "string",
      number: "number",
      boolean: "boolean",
      void: "void",
    };
    return typeMap[type] || "any";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([translatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "model.ts";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">TypeScript Code Generator</h1>
          <p className="text-muted-foreground">Generate TypeScript code dari model UML</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generated TypeScript Code</CardTitle>
            <CardDescription>Kode TypeScript di-generate secara otomatis dari model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">Output TypeScript</p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download .ts
                </Button>
              </div>
            </div>
            <CodeMirror
              value={translatedCode}
              height="500px"
              extensions={[javascript({ typescript: true })]}
              editable={false}
              readOnly={true}
              theme={editorTheme}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLineGutter: false,
                highlightSpecialChars: true,
                foldGutter: true,
                bracketMatching: true,
                highlightActiveLine: false,
                highlightSelectionMatches: false,
              }}
              className="border rounded-md overflow-hidden"
            />
          </CardContent>
        </Card>

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
