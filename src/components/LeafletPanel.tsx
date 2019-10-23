import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/ui';
import L, { Map, FeatureGroup, CircleMarker, Polyline } from 'leaflet';
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
function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export class LeafletPanel extends PureComponent<PanelProps> {
  map: Map;
  //markers: FeatureGroup;
  traces: FeatureGroup;
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

    const data_per_mac: { string: number[] } = records.reduce((obj, item) => {
      (obj[item[0]] = obj[item[0]] || []).push([item[1], item[2]]);
      return obj;
    }, {});
    const limit3_data_per_mac = {};
    Object.keys(data_per_mac).forEach(key => {
      limit3_data_per_mac[key] = data_per_mac[key].slice(-3);
    });
    const markers_lines: (CircleMarker | Polyline)[] = [];
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
    this.traces = L.featureGroup(markers_lines).addTo(this.map);
  }

  componentDidUpdate({ data }) {
    if (data.series[0].rows != this.props.data.series[0].rows) {
      if (this.traces) {
        this.map.removeLayer(this.traces);
      }
      const records = this.props.data.series[0].rows;
      const data_per_mac: { string: number[] } = records.reduce((obj, item) => {
        (obj[item[0]] = obj[item[0]] || []).push([item[1], item[2]]);
        return obj;
      }, {});
      const limit3_data_per_mac = {};
      Object.keys(data_per_mac).forEach(key => {
        limit3_data_per_mac[key] = data_per_mac[key].slice(-3);
      });
      const markers_lines: (CircleMarker | Polyline)[] = [];
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
      this.traces = L.featureGroup(markers_lines).addTo(this.map);
    }
  }

  render() {
    console.log('test newest');
    return <div id="map" style={{ width: '100%', height: '100%' }}></div>;
  }
}
