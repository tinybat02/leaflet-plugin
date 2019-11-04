import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/ui';
import L, { Map, FeatureGroup, CircleMarker, Polyline } from 'leaflet';
import { point } from '@turf/helpers';
import nearestPoint, { NearestPoint } from '@turf/nearest-point';
import PathFinder from 'geojson-path-finder';
import atlantis_nodes from '../geojson/atlantis_nodes.js';
import atlantis_network from '../geojson/atlantis_network.js';
import { MapOptions } from '../types';

import 'leaflet/dist/leaflet.css';
/* import 'leaflet/dist/images/layers.png';
import 'leaflet/dist/images/layers-2x.png';
import 'leaflet/dist/images/marker-icon.png';
import 'leaflet/dist/images/marker-icon-2x.png';
import 'leaflet/dist/images/marker-shadow.png'; */
/* delete L.Icon.Default.prototype._getIconUrl;

const iconRetinaUrl = require('leaflet/dist/images/marker-icon-2x.png');
const iconUrl = require('leaflet/dist/images/marker-icon.png');
const shadowUrl = require('leaflet/dist/images/marker-shadow.png');

L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl }); */

/* function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
} */
interface Props extends PanelProps<MapOptions> {}

interface MapState {
  options: string[];
  current_user: string;
}

export class LeafletPanel extends PureComponent<Props, MapState> {
  map: Map;
  //markers: FeatureGroup;
  traces: FeatureGroup;
  topology_traces: FeatureGroup;
  closest_traces: FeatureGroup;
  data_per_user: { [key: string]: [number, number][] };
  //selector: Control;
  state = {
    options: [],
    current_user: null,
  };
  /* componentDidMount() {
    const { series } = this.props.data;
    this.map = L.map('map', { preferCanvas: true }).setView(
      [series[0].rows[0][0], series[1].rows[0][0]],
      18
    );
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxNativeZoom: 18,
      maxZoom: 30,
    }).addTo(this.map);
    L.tileLayer(
      'http://ec2-18-188-248-182.us-east-2.compute.amazonaws.com/hot0/{z}/{x}/{y}.png',
      {
        maxNativeZoom: 30,
        maxZoom: 30,
      }
    ).addTo(this.map);
    const marker_data: CircleMarker[] = [];
    for (let i = 0; i < series[0].rows.length; i++) {
      marker_data.push(
        L.circleMarker([series[0].rows[i][0], series[1].rows[i][0]], {
          radius: 3,
          renderer: L.canvas(),
        })
      );
    }
    this.markers = L.featureGroup(marker_data).addTo(this.map);
  } */

  componentDidMount() {
    const records = this.props.data.series[0].rows;
    this.map = L.map('map', { preferCanvas: true }).setView(
      [records[0][1], records[0][2]],
      18
    );
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      maxNativeZoom: 18,
      maxZoom: 30,
    }).addTo(this.map);
    L.tileLayer(
      'http://ec2-18-188-248-182.us-east-2.compute.amazonaws.com/hot0/{z}/{x}/{y}.png',
      {
        maxNativeZoom: 30,
        maxZoom: 30,
      }
    ).addTo(this.map);

    const data_per_mac: { [key: string]: [number, number][] } = records.reduce(
      (obj, item) => {
        (obj[item[0]] = obj[item[0]] || []).push([item[1], item[2]]);
        return obj;
      },
      {}
    );
    const limit3_data_per_mac = {};
    Object.keys(data_per_mac).forEach(key => {
      limit3_data_per_mac[key] = data_per_mac[key].slice(-3);
    });

    this.setState({
      ...this.state,
      options: Object.keys(limit3_data_per_mac),
    });
    this.data_per_user = limit3_data_per_mac;
    /* this.selector = L.control.attribution({position: 'topright'});
    this.selector.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'userSelector');
      const option_content = Object.keys(limit3_data_per_mac).reduce((total, item) => {
        return total + `<option value=${item}>item</option>`
      },'')
      div.innerHTML=''
    } */

    /* const markers_lines: (CircleMarker | Polyline)[] = [];
    Object.keys(limit3_data_per_mac).forEach(key => {
      const color_per_mac = getRandomColor();
      markers_lines.push(
        L.circleMarker(limit3_data_per_mac[key][0], {
          color: color_per_mac,
          radius: 3,
          renderer: L.canvas(),
        }).bindPopup(`<h2>${key}</h2>`)
      );

      if (limit3_data_per_mac[key].length > 1) {
        for (let i = 1; i < limit3_data_per_mac[key].length; i++) {
          markers_lines.push(
            L.polyline(
              [limit3_data_per_mac[key][i - 1], limit3_data_per_mac[key][i]],
              {
                color: color_per_mac,
                renderer: L.canvas(),
              }
            ).bindPopup(`<h2>${key}</h2>`)
          );
          markers_lines.push(
            L.circleMarker(limit3_data_per_mac[key][i], {
              color: color_per_mac,
              radius: 3,
              renderer: L.canvas(),
            }).bindPopup(`<h2>${key}</h2>`)
          );
        }
      }
    });
    this.traces = L.featureGroup(markers_lines).addTo(this.map); */
  }

  componentDidUpdate({ data }, { current_user }) {
    if (data.series[0].rows.length != this.props.data.series[0].rows.length) {
      const records = this.props.data.series[0].rows;
      const data_per_mac: { string: number[] } = records.reduce((obj, item) => {
        (obj[item[0]] = obj[item[0]] || []).push([item[1], item[2]]);
        return obj;
      }, {});
      const limit3_data_per_mac = {};
      Object.keys(data_per_mac).forEach(key => {
        limit3_data_per_mac[key] = data_per_mac[key].slice(-3);
      });

      this.setState({
        ...this.state,
        options: Object.keys(limit3_data_per_mac),
      });

      this.data_per_user = limit3_data_per_mac;

      /* const markers_lines: (CircleMarker | Polyline)[] = [];
      Object.keys(limit3_data_per_mac).forEach(key => {
        const color_per_mac = getRandomColor();
        markers_lines.push(
          L.circleMarker(limit3_data_per_mac[key][0], {
            color: color_per_mac,
            radius: 3,
            renderer: L.canvas(),
          }).bindPopup(`<h2>${key}</h2>`)
        );

        if (limit3_data_per_mac[key].length > 1) {
          for (let i = 1; i < limit3_data_per_mac[key].length; i++) {
            markers_lines.push(
              L.polyline(
                [limit3_data_per_mac[key][i - 1], limit3_data_per_mac[key][i]],
                {
                  color: color_per_mac,
                  renderer: L.canvas(),
                }
              ).bindPopup(`<h2>${key}</h2>`)
            );
            markers_lines.push(
              L.circleMarker(limit3_data_per_mac[key][i], {
                color: color_per_mac,
                radius: 3,
                renderer: L.canvas(),
              }).bindPopup(`<h2>${key}</h2>`)
            );
          }
        }
      });
      this.traces = L.featureGroup(markers_lines).addTo(this.map); */
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

      if (this.state.current_user != 'None') {
        const trace_data = this.data_per_user[this.state.current_user];

        const closest_data: NearestPoint[] = [];
        trace_data.map(location => {
          closest_data.push(nearestPoint(point(location), atlantis_nodes));
        });
        console.log('closest ', closest_data);
        const markers_lines: (CircleMarker | Polyline)[] = [];

        markers_lines.push(
          L.circleMarker(trace_data[0], {
            radius: 3,
            renderer: L.canvas(),
          })
        );
        for (let i = 0; i < trace_data.length - 1; i++) {
          markers_lines.push(
            L.polyline([trace_data[i], trace_data[i + 1]], {
              renderer: L.canvas(),
            })
          );
          markers_lines.push(
            L.circleMarker(trace_data[i + 1], {
              radius: 3,
              renderer: L.canvas(),
            })
          );
        }

        const closest_markers: CircleMarker[] = [];
        closest_data.map(single => {
          closest_markers.push(
            L.circleMarker(single.geometry.coordinates as [number, number], {
              color: 'red',
              radius: 4,
              renderer: L.canvas(),
            })
          );
        });
        this.closest_traces = L.featureGroup(closest_markers).addTo(this.map);

        const pathFinder = new PathFinder(atlantis_network);
        if (closest_data.length > 1) {
          const path_finding: [number, number][] = [];
          const first_path = pathFinder.findPath(
            closest_data[0],
            closest_data[1]
          );
          console.log('first_path ', first_path);
          path_finding.push(...(first_path || { path: [] }).path);
          for (let i = 1; i < closest_data.length - 1; i++) {
            const path_result = (
              pathFinder.findPath(closest_data[i], closest_data[i + 1]) || {
                path: [],
              }
            ).path;
            console.log('index ', i);
            console.log('result', path_result);
            if (path_result.length == 1) {
              path_finding.push(path_result[0]);
            } else if (path_result.length > 1) {
              path_finding.push(...path_result.slice(1));
            }
          }
          console.log('path here', path_finding);
          const topology_markers_lines: (CircleMarker | Polyline)[] = [];
          if (path_finding.length != 0) {
            topology_markers_lines.push(
              L.circleMarker(path_finding[0], {
                color: 'yellow',
                radius: 3,
                renderer: L.canvas(),
              })
            );
            for (let i = 0; i < path_finding.length - 1; i++) {
              topology_markers_lines.push(
                L.polyline([path_finding[i], path_finding[i + 1]], {
                  color: 'yellow',
                  renderer: L.canvas(),
                })
              );

              topology_markers_lines.push(
                L.circleMarker(path_finding[i + 1], {
                  color: 'yellow',
                  radius: 3,
                  renderer: L.canvas(),
                })
              );
            }
            this.topology_traces = L.featureGroup(topology_markers_lines).addTo(
              this.map
            );
          }
        }
        /* const pathFinder = new PathFinder(atlantis_network);

        const markers_lines: (CircleMarker | Polyline)[] = [];
        markers_lines.push(
          L.circleMarker(
            closest_data[0].geometry.coordinates as [number, number],
            {
              radius: 3,
              renderer: L.canvas(),
            }
          )
        );
        if (closest_data.length > 1) {
          const finding_path: [number, number][] = [];
          
          for (let i = 0; i < closest_data.length - 1; i++) {
            const path_result = pathFinder.findPath(
              closest_data[i],
              closest_data[i + 1]
            );
            finding_path.push(...path_result.path.slice(1));
          }
          markers_lines.push(
            L.polyline(
              [
                closest_data[0].geometry.coordinates as [number, number],
                finding_path[0],
              ],
              { renderer: L.canvas() }
            )
          );
          for (let i = 0; i < finding_path.length - 1; i++) {
            markers_lines.push(
              L.polyline([finding_path[i], finding_path[i + 1]], {
                renderer: L.canvas(),
              })
            );
            markers_lines.push(
              L.circleMarker(finding_path[i + 1], {
                radius: 3,
                renderer: L.canvas(),
              })
            );
          }
        } */
        this.traces = L.featureGroup(markers_lines).addTo(this.map);
      }
    }
  }

  handleSelector = (e: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ ...this.state, current_user: e.target.value });
  };

  render() {
    const { options, current_user } = this.state;
    return (
      <div style={{ width: '100%', height: '100%' }}>
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
        <div id="map" style={{ width: '100%', height: '85%' }}></div>
      </div>
    );
  }
}
