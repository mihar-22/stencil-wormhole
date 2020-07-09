var multiverse = new Map();
export var Universe = function (_a, children) {
    var creator = _a.creator, state = _a.state;
    var wormholes = multiverse.get(creator);
    if (!multiverse.has(creator)) {
        if (typeof wormholes === 'undefined') {
            wormholes = new Map();
            multiverse.set(creator, wormholes);
        }
        creator.el.addEventListener('openWormhole', function (event) {
            event.stopPropagation();
            var _a = event.detail, consumer = _a.consumer, fields = _a.fields;
            wormholes.set(consumer, fields);
        });
        creator.el.addEventListener('closeWormhole', function (event) {
            event.stopPropagation();
            var consumer = event.detail.consumer;
            wormholes.delete(consumer);
        });
        var disconnectedCallback_1 = creator.disconnectedCallback;
        creator.disconnectedCallback = function () {
            multiverse.delete(creator);
            if (disconnectedCallback_1) {
                disconnectedCallback_1.call(this);
            }
        };
    }
    wormholes.forEach(function (fields, consumer) {
        fields.forEach(function (field) {
            consumer[field] = state[field];
        });
    });
    return children;
};
