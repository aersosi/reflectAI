import React from "react";

export type Post = {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export type DataItem = {
    title: string;
    variables: string[];
};

export type DataArray = DataItem[];

export type AnthropicModel = {
    display_name: string,
    id: string,
    created_at: string,
    type: string
}

export type AnthropicContextType = {
    anthropicModels: Model | null;
    isLoadingModels: boolean;
    modelsError: Error | null;
}
export type AnthropicProviderProps = React.FC<{ children: React.ReactNode }>

export type AnthropicModelListResponse = {
    data: Model;
    first_id?: string | null;
    has_more: boolean;
    last_id?: string | null;
    // type: string; // Usually 'list' for paginated results, maybe not needed directly
}
