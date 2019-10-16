import React, { PureComponent } from 'react';
import { PanelProps } from '@grafana/ui';
import L, { Map, FeatureGroup, CircleMarker } from 'leaflet';
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

export class LeafletPanel extends PureComponent<PanelProps> {
  map: Map;
  markers: FeatureGroup;

  componentDidMount() {
    const { series } = this.props.data;
    this.map = L.map('map').setView(
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
  }

  render() {
    return <div id="map" style={{ width: '100%', height: '100%' }}></div>;
  }
}
