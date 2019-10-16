import { PanelPlugin } from '@grafana/ui';
import { LeafletPanel } from './components/LeafletPanel';
import { MapPanelEditor } from './components/PanelEditor';
import { defaults, RssOptions } from './types';

export const plugin = new PanelPlugin<RssOptions>(LeafletPanel);

plugin.setEditor(MapPanelEditor);
plugin.setDefaults(defaults);
