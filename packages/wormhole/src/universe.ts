import { CloseWormhole, OpenWormhole, WormholeConsumer } from "./consumer";
import { FunctionalComponent, getElement, getRenderingRef } from "@stencil/core";

export interface Creator {
  disconnectedCallback?(): void
}

export type UniverseState = Record<string ,any>

export interface UniverseProviderProps {
  state: UniverseState
}

export interface IUniverse {
  create(creator: Creator, initialState: UniverseState),
  Provider: FunctionalComponent<UniverseProviderProps>
}

const multiverse = new Map<Creator, Map<WormholeConsumer, string[]>>()

const updateConsumer = (consumer: WormholeConsumer, fields: string[], state: UniverseState) => {
  fields.forEach((field) => { consumer[field] = state[field]; });
}

export const Universe: IUniverse = {
  create(creator: Creator, initialState: UniverseState) {
    const el = getElement(creator);
    const wormholes = new Map();

    multiverse.set(creator, wormholes);

    el.addEventListener('openWormhole', (event: CustomEvent<OpenWormhole>) => {
      event.stopPropagation();
      const { consumer, fields } = event.detail;
      wormholes.set(consumer, fields);
      updateConsumer(consumer, fields, initialState);
    });

    el.addEventListener('closeWormhole', (event: CustomEvent<CloseWormhole>) => {
      event.stopPropagation();
      const { consumer } = event.detail;
      wormholes.delete(consumer);
    });

    const disconnectedCallback = creator.disconnectedCallback;
    creator.disconnectedCallback = function () {
      multiverse.delete(creator);
      if (disconnectedCallback) { disconnectedCallback.call(this) }
    }
  },

  Provider({ state }, children) {
    const creator = getRenderingRef();
    const wormholes = multiverse.get(creator);
    wormholes.forEach((fields, consumer) => { updateConsumer(consumer, fields, state) });
    return children;
  },
};

