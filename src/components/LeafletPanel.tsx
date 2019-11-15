import React, { PureComponent } from "react";
import { PanelProps } from "@grafana/ui";
import L, {
  Map,
  FeatureGroup,
  CircleMarker,
  Polyline,
  TileLayer,
  Control,
  LayerGroup
} from "leaflet";
import { point, featureCollection, Point, Feature } from "@turf/helpers";
import nearestPoint, { NearestPoint } from "@turf/nearest-point";
import PathFinder from "geojson-path-finder";
import { MapOptions } from "../types";
import "leaflet/dist/leaflet.css";

interface Props extends PanelProps<MapOptions> {}

interface MapState {
  options: string[];
  current_user: string;
}

export class LeafletPanel extends PureComponent<Props, MapState> {
  map: Map;
  traces: FeatureGroup;
  topology_traces: FeatureGroup;
  closest_traces: FeatureGroup;
  data_per_user: { [key: string]: [number, number][] };
  layerControl: Control.Layers;
  groundFloorLayer: TileLayer;
  markersLayer: LayerGroup<CircleMarker>;
  state = {
    options: [],
    current_user: null
  };

  componentDidMount() {
    const { fields } = this.props.data.series[0];

    const openStreetMap = L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
      {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        maxNativeZoom: 19,
        maxZoom: 30
      }
    );

    const floorLayers: { [name: string]: TileLayer } = {};

    for (let i = 1; i <= this.props.options.total_floors; i++) {
      floorLayers[`Floor ${i - 1}`] = L.tileLayer(
        `http://ec2-18-188-248-182.us-east-2.compute.amazonaws.com/hot${i -
          1}/{z}/{x}/{y}.png`,
        {
          maxNativeZoom: 30,
          maxZoom: 30
        }
      );
    }
    this.groundFloorLayer = floorLayers["Floor 0"];

    this.map = L.map("map", {
      preferCanvas: true,
      layers: [openStreetMap, this.groundFloorLayer]
    }).setView([fields[1].values.buffer[0], fields[2].values.buffer[0]], 20);

    const markers: CircleMarker[] = [];
    const data_per_mac: { [key: string]: [number, number][] } = {};
    for (let i = 0; i < this.props.data.series[0].length; i++) {
      markers.push(
        L.circleMarker(
          [fields[1].values.buffer[i], fields[2].values.buffer[i]],
          {
            radius: 3,
            renderer: L.canvas()
          }
        ).bindPopup(`${fields[0].values.buffer[i]}`)
      );

      (data_per_mac[fields[0].values.buffer[i]] =
        data_per_mac[fields[0].values.buffer[i]] || []).push([
        fields[1].values.buffer[i],
        fields[2].values.buffer[i]
      ]);
    }

    this.markersLayer = L.layerGroup(markers);

    this.layerControl = L.control
      .layers(floorLayers, { Marker: this.markersLayer })
      .addTo(this.map);

    this.setState({ options: Object.keys(data_per_mac) });

    this.data_per_user = data_per_mac;
  }

  componentDidUpdate({ data, options }, { current_user }) {
    if (data.series[0] != this.props.data.series[0]) {
      const { fields } = this.props.data.series[0];

      if (this.markersLayer) {
        this.layerControl.removeLayer(this.markersLayer);
      }

      const markers: CircleMarker[] = [];
      const data_per_mac: { [key: string]: [number, number][] } = {};
      for (let i = 0; i < this.props.data.series[0].length; i++) {
        markers.push(
          L.circleMarker(
            [fields[1].values.buffer[i], fields[2].values.buffer[i]],
            {
              radius: 3,
              renderer: L.canvas()
            }
          ).bindPopup(`${fields[0].values.buffer[i]}`)
        );

        (data_per_mac[fields[0].values.buffer[i]] =
          data_per_mac[fields[0].values.buffer[i]] || []).push([
          fields[1].values.buffer[i],
          fields[2].values.buffer[i]
        ]);
      }

      this.markersLayer = L.layerGroup(markers);
      this.layerControl.addOverlay(this.markersLayer, "Marker");

      this.setState({ options: Object.keys(data_per_mac) });
      this.data_per_user = data_per_mac;
    }

    if (options.total_floors != this.props.options.total_floors) {
      if (this.layerControl) {
        this.map.removeControl(this.layerControl);
      }

      if (this.groundFloorLayer) {
        this.map.removeLayer(this.groundFloorLayer);
      }

      const floorLayers: { [name: string]: TileLayer } = {};

      for (let i = 1; i <= this.props.options.total_floors; i++) {
        floorLayers[`Floor ${i - 1}`] = L.tileLayer(
          `http://ec2-18-188-248-182.us-east-2.compute.amazonaws.com/hot${i -
            1}/{z}/{x}/{y}.png`,
          {
            maxNativeZoom: 30,
            maxZoom: 30
          }
        );
      }
      this.groundFloorLayer = floorLayers["Floor 0"].addTo(this.map);

      this.layerControl = L.control
        .layers(floorLayers, { Marker: this.markersLayer })
        .addTo(this.map);
    }

    if (current_user != this.state.current_user) {
      if (this.traces) {
        this.map.removeLayer(this.traces);
      }

      if (this.topology_traces) {
        this.map.removeLayer(this.topology_traces);
      }

      if (this.closest_traces) {
        this.map.removeLayer(this.closest_traces);
      }

      if (this.state.current_user != "None") {
        const trace_data = this.data_per_user[this.state.current_user];

        const markers_lines: (CircleMarker | Polyline)[] = [];

        markers_lines.push(
          L.circleMarker(trace_data[0], {
            radius: 3,
            renderer: L.canvas()
          })
        );
        for (let i = 0; i < trace_data.length - 1; i++) {
          markers_lines.push(
            L.polyline([trace_data[i], trace_data[i + 1]], {
              renderer: L.canvas()
            })
          );
          markers_lines.push(
            L.circleMarker(trace_data[i + 1], {
              radius: 3,
              renderer: L.canvas()
            })
          );
        }

        if (options.topology) {
          const closest_data: NearestPoint[] = [];
          const topology_nodes = featureCollection<Point>(
            options.topology.features.filter(
              (element: Feature) => element.geometry.type == "Point"
            )
          );
          trace_data.map(location => {
            closest_data.push(nearestPoint(point(location), topology_nodes));
          });

          const closest_markers: CircleMarker[] = [];
          closest_data.map(single => {
            closest_markers.push(
              L.circleMarker(single.geometry.coordinates as [number, number], {
                color: "red",
                radius: 4,
                renderer: L.canvas()
              })
            );
          });
          this.closest_traces = L.featureGroup(closest_markers).addTo(this.map);

          const pathFinder = new PathFinder(options.topology);
          if (closest_data.length > 1) {
            const path_finding: [number, number][] = [];
            const first_path = pathFinder.findPath(
              closest_data[0],
              closest_data[1]
            );
            //console.log('first_path ', first_path);
            path_finding.push(...(first_path || { path: [] }).path);
            for (let i = 1; i < closest_data.length - 1; i++) {
              const path_result = (
                pathFinder.findPath(closest_data[i], closest_data[i + 1]) || {
                  path: []
                }
              ).path;
              //console.log('index ', i);
              //console.log('result', path_result);
              if (path_result.length == 1) {
                path_finding.push(path_result[0]);
              } else if (path_result.length > 1) {
                path_finding.push(...path_result.slice(1));
              }
            }
            //console.log('path here', path_finding);
            const topology_markers_lines: (CircleMarker | Polyline)[] = [];
            if (path_finding.length != 0) {
              topology_markers_lines.push(
                L.circleMarker(path_finding[0], {
                  color: "yellow",
                  radius: 3,
                  renderer: L.canvas()
                })
              );
              for (let i = 0; i < path_finding.length - 1; i++) {
                topology_markers_lines.push(
                  L.polyline([path_finding[i], path_finding[i + 1]], {
                    color: "yellow",
                    renderer: L.canvas()
                  })
                );

                topology_markers_lines.push(
                  L.circleMarker(path_finding[i + 1], {
                    color: "yellow",
                    radius: 3,
                    renderer: L.canvas()
                  })
                );
              }
              this.topology_traces = L.featureGroup(
                topology_markers_lines
              ).addTo(this.map);
            }
          }

          this.traces = L.featureGroup(markers_lines).addTo(this.map);
        }
      }
    }
  }

  handleSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ ...this.state, current_user: e.target.value });
  };

  render() {
    const { options, current_user } = this.state;

    return (
      <div style={{ width: "100%", height: "100%" }}>
        {!this.props.options.onlyMap && (
          <div style={{ padding: 20 }}>
            <div>Select user: </div>
            <select
              id="selector"
              onChange={this.handleSelector}
              value={current_user}
              style={{ width: 500 }}
            >
              <option value="None">None</option>
              {options.map(opt => {
                return (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                );
              })}
            </select>
          </div>
        )}
        <div
          id="map"
          style={{
            width: "100%",
            height: this.props.options.onlyMap ? "100%" : "85%"
          }}
        ></div>
      </div>
    );
  }
}
