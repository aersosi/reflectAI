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