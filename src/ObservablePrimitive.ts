import { doNotify } from './notify';
import { isFunction } from './is';
import { ListenerFn, NodeValue, ObservableListenerDispose } from './observableInterfaces';
import { onChange } from './onChange';
import { updateTracking } from './tracking';

export class ObservablePrimitive<T = any> {
    #node: NodeValue;

    constructor(node: NodeValue) {
        this.#node = node;
        this.set = this.set.bind(this);
    }
    get value() {
        const node = this.#node;
        updateTracking(node);
        return node.root._;
    }
    set value(value: T) {
        const prev = this.#node.root._;
        this.#node.root._ = value;
        doNotify(this.#node, value, [], value, prev, 0);
    }
    get(): T {
        return this.value;
    }
    set(value: T | ((prev: T) => T)) {
        if (isFunction(value)) {
            value = value(this.#node.root._);
        }
        this.value = value;
        return this;
    }
    onChange(
        cb: ListenerFn<T>,
        track?: boolean | Symbol,
        noArgs?: boolean,
        markAndSweep?: boolean
    ): ObservableListenerDispose {
        return onChange(this.#node, cb, track, noArgs);
    }
    obs() {
        return this;
    }
    /** @internal */
    getNode() {
        return this.#node;
    }
}
