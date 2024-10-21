import { createCallbacksTransformer, createSSEProtocolTransformer, StreamProtocolChunk } from ".";
import { ChatStreamCallbacks } from "../..";

interface DifyChunk {
    event: string;
    task_id?: string;
    answer?: string;
    message?: string;
    message_id?: string;
    id?: string
}

const processDifyData = (buffer: string): DifyChunk | undefined => {
    try {
        // Remove the prefix `data:`
        if (buffer.startsWith('data:'))
            return JSON.parse(buffer.slice(5).trim()) as DifyChunk
        return JSON.parse(buffer.trim())
    } catch (error) {
        // Try another way to parse the data
        // Dify is wired, sometimes the stream data contains multiple lines of 
        // stream event in a single chunk, so we need to split the data by `data:`
        // and ONLY keep the last slice of the chunk
        const slices = buffer.split('data: ');
        try {
            return JSON.parse(slices[slices.length - 1].trim()) as DifyChunk
        } catch { }
    }
}

export const transformDifyStream = (buffer: Uint8Array): StreamProtocolChunk => {
    const decoder = new TextDecoder()
    const chunk = processDifyData(decoder.decode(buffer, { stream: true }))
    const id = chunk?.message_id ?? chunk?.task_id ?? chunk?.id;
    // Return empty block if error
    if (!chunk || !id) return {
        data: '',
        type: 'text',
    }
    let type: StreamProtocolChunk['type'] = 'text';
    let data: DifyChunk | string = chunk;
    switch (chunk.event) {
        case 'message_end':
            type = 'stop'
            break;
        case 'message':
            type = 'text';
            data = chunk.answer ?? '';
            break;
        case 'workflow_started':
            type = 'tool_using';
            break;
        case 'node_started':
            type = 'thoughts';
            break;
        case 'workflow_finished':
            type = 'tool_using';
            break;
        case 'node_finished':
            type = 'thoughts';
            break;
    }
    return {
        id,
        data,
        type,
    }
}

export const DifyStream = (stream: ReadableStream, callbacks?: ChatStreamCallbacks) => {
    return stream
        .pipeThrough(createSSEProtocolTransformer(transformDifyStream))
        .pipeThrough(createCallbacksTransformer(callbacks));
};