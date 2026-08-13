import { makeAutoObservable } from "mobx";

export class PanelStore {
    collapsed = false;

    constructor() {
        makeAutoObservable(this);
    }

    toggleCollapsed(): void {
        this.collapsed = !this.collapsed;
    }
}
