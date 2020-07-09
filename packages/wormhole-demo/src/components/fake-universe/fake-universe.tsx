import { h, Component, Prop } from "@stencil/core";
import { Universe } from "stencil-wormhole";

@Component({
  tag: 'fake-universe'
})
export class FakeUniverse {
  @Prop({ mutable: true }) state: Record<string, any> = {
    message: '',
    data: {}
  };

  @Prop() wasDisconnectedCallbackCalled = jest.fn()

  connectedCallback() {
    Universe.create(this, this.state);
  }

  disconnectedCallback() {
    this.wasDisconnectedCallbackCalled()
  }

  render() {
    return (
      <Universe.Provider creator={this} state={this.state}>
        <fake-consumer />
        <slot />
      </Universe.Provider>
    )
  }
}
