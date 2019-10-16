import React, { FunctionComponent } from 'react';
import { /* RssItem, */ ResItem } from '../types';

interface Props {
  //item: RssItem;
  item: ResItem;
}

export const RssFeedRow: FunctionComponent<Props> = ({ item }) => {
  return (
    <>
      <div style={{ display: 'flex', padding: '4px 0' }}>
        <div>{item.chain}</div>
        <div style={{ marginLeft: '16px' }}>{item.timestamp}</div>
      </div>
    </>
  );
};
