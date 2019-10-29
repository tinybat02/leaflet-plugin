import React, { Component } from 'react';
import '../styles/Dropzone.css';

interface Props {
  disabled: boolean;
  onFilesAdded: (files: File[]) => void;
}

interface State {
  highlight: boolean;
}

export default class Dropzone extends Component<Props, State> {
  fileInputRef = React.createRef<HTMLInputElement>();

  state = {
    highlight: false,
  };

  openFileDialog = () => {
    if (this.props.disabled) return;
    this.fileInputRef.current.click();
  };

  onFilesAdded = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (this.props.disabled) return;
    const files = e.target.files;
    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files);
      this.props.onFilesAdded(array);
    }
  };

  onDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();

    if (this.props.disabled) return;

    this.setState({ highlight: true });
  };

  onDragLeave = (): void => {
    this.setState({ highlight: false });
  };

  onDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    if (this.props.disabled) return;

    const files = e.dataTransfer.files;

    if (this.props.onFilesAdded) {
      const array = this.fileListToArray(files);
      this.props.onFilesAdded(array);
    }
    this.setState({ highlight: false });
  };

  fileListToArray = (list: FileList): File[] => {
    const array = [];
    for (var i = 0; i < list.length; i++) {
      array.push(list.item(i));
    }
    return array;
  };

  render() {
    return (
      <div
        className={`dropzone ${this.state.highlight ? 'highlight' : ''}`}
        onDragOver={this.onDragOver}
        onDragLeave={this.onDragLeave}
        onDrop={this.onDrop}
        onClick={this.openFileDialog}
        style={{ cursor: this.props.disabled ? 'default' : 'pointer' }}
      >
        <input
          ref={this.fileInputRef}
          className="file-input"
          type="file"
          multiple
          onChange={this.onFilesAdded}
        />
        <div className="dropzone-area">
          <span>Upload File</span>
        </div>
      </div>
    );
  }
}
