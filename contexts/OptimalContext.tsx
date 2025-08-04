import { createContext, ReactNode, useContext, useState } from "react";
import { apiService } from "../services/api";

type OptimalPackingInput = {
  productId: string;
  quantity: number;
};

type OptimalPackingOutput = {
  success: boolean;
  message: string;
  productInfo: any;
  unpackedProducts: any[];
  remainingQuantity: number;
  summary: any;
  analytics: any;
  metadata: any;
};

interface OptimalContextType {
  loading: boolean;
  error: string | null;
  result: OptimalPackingOutput | null;
  fetchOptimalPacking: (input: OptimalPackingInput) => Promise<void>;
  clearResult: () => void;
}

const OptimalContext = createContext<OptimalContextType | undefined>(undefined);

export const OptimalProvider = ({ children }: { children: ReactNode }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OptimalPackingOutput | null>(null);

  const fetchOptimalPacking = async (input: OptimalPackingInput) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await apiService.optimalPacking2(input);
      if (response.success) {
        setResult(response as OptimalPackingOutput);
      } else {
        setError(response.message || "Unknown error");
      }
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => setResult(null);

  return (
    <OptimalContext.Provider
      value={{ loading, error, result, fetchOptimalPacking, clearResult }}
    >
      {children}
    </OptimalContext.Provider>
  );
};

export const useOptimal = () => {
  const ctx = useContext(OptimalContext);
  if (!ctx) throw new Error("useOptimal must be used within OptimalProvider");
  return ctx;
};
