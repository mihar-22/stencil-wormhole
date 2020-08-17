import { OpenWormhole, WormholeConsumer } from "./consumer";
import { FunctionalComponent, getElement, getRenderingRef } from "@stencil/core";

export interface Creator {
  connectedCallback?(): void
  disconnectedCallback?(): void
}

export type UniverseState = Record<string ,any>

export interface UniverseProviderProps {
  state: UniverseState
}

export type Wormholes = Map<WormholeConsumer, string[]>;

export interface Universe  {
  wormholes: Wormholes
  state: UniverseState
}

const multiverse = new Map<Creator, Universe>()

const updateConsumer = (consumer: WormholeConsumer, fields: string[], state: UniverseState) => {
  fields.forEach((field) => { consumer[field] = state[field]; });
}

export const Universe: {
  create(creator: Creator, initialState: UniverseState): void,
  Provider: FunctionalComponent<UniverseProviderProps> 
} = {
  create (creator: Creator,  initialState: UniverseState) {
      const el = getElement(creator);
      const wormholes: Wormholes = new Map();
      const universe = { wormholes, state: initialState };
      
      multiverse.set(creator, universe);

      const connectedCallback = creator.connectedCallback;
      creator.connectedCallback = function () {
        multiverse.set(creator, universe);
        if (connectedCallback) { connectedCallback.call(creator) }
      }

      const disconnectedCallback = creator.disconnectedCallback;
      creator.disconnectedCallback = function () {
        multiverse.delete(creator);
        if (disconnectedCallback) { disconnectedCallback.call(creator) }
      }

      el.addEventListener('openWormhole', (event: CustomEvent<OpenWormhole>) => {
        event.stopPropagation();
        const { consumer, fields, onOpen } = event.detail;
        const { connectedCallback, disconnectedCallback } = consumer;

        if (wormholes.has(consumer)) return;

        consumer.connectedCallback = function () {
          wormholes.set(consumer, fields);
          if (connectedCallback) { connectedCallback.call(consumer); }
        }

        consumer.disconnectedCallback = function () {
          wormholes.delete(consumer);
          if (disconnectedCallback) { disconnectedCallback.call(consumer); }
        }

        wormholes.set(consumer, fields);
        updateConsumer(consumer, fields, universe.state);

        onOpen.resolve();
      });
  },

  Provider( { state }, children,) {
    const creator = getRenderingRef();
    
    if (multiverse.has(creator)) {
      const universe = multiverse.get(creator);
      universe.state = state;
      universe.wormholes.forEach((fields, consumer) => { updateConsumer(consumer, fields, state) });
    }
    
    return children;
  }
}
