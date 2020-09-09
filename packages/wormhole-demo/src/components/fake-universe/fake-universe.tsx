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

  @Prop() wasConnectedCallbackCalled:any = jest.fn();

  @Prop() wasDisconnectedCallbackCalled:any = jest.fn();

  connectedCallback() {
    this.wasConnectedCallbackCalled(this.state.message);
  }

  componentWillLoad() {
    Universe.create(this, this.state);
  }

  disconnectedCallback() {
    this.wasDisconnectedCallbackCalled(this.state.message)
  }

  render() {
    return (
      <Universe.Provider state={this.state}>
        <slot />
      </Universe.Provider>
    )
  }
}
