declare module karmaSourcemapLoader {
    type File = {
        path: string;
        originalPath: string;
        sourceMap?: SourceMap;
    };

    type Config = {
        sourceMapLoader?: {
            remapPrefixes?: Record<string, string>;
            remapSource?: (source: string) => string | false | null | undefined;
            useSourceRoot?:
                | ((file: File) => string | false | null | undefined)
                | string;
            onlyWithURL?: boolean;
            strict?: boolean;
        };
    };

    type Preprocessor = (
        content: string,
        file: File,
        done: (result: string | Error) => void
    ) => void;

    type SourceMap = {
        sources: string[];
        sourceRoot?: string;
    };
}
