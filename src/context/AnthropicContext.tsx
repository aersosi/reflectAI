import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import Anthropic from "@anthropic-ai/sdk";
import { AnthropicModelListResponse, AnthropicContextType, AnthropicProviderProps } from "@/definitions/api";

const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

const fetchAnthropicModels = async (): Promise<AnthropicModelListResponse> => {
  const response = await anthropic.models.list({
    limit: 20,
  });
  return response as unknown as AnthropicModelListResponse;
};


const AnthropicContext = createContext<AnthropicContextType | undefined>(undefined);
// const LOCAL_STORAGE_KEY = 'anthropicModels';

export const AnthropicProvider: AnthropicProviderProps = ({children}) => {
  const {
    data: modelsResponse,
    isLoading: isLoadingModels,
    error: modelsError
  } = useQuery<AnthropicModelListResponse, Error>({ // Use the defined interface
    queryKey: ['anthropicModels'], // Unique key for this query
    queryFn: fetchAnthropicModels, // The async function to fetch data
    // Optional: configure staleTime, cacheTime, retry, etc.
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });

  const contextValue: AnthropicContextType = {
    anthropicModels: modelsResponse?.data ?? null,
    isLoadingModels,
    modelsError
  };

  return (
      <AnthropicContext.Provider value={contextValue}>
        {children}
      </AnthropicContext.Provider>
  );
}

export const useAnthropic = (): AnthropicContextType => {
  const context = useContext(AnthropicContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};


// if (isLoadingModels) return <div>Loading Anthropic models...</div>;
// if (modelsError) return <div>An error occurred fetching models: {modelsError.message}</div>;
// const modelList = modelsResponse?.data ?? [];
//
// console.log("Models list", modelList);

// return(
//     <>
//         {modelList.length > 0 ? (
//             <ul>
//                 {modelList.map((model) => (
//                     <li key={model.id}>
//                         {model.display_name} || ({model.id}) || {new Date(model.created_at).toLocaleDateString()}
//                     </li>
//                 ))}
//             </ul>
//         ) : (
//             <p>No models found.</p>
//         )}
//     </>
// )


