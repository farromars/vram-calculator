/**
 * VRAM Calculator MCP Server Implementation
 */
export declare class VRAMCalculatorServer {
    private models;
    private gpus;
    listResources(): Promise<{
        resources: {
            uri: string;
            name: string;
            description: string;
        }[];
    }>;
    readResource(uri: string): Promise<{
        contents: {
            uri: "models://nlp";
            text: string;
        }[];
    } | {
        contents: {
            uri: "models://multimodal";
            text: string;
        }[];
    } | {
        contents: {
            uri: "models://embedding";
            text: string;
        }[];
    } | {
        contents: {
            uri: "gpu://specs";
            text: string;
        }[];
    } | {
        contents: {
            uri: "formulas://vram";
            text: string;
        }[];
    }>;
    listTools(): Promise<{
        tools: ({
            name: string;
            description: string;
            inputSchema: {
                type: string;
                properties: {
                    modelId: {
                        type: string;
                        description: string;
                    };
                    mode: {
                        type: string;
                        enum: string[];
                        description: string;
                        default?: undefined;
                    };
                    batchSize: {
                        type: string;
                        description: string;
                        default: number;
                    };
                    sequenceLength: {
                        type: string;
                        description: string;
                        default: number;
                    };
                    precision: {
                        type: string;
                        enum: string[];
                        default: string;
                    };
                    vramRequired?: undefined;
                    budget?: undefined;
                    useCase?: undefined;
                    multiGPU?: undefined;
                    modelIds?: undefined;
                };
                required: string[];
            };
        } | {
            name: string;
            description: string;
            inputSchema: {
                type: string;
                properties: {
                    vramRequired: {
                        type: string;
                        description: string;
                    };
                    budget: {
                        type: string;
                        description: string;
                        default: number;
                    };
                    useCase: {
                        type: string;
                        enum: string[];
                        default: string;
                    };
                    multiGPU: {
                        type: string;
                        description: string;
                        default: boolean;
                    };
                    modelId?: undefined;
                    mode?: undefined;
                    batchSize?: undefined;
                    sequenceLength?: undefined;
                    precision?: undefined;
                    modelIds?: undefined;
                };
                required: string[];
            };
        } | {
            name: string;
            description: string;
            inputSchema: {
                type: string;
                properties: {
                    modelIds: {
                        type: string;
                        items: {
                            type: string;
                        };
                        description: string;
                    };
                    mode: {
                        type: string;
                        enum: string[];
                        default: string;
                        description?: undefined;
                    };
                    batchSize: {
                        type: string;
                        default: number;
                        description?: undefined;
                    };
                    sequenceLength: {
                        type: string;
                        default: number;
                        description?: undefined;
                    };
                    precision: {
                        type: string;
                        enum: string[];
                        default: string;
                    };
                    modelId?: undefined;
                    vramRequired?: undefined;
                    budget?: undefined;
                    useCase?: undefined;
                    multiGPU?: undefined;
                };
                required: string[];
            };
        })[];
    }>;
    callTool(name: string, args: any): Promise<{
        content: Array<{
            type: string;
            text: string;
        }>;
    }>;
    private calculateVRAM;
    private recommendGPU;
    private compareModels;
}
//# sourceMappingURL=server.d.ts.map