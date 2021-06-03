import React from 'react';
import svg from './svgs/logo.svg';
import PropTypes from 'prop-types';

function App(props) {
  return (
    <div>
      react app dsafds dsafdsa dsafdsaf dsafdsaf
      <img src={svg} />
      {props.children}
    </div>
  );
}

App.propTypes = {
  children: PropTypes.any,
};

export default App;
