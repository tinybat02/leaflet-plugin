import React, { PureComponent } from 'react';
import {
  /* FormField, */ PanelOptionsGroup,
  PanelEditorProps,
} from '@grafana/ui';
//import Upload from './editor_elements/Upload';
import { RssOptions } from '../types';
import Dropzone from './editor_elements/Dropzone';
import './styles/PanelEditor.css';

/* interface State {
  feedUrl: string;
} */
interface State {
  polygons: [number, number][][];
  files: File[];
  uploaded: boolean;
  processing: boolean;
}
/* interface MapOptions {
  polygons: [number, number][] []
} */

export class MapPanelEditor extends PureComponent<
  PanelEditorProps<RssOptions>,
  State
> {
  /* constructor(props) {
    super(props);

    this.state = {
      feedUrl: props.options.feedUrl,
      polygons: [],
    };
  } */
  state = {
    polygons: [],
    files: [],
    uploaded: false,
    processing: false,
  };

  onFilesAdded = (files: File[]): void => {
    this.setState(prevState => ({
      files: [...prevState.files, ...files],
    }));
  };
  /* onUpdatePanel = () =>
    this.props.onOptionsChange({
      ...this.props.options,
      feedUrl: this.state.feedUrl,
    }); */

  //onFeedUrlChange = ({ target }) => this.setState({ feedUrl: target.value });

  render() {
    //const { feedUrl } = this.state;
    //const { polygons } = this.state;
    console.log(this.state.files);
    return (
      <>
        <PanelOptionsGroup title="Custom Map">
          <div className="panel-content">
            <div className="upload">
              <span className="upload-title">Upload Json File</span>
              <div className="upload-content">
                <div>
                  <Dropzone
                    onFilesAdded={this.onFilesAdded}
                    disabled={this.state.uploaded}
                  />
                </div>
              </div>
              <div className="upload-actions">
                {this.state.files.map((file, i) => {
                  return (
                    <div key={i} className="upload-filerow">
                      <span className="upload-filename">{file.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </PanelOptionsGroup>
      </>
    );
  }
}

{
  /* <div className="gf-form">
            <FormField
              label="Feed url"
              labelWidth={6}
              inputWidth={25}
              value={feedUrl}
              onChange={this.onFeedUrlChange}
              onBlur={this.onUpdatePanel}
            />
          </div> */
}
