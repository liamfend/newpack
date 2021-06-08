import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Button } from 'antd';
import Svg from '~components/svg';
import { commissionCategories } from '~constants/commission';
import showElementByAuth from '~helpers/auth';
import { platformEntity, entityAction } from '~constants';

export default class CreateCommission extends React.Component {
  render() {
    const { t, commissionCategory } = this.props;

    return (
      <div className="property-commission__content">
        <div className="property-commission__commission-type">
          <span className="property-commission__type-label">
            { t('cms.property.commission.create.commission_type') }
          </span>
          <div className="property-commission__type-items">
            <For each="item" of={ commissionCategories } index="index">
              <div className="property-commission__type-card" key={ item } >
                <div
                  role="button"
                  tabIndex={ 0 }
                  onClick={ () => { this.props.oncommissionCategory(item); } }
                  className={ classNames('property-commission__type-item', {
                    'property-commission__type-item--check': commissionCategory === item,
                  }) }
                >
                  <Svg
                    className="property-commission__type-icon"
                    hash={ item.toLowerCase().replace('_', '-') }
                  />
                  <If condition={ commissionCategory === item }>
                    <span className="property-commission__type-tick">
                      <Svg hash="create-tick" className="property-commission__check-icon" />
                    </span>
                  </If>
                </div>
                <span className="property-commission__type-text" >
                  { t(`cms.property.commission.create.commission_type.${item.toLowerCase()}`) }
                </span>
              </div>
            </For>
          </div>
        </div>
        <If condition={ showElementByAuth(
          platformEntity.COMMISSION_COMISSION_TIERS,
          entityAction.CREATE,
        ) }
        >
          <div className="property-commission__create-btn">
            <Button
              type="primary"
              onClick={ this.props.createCommission }
              className="property-commission__btn"
            >
              { t('cms.property.commission.create.create_commission.btn') }
            </Button>
            <span className="property-commission__create-tips">
              { t('cms.property.commission.create.create_commission.tips') }
            </span>
          </div>
        </If>
      </div>
    );
  }
}

CreateCommission.propTypes = {
  t: PropTypes.func,
  commissionCategory: PropTypes.string,
  oncommissionCategory: PropTypes.func,
  createCommission: PropTypes.func,
};

CreateCommission.defaultProps = {
  t: () => {},
  commissionCategory: '',
  oncommissionCategory: () => {},
  createCommission: () => {},
};
