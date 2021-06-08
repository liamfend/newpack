import React from 'react';
import SnakeGame from '~pages/dashboard/constructing/snake';

const Constructing = () => (
  <div className="not-available">
    <div className="not-available__title">Ooops, this page is under constuction....</div>
    <div className="not-available__summary">Take a break by playing a simple game below</div>
    <div className="not-available__games">
      <SnakeGame size={ 500 } />
    </div>
  </div>
);

export default Constructing;
