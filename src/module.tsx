import { PanelPlugin } from '@grafana/ui';
import LeafletPanel from './components/LeafletPanel';
import { MapPanelEditor } from './components/PanelEditor';
import { defaults, MapOptions } from './types';

export const plugin = new PanelPlugin<MapOptions>(LeafletPanel);

plugin.setEditor(MapPanelEditor);
plugin.setDefaults(defaults);
