import { RefObject, createContext } from 'react';
import { VirtuosoHandle } from 'react-virtuoso';

export const VirtuosoContext = createContext<RefObject<VirtuosoHandle | null> | null>(null);
