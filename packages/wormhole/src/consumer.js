export var openWormhole = function (Component, props) {
    var ComponentPrototype = Component.prototype;
    var connectedCallback = ComponentPrototype.connectedCallback, disconnectedCallback = ComponentPrototype.disconnectedCallback;
    ComponentPrototype.connectedCallback = function () {
        var el = this.el;
        var event = new CustomEvent('openWormhole', {
            bubbles: true,
            composed: true,
            detail: {
                consumer: this,
                fields: props,
            },
        });
        el.dispatchEvent(event);
        if (connectedCallback) {
            return connectedCallback.call(this);
        }
    };
    ComponentPrototype.disconnectedCallback = function () {
        var el = this.el;
        var event = new CustomEvent('closeWormhole', {
            bubbles: true,
            composed: true,
            detail: { consumer: this },
        });
        el.dispatchEvent(event);
        if (disconnectedCallback) {
            disconnectedCallback.call(this);
        }
    };
};
