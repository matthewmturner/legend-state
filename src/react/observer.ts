import { ComponentProps, FC, forwardRef, memo } from 'react';
import { useForceRender } from './useForceRender';
import { useObserver } from './useObserver';

const hasSymbol = typeof Symbol === 'function' && Symbol.for;

// Extracting the forwardRef inspired by https://github.com/mobxjs/mobx/blob/main/packages/mobx-react-lite/src/observer.ts
const ReactForwardRefSymbol = hasSymbol
    ? Symbol.for('react.forward_ref')
    : typeof forwardRef === 'function' && forwardRef((props: any) => null)['$$typeof'];

export function observer<T extends FC<any>>(
    component: T,
    propsAreEqual?: (prevProps: Readonly<ComponentProps<T>>, nextProps: Readonly<ComponentProps<T>>) => boolean
): T {
    // Unwrap forwardRef on the component
    let useForwardRef: boolean;
    if (ReactForwardRefSymbol && component['$$typeof'] === ReactForwardRefSymbol) {
        useForwardRef = true;
        component = component['render'];
        if (process.env.NODE_ENV === 'development' && typeof component !== 'function') {
            throw new Error(`[legend-state] \`render\` property of ForwardRef was not a function`);
        }
    }

    const componentName = component.displayName || component.name;

    // Create a wrapper observer component
    let observer = function (props, ref) {
        const forceRender = useForceRender();

        // Set up all the listeners while rendering the component
        return useObserver(() => component(props, ref), forceRender);
    };

    if (componentName !== '') {
        (observer as FC).displayName = componentName;
    }

    // Wrap back in forwardRef if necessary
    if (useForwardRef) {
        observer = forwardRef(observer);
    }

    return memo(observer, propsAreEqual) as unknown as T;
}