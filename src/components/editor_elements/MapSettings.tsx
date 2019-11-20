import React, { useState } from "react";
import { PropsOptions } from "../../types";
import "../styles/MapSettings.css";

const MapSettings: React.FC<PropsOptions> = ({ options, onOptionsChange }) => {
  const [totalFloors, setTotal] = useState<number>(options.total_floors);

  const handleRemove = (type: string) => () => {
    onOptionsChange({
      ...options,
      [type]: null
    });
  };

  const handleInputTotalFloors = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTotal(parseInt(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (totalFloors >= 1) {
      onOptionsChange({
        ...options,
        total_floors: totalFloors
      });
    } else {
      setTotal(options.total_floors);
    }
  };

  const handleOnlyMap = () => {
    if (!options.onlyMap) {
      onOptionsChange({
        ...options,
        onlyMap: !options.onlyMap,
        heatMap: false
      });
    } else {
      onOptionsChange({
        ...options,
        onlyMap: !options.onlyMap
      });
    }
  };

  const handleHeatMap = () => {
    if (!options.heatMap) {
      onOptionsChange({
        ...options,
        onlyMap: false,
        heatMap: !options.heatMap
      });
    } else {
      onOptionsChange({
        ...options,
        heatMap: !options.heatMap
      });
    }
  };

  return (
    <div className="editor-row">
      <div className="section gf-form-group">
        <h5 className="section-heading">Map & Floor Control</h5>
        <form onSubmit={handleSubmit}>
          <div className="gf-form">
            <label className="gf-form-label width-8">Floors Total No.</label>
            <input
              type="number"
              value={totalFloors}
              onInput={handleInputTotalFloors}
              className="gf-form-input max-width-4 ng-pristine ng-valid ng-not-empty ng-touched"
            />
          </div>
        </form>
        <div className="gf-form" style={{ marginTop: 10 }}>
          <label className="gf-form-label width-8">Circle Markers</label>
          <div className="gf-form-switch" onClick={handleOnlyMap}>
            <input type="checkbox" checked={options.onlyMap} />
            <span className="gf-form-switch__slider"></span>
          </div>
        </div>
        <div className="gf-form">
          <label className="gf-form-label width-8">Heat Map</label>
          <div className="gf-form-switch" onClick={handleHeatMap}>
            <input type="checkbox" checked={options.heatMap} />
            <span className="gf-form-switch__slider"></span>
          </div>
        </div>
      </div>

      <div className="section gf-form-group">
        <h5 className="section-heading">Topology & Polygon</h5>

        <div className="gf-form">
          <label className="gf-form-label width-8">Topology</label>
          <div className="setting-circle-wrapper">
            <div
              className="settings-circle"
              style={{ background: options.topology ? "#32c132" : "#666" }}
            />
          </div>
          {options.topology && (
            <button
              className="btn btn-small btn-outline-primary"
              style={{ marginTop: 7 }}
              onClick={handleRemove("topology")}
            >
              Remove
            </button>
          )}
        </div>
        <div className="gf-form">
          <label className="gf-form-label width-8">Polygon</label>
          <div className="setting-circle-wrapper">
            <div
              className="settings-circle"
              style={{ background: options.polygon ? "#32c132" : "#666" }}
            />
          </div>
          {options.polygon && (
            <button
              className="btn btn-small btn-outline-primary"
              style={{ marginTop: 7 }}
              onClick={handleRemove("polygon")}
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapSettings;
