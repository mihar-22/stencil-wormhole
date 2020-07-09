import { FunctionalComponent } from "@stencil/core";
import { CloseWormhole, OpenWormhole, WormholeConsumer } from "./consumer";

export interface Creator {
  el: HTMLElement
  disconnectedCallback?(): void
}

export interface UniverseProps {
  creator: Creator,
  state: Record<string, any>
}

const multiverse = new Map<Creator, Map<WormholeConsumer, string[]>>()

export const Universe: FunctionalComponent<UniverseProps> = ({ creator, state }, children) => {
  let wormholes = multiverse.get(creator);

  if (!multiverse.has(creator)) {
    if (typeof wormholes === 'undefined') {
      wormholes = new Map();
      multiverse.set(creator, wormholes);
    }

    creator.el.addEventListener('openWormhole', (event: CustomEvent<OpenWormhole>) => {
      event.stopPropagation();
      const { consumer, fields } = event.detail;
      wormholes.set(consumer, fields);
    });

    creator.el.addEventListener('closeWormhole', (event: CustomEvent<CloseWormhole>) => {
      event.stopPropagation();
      const { consumer } = event.detail;
      wormholes.delete(consumer);
    });

    const disconnectedCallback = creator.disconnectedCallback;
    creator.disconnectedCallback = function () {
      multiverse.delete(creator);
      if (disconnectedCallback) { disconnectedCallback.call(this) }
    }
  }

  wormholes.forEach((fields, consumer) => {
    fields.forEach((field) => {
      consumer[field] = state[field];
    });
  });

  return children;
}
