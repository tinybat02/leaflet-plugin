import { GeoJSONObject } from '@turf/helpers';
export interface MapOptions {
  topology: GeoJSONObject;
  polygon: GeoJSONObject;
}

export const defaults: MapOptions = {
  topology: null,
  polygon: null,
};
