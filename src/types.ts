export interface RssFeed {
  description: string;
  image: string;
  items: RssItem[];
  title: string;
  url: string;
}

export interface RssItem {
  created: number;
  description: string;
  link: string;
  title: string;
  url: string;
}

export interface RssOptions {
  feedUrl: string;
}

export const defaults: RssOptions = {
  feedUrl: '',
};

export interface ResItem {
  chain: number;
  groupKey: string;
  hashKey: string;
  lat: number;
  lng: number;
  timestamp: string;
}
