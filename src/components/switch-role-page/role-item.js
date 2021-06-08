import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Svg from '~components/svg';

export default class RoleItem extends React.PureComponent {
  render() {
    const { hash, role, t, isSelected } = this.props;
    return (
      <div
        className={ classNames('role-item', {
          'role-item--selected': isSelected,
        }) }
        role="presentation"
        onClick={ this.props.handleSelectRole }
      >
        <Svg className="role-item__icon-role" hash={ hash } />
        <div className="role-item__label">
          { t(`cms.switch_role_modal.role.${role.role}`) }
        </div>
        <If condition={ isSelected }>
          <span className="role-item__icon-selected-wrapper">
            <Svg className="role-item__icon-selected" hash="tick-correct" />
          </span>
        </If>
      </div>
    );
  }
}

RoleItem.propTypes = {
  hash: PropTypes.string.isRequired,
  isSelected: PropTypes.bool.isRequired,
  role: PropTypes.shape({
    role: PropTypes.string.isRequired,
    scopes: PropTypes.array.isRequired,
  }).isRequired,
  t: PropTypes.func.isRequired,
  handleSelectRole: PropTypes.func.isRequired,
};

RoleItem.defaultProps = {
  hash: '',
  isSelected: false,
  role: {
    role: '',
    scopes: [],
  },
  t: () => {},
  handleSelectRole: () => {},
};
