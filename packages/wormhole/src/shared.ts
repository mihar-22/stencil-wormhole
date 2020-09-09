import { createContext } from "dom-context";

export type UniverseState = Record<string, any>;
export const EventName = "openWormhole";

export const context = createContext<UniverseState>(EventName);
