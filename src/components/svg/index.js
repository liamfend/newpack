import React from 'react';
import PropTypes from 'prop-types';
import svgManifest from '~assets-json/svg.json';

const Svg = props => (
  <svg className={ props.className } xmlns="http://www.w3.org/2000/svg" { ...props.attributes }>
    <use xlinkHref={ `/bundles/microapp-cms/images/sprites/${svgManifest.name}#${props.hash}` } />
  </svg>
);

Svg.propTypes = {
  className: PropTypes.string.isRequired,
  hash: PropTypes.string.isRequired,
  attributes: PropTypes.object,
  name: PropTypes.string,
};

Svg.defaultProps = {
  name: 'main',
  attributes: {},
};

export default Svg;
