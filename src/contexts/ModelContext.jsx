import { createContext, useContext, useState } from "react";

const ModelContext = createContext(undefined);

export function ModelProvider({ children }) {
  const [parsedModel, setParsedModel] = useState(null);
  const [jsonInput, setJsonInput] = useState("");

  const saveModel = (model, input) => {
    setParsedModel(model);
    setJsonInput(input);
  };

  const clearModel = () => {
    setParsedModel(null);
    setJsonInput("");
  };

  return <ModelContext.Provider value={{ parsedModel, jsonInput, saveModel, clearModel }}>{children}</ModelContext.Provider>;
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
