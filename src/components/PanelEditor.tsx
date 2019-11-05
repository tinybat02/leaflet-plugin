import React, { PureComponent } from 'react';
import { PanelOptionsGroup, PanelEditorProps } from '@grafana/ui';
import { MapOptions } from '../types';
import Dropzone from './editor_elements/Dropzone';
import './styles/PanelEditor.css';

interface State {
  topology: File;
  polygon: File;
  existingTopology: object;
  existingPolygon: object;
  files: File[];
  uploaded: boolean;
  processing: boolean;
}

export class MapPanelEditor extends PureComponent<
  PanelEditorProps<MapOptions>,
  State
> {
  state = {
    topology: null,
    polygon: null,
    existingTopology: this.props.options.topology,
    existingPolygon: this.props.options.polygon,
    files: [],
    uploaded: false,
    processing: false,
  };

  onFilesAdded = (files: File[]): void => {
    this.setState(prevState => ({
      files: [...prevState.files, ...files],
    }));
  };

  handleSubmit = () => {
    if (this.state.topology) {
      const reader = new FileReader();
      const that = this;
      reader.onloadend = function() {
        const obj = JSON.parse(reader.result as string);
        that.props.onOptionsChange({
          ...that.props.options,
          topology: obj,
        });
      };
      reader.readAsText(this.state.topology);
    }

    if (this.state.polygon) {
      const reader = new FileReader();
      const that = this;
      reader.onloadend = function() {
        const obj = JSON.parse(reader.result as string);
        that.props.onOptionsChange({
          ...that.props.options,
          polygon: obj,
        });
      };
      reader.readAsText(this.state.polygon);
    }
  };

  handleTopologySelect = (file: File) => () => {
    if ((this.state.polygon || { name: '' }).name === file.name) {
      this.setState({ polygon: null });
    }

    if ((this.state.topology || { name: '' }).name === file.name) {
      this.setState({ topology: null });
    } else {
      this.setState({ topology: file });
    }
  };

  handlePolygonSelect = (file: File) => () => {
    if ((this.state.topology || { name: '' }).name === file.name) {
      this.setState({ topology: null });
    }

    if ((this.state.polygon || { name: '' }).name === file.name) {
      this.setState({ polygon: null });
    } else {
      this.setState({ polygon: file });
    }
  };

  render() {
    return (
      <>
        <PanelOptionsGroup title="Map Configuration">
          <div className="upload">
            <div className="upload-content">
              <div className="upload-drop-area">
                <p className="upload-title">Upload Json File</p>
                <Dropzone
                  onFilesAdded={this.onFilesAdded}
                  disabled={this.state.uploaded}
                />
              </div>
              <div className="upload-actions">
                <div className="upload-file-info">
                  <div>
                    {this.state.files.map((file, i) => {
                      return (
                        <div key={i} className="upload-filerow">
                          <span className="upload-filename">{file.name}</span>

                          <div className="upload-file-selections">
                            <input
                              type="radio"
                              onChange={this.handleTopologySelect(file)}
                              checked={
                                this.state.topology
                                  ? this.state.topology.name === file.name
                                  : false
                              }
                            />
                            <label className="checkbox-label">Topology</label>
                            <input
                              type="radio"
                              onChange={this.handlePolygonSelect(file)}
                              checked={
                                this.state.polygon
                                  ? this.state.polygon.name === file.name
                                  : false
                              }
                            />
                            <label className="checkbox-label">Polygon</label>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="submit-button">
                    {(this.state.topology || this.state.polygon) && (
                      <button
                        className="btn btn-outline-primary"
                        onClick={this.handleSubmit}
                      >
                        Submit
                      </button>
                    )}
                  </div>
                </div>
                <div className="map-settings"></div>
              </div>
            </div>
          </div>
        </PanelOptionsGroup>
      </>
    );
  }
}
