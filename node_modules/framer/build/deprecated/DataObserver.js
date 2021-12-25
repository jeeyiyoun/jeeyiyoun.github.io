import * as React from "react";
import { Data } from "../data/Data.js";
import { MainLoop } from "../core/Loop.js";
const initialState = { update: 0 };
/**
 * @deprecated
 * @internal
 */
export const DataObserverContext = React.createContext(initialState);
/**
 * Makes the component re-render when `Data` changes.
 * @public
 */
export function useObserveData() {
    React.useContext(DataObserverContext);
}
/**
 * @deprecated
 * @internal
 */
export class DataObserver extends React.Component {
    observers = [];
    state = initialState;
    taskAdded = false;
    frameTask = () => {
        this.setState({ update: this.state.update + 1 });
        this.taskAdded = false; // Set after updating state, else the component might become unresponsive
    };
    observer = () => {
        if (this.taskAdded)
            return;
        this.taskAdded = true;
        MainLoop.addFrameTask(this.frameTask);
    };
    componentWillUnmount() {
        this.observers.map(cancel => cancel());
        Data.reset();
    }
    render() {
        const { children } = this.props;
        this.observers.map(cancel => cancel());
        this.observers = [];
        Data._stores.forEach((d) => {
            const observer = Data.addObserver(d, this.observer);
            this.observers.push(observer);
        });
        return React.createElement(DataObserverContext.Provider, { value: { ...this.state } }, children);
    }
}
//# sourceMappingURL=DataObserver.js.map