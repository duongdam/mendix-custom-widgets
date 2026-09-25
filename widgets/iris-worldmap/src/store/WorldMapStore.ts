import { makeAutoObservable } from "mobx";
import { RegionConnection, Region } from "../types/WorldMapTypes";

// Hover, tooltip and pan/zoom state all live inside AG Charts itself now — this store only holds
// the business data fed into chart options and the Mendix-facing selection.
export class WorldMapStore {
    regions: Region[] = [];
    connections: RegionConnection[] = [];
    selectedRegionId: string | undefined = undefined;

    constructor() {
        makeAutoObservable(this);
    }

    get selectedRegion(): Region | undefined {
        return this.regions.find(region => region.id === this.selectedRegionId);
    }

    setRegions(regions: Region[]): void {
        this.regions = regions;
    }

    setConnections(connections: RegionConnection[]): void {
        this.connections = connections;
    }

    setSelectedRegion(regionId: string | undefined): void {
        this.selectedRegionId = regionId;
    }
}
