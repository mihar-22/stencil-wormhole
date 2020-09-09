import {
  FunctionalComponent,
  getElement,
  getRenderingRef,
} from "@stencil/core";
import { context } from "./shared";
import { ContextProvider } from "dom-context";

export interface Creator {
  connectedCallback?(): void;
  disconnectedCallback?(): void;
}

export type UniverseState = Record<string, any>;

export interface UniverseProviderProps {
  state: UniverseState;
}

export type Universe  = ContextProvider<UniverseState>;

const multiverse = new Map<Creator, Universe>();

export const Universe: {
  create(creator: Creator, initialState: UniverseState): void;
  Provider: FunctionalComponent<UniverseProviderProps>;
} = {
  create(creator: Creator, initialState: UniverseState) {
    const el = getElement(creator);

    const universe = new context.Provider({
      element: el,
      initialState,
    });
    multiverse.set(creator, universe);

    const connectedCallback = creator.connectedCallback;
    creator.connectedCallback = function () {
      multiverse.set(creator, universe);
      universe.start();
      if (connectedCallback) {
        connectedCallback.call(creator);
      }
    };

    const disconnectedCallback = creator.disconnectedCallback;
    creator.disconnectedCallback = function () {
      multiverse.delete(creator);
      universe.stop();
      if (disconnectedCallback) {
        disconnectedCallback.call(creator);
      }
    };

  },

  Provider({ state }, children) {
    const creator = getRenderingRef();

    if (multiverse.has(creator)) {
      const universe = multiverse.get(creator);
      universe.context = state;
    }

    return children;
  },
};
