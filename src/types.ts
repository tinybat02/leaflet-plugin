import { GeoJSONObject } from '@turf/helpers';
export interface MapOptions {
  total_floors: number;
  default_floor: number;
  zoom_level: number;
  max_zoom: number;
  topology: GeoJSONObject;
  polygon: GeoJSONObject;
  onlyMap: boolean;
  heatMap: boolean;
}

export const defaults: MapOptions = {
  total_floors: 1,
  default_floor: 0,
  zoom_level: 18,
  max_zoom: 20,
  topology: null,
  polygon: null,
  onlyMap: true,
  heatMap: false,
};

export interface PropsOptions {
  options: MapOptions;
  onOptionsChange: (options: MapOptions) => void;
}
