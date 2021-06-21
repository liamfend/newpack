import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import classNames from 'classnames';
import { sectionPropertyState } from '~constants/listing-management';

export default class NavigationOption extends React.Component {
  render() {
    const { text, sectionState, isSelected } = this.props;
    return (
      <li
        className={ classNames('navigation-bar__option', {
          'navigation-bar__option--selected': isSelected,
        }) }
        role="presentation"
        onClick={ this.props.handleSelectOption }
      >
        <span>{ text }</span>
        <Choose>
          <When condition={ sectionState === sectionPropertyState.FILLED }>
            <Icon
              type="check-circle"
              theme="filled"
              style={ {
                width: '16px',
                height: '16px',
                color: '#38b2a6',
              } }
            />
          </When>
          <When condition={ sectionState === sectionPropertyState.NOT_FILLED }>
            <Icon
              type="check-circle"
              theme="filled"
              style={ {
                width: '16px',
                height: '16px',
                color: '#c8c9cb',
              } }
            />
          </When>
          <When condition={ sectionState === sectionPropertyState.NOT_SUFFICIENT }>
            <Icon
              type="exclamation-circle"
              theme="filled"
              style={ {
                width: '16px',
                height: '16px',
                color: '#faad14',
              } }
            />
          </When>
        </Choose>
      </li>
    );
  }
}

NavigationOption.propTypes = {
  sectionState: PropTypes.string,
  text: PropTypes.string,
  isSelected: PropTypes.bool,
  handleSelectOption: PropTypes.func,
};

NavigationOption.defaultProps = {
  sectionState: '',
  text: '',
  isSelected: false,
  handleSelectOption: () => {},
};
