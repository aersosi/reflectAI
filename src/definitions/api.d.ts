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

export type AnthropicModelListResponse = {
    data: AnthropicModel[] | null;
    first_id?: string | null;
    has_more: boolean;
    last_id?: string | null;
    // type: string; // Usually 'list' for paginated results, maybe not needed directly
}

export type AnthropicContextType = {
    anthropicModels: AnthropicModel[] | null;
    isLoadingModels: boolean;
    modelsError: Error | null;
}


