import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router";
import { AlertCircle, Download, Copy } from "lucide-react";

export default function TranslationPage() {
  const navigate = useNavigate();
  const [modelData, setModelData] = useState(null);
  const [selectedLanguage, setSelectedLanguage] = useState("java");
  const [translatedCode, setTranslatedCode] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Load parsed data dari localStorage
    const stored = localStorage.getItem("parsedModel");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setModelData(data);
        // Generate code untuk bahasa default
        generateCode(data, "java");
      } catch (error) {
        console.error("Error loading model data:", error);
      }
    }
  }, []);

  const generateCode = (data, language) => {
    if (!data || !data.classes) return;

    let code = "";

    switch (language) {
      case "java":
        code = generateJavaCode(data);
        break;
      case "python":
        code = generatePythonCode(data);
        break;
      case "typescript":
        code = generateTypeScriptCode(data);
        break;
      default:
        code = "// Belum diimplementasikan";
    }

    setTranslatedCode(code);
  };

  const generateJavaCode = (data) => {
    return data.classes
      .map((cls) => {
        let code = `public class ${cls.name} {\n`;

        // Attributes
        if (cls.attributes) {
          cls.attributes.forEach((attr) => {
            const javaType = mapTypeToJava(attr.type);
            code += `    private ${javaType} ${attr.name};\n`;
          });
          code += "\n";
        }

        // Constructor
        code += `    public ${cls.name}() {\n    }\n\n`;

        // Getters and Setters
        if (cls.attributes) {
          cls.attributes.forEach((attr) => {
            const javaType = mapTypeToJava(attr.type);
            const capitalizedName = attr.name.charAt(0).toUpperCase() + attr.name.slice(1);

            code += `    public ${javaType} get${capitalizedName}() {\n`;
            code += `        return ${attr.name};\n`;
            code += `    }\n\n`;

            code += `    public void set${capitalizedName}(${javaType} ${attr.name}) {\n`;
            code += `        this.${attr.name} = ${attr.name};\n`;
            code += `    }\n\n`;
          });
        }

        // Methods
        if (cls.methods) {
          cls.methods.forEach((method) => {
            const javaReturnType = mapTypeToJava(method.returnType);
            code += `    public ${javaReturnType} ${method.name}() {\n`;
            code += `        // TODO: Implement method\n`;
            code += `        return ${getDefaultValue(javaReturnType)};\n`;
            code += `    }\n\n`;
          });
        }

        code += "}\n";
        return code;
      })
      .join("\n\n");
  };

  const generatePythonCode = (data) => {
    return data.classes
      .map((cls) => {
        let code = `class ${cls.name}:\n`;

        // Constructor
        code += `    def __init__(self`;
        if (cls.attributes && cls.attributes.length > 0) {
          cls.attributes.forEach((attr) => {
            code += `, ${attr.name}=None`;
          });
        }
        code += "):\n";

        if (cls.attributes && cls.attributes.length > 0) {
          cls.attributes.forEach((attr) => {
            code += `        self.${attr.name} = ${attr.name}\n`;
          });
        } else {
          code += `        pass\n`;
        }
        code += "\n";

        // Methods
        if (cls.methods) {
          cls.methods.forEach((method) => {
            code += `    def ${method.name}(self):\n`;
            code += `        # TODO: Implement method\n`;
            code += `        pass\n\n`;
          });
        }

        return code;
      })
      .join("\n\n");
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

  const mapTypeToJava = (type) => {
    const typeMap = {
      string: "String",
      number: "int",
      boolean: "boolean",
      void: "void",
    };
    return typeMap[type] || "Object";
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

  const getDefaultValue = (type) => {
    const defaultMap = {
      boolean: "false",
      int: "0",
      void: "",
    };
    return defaultMap[type] || "null";
  };

  const handleLanguageChange = (language) => {
    setSelectedLanguage(language);
    if (modelData) {
      generateCode(modelData, language);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const extensions = {
      java: ".java",
      python: ".py",
      typescript: ".ts",
    };
    const blob = new Blob([translatedCode], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model${extensions[selectedLanguage]}`;
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
          <h1 className="text-3xl font-bold mb-2">Code Translation</h1>
          <p className="text-muted-foreground">Translasi model ke berbagai bahasa pemrograman</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Pilih Bahasa Target</CardTitle>
            <CardDescription>Kode akan di-generate secara otomatis</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={selectedLanguage}
              onValueChange={handleLanguageChange}
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="java">Java</TabsTrigger>
                <TabsTrigger value="python">Python</TabsTrigger>
                <TabsTrigger value="typescript">TypeScript</TabsTrigger>
              </TabsList>

              <TabsContent
                value="java"
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Generated Java Code</p>
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
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={translatedCode}
                  readOnly
                  className="min-h-[500px] font-mono text-sm"
                />
              </TabsContent>

              <TabsContent
                value="python"
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Generated Python Code</p>
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
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={translatedCode}
                  readOnly
                  className="min-h-[500px] font-mono text-sm"
                />
              </TabsContent>

              <TabsContent
                value="typescript"
                className="space-y-4"
              >
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Generated TypeScript Code</p>
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
                      Download
                    </Button>
                  </div>
                </div>
                <Textarea
                  value={translatedCode}
                  readOnly
                  className="min-h-[500px] font-mono text-sm"
                />
              </TabsContent>
            </Tabs>
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
