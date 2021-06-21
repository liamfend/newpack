import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Breadcrumb, Icon, Row, Col, Tabs } from 'antd';
import classNames from 'classnames';
import { getItem } from '~base/global/helpers/storage';
import generatePath from '~settings/routing';
import { contractStatus, landlordDetailTabs } from '~constants/landlord';
import { platformEntity, entityAction } from '~constants';
import showElementByAuth, { isContentSpecialistRole, isLandlordRole } from '~helpers/auth';

const { TabPane } = Tabs;

export default class LandlordHeader extends React.Component {
  handleClickUploadContract = () => {
    this.props.history.push(generatePath('contract', {}));
    setTimeout(() => {
      this.props.setPreparedContract(this.props.landlord);
    }, 0);
  }

  render() {
    const { t, landlord } = this.props;
    return (
      <div className="landlord-header">
        <Breadcrumb>
          <Breadcrumb.Item>
            <a href={ generatePath('landlords', {}, getItem('cms_landlords_list_filters')) }>
              { t('cms.landlord.detail.landlord_list.breadcrumb') }
            </a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            { t('cms.landlord.detail.landlord_details.breadcrumb') }
          </Breadcrumb.Item>
        </Breadcrumb>
        <h2 className="landlord-header__name">{ landlord.name || '' }</h2>
        <div className="landlord-header__info-wrap">
          <Row gutter={ 16 }>
            <Col span={ 12 }>
              <div className="landlord-header__info">
                <label>{ t('cms.landlord.detail.active_attracted_contract.label') }</label>
                <Choose>
                  <When condition={ landlord.contractAttachedStatus === contractStatus.EXPIRED }>
                    <Icon type="close" style={ { color: '#63656a' } } />
                    <If condition={ showElementByAuth(
                      platformEntity.PROPERTIES_CONTRACTS,
                      entityAction.CREATE,
                    ) }
                    >
                      <button
                        className={ classNames('landlord-header__upload-contract', {
                          'landlord-header__upload-contract--disable': landlord.propertiesCount === 0,
                        }) }
                        disabled={ landlord.propertiesCount === 0 }
                        onClick={ this.handleClickUploadContract }
                      >
                        { t('cms.landlord.detail.go_to_upload.button') }
                      </button>
                    </If>
                  </When>
                  <When condition={ landlord.contractAttachedStatus === contractStatus.ACTIVE }>
                    <Icon type="check" style={ { color: '#419061' } } />
                  </When>
                  <When condition={ landlord.contractAttachedStatus === contractStatus.INACTIVE }>
                    <Icon type="check" style={ { color: '#f9a600' } } />
                  </When>
                </Choose>
              </div>
            </Col>
            <Col span={ 12 }>
              <div className="landlord-header__info">
                <label>{ t('cms.landlord.detail.create_time.label') }</label>
                { moment(landlord.createdAt).format('DD/MM/YYYY HH:mm') }
              </div>
            </Col>
          </Row>
          <Row gutter={ 16 }>
            <Col span={ 12 }>
              <div className="landlord-header__info">
                <label>{ t('cms.landlord.detail.property_quantity.label') }</label>
                { landlord.propertiesCount }
              </div>
            </Col>
            <Col span={ 12 }>
              <div className="landlord-header__info">
                <label>{ t('cms.landlord.detail.update_time.label') }</label>
                { moment(landlord.updatedAt).format('DD/MM/YYYY HH:mm') }
              </div>
            </Col>
          </Row>
        </div>
        <Tabs
          className="landlord-header__tab-wrap"
          onChange={ activeKey => this.props.handleSetActiveTab(activeKey) }
          animated={ false }
        >
          <For
            of={
              isContentSpecialistRole() ?
                Object.values(landlordDetailTabs).slice(0, 1) :
                Object.values(landlordDetailTabs)
            }
            each="tab"
            index="index"
          >
            <TabPane
              key={ tab }
              tab={ t(`cms.landlord.detail.${tab.toLowerCase()}.tab`) }
              disabled={ tab === landlordDetailTabs.CONTACT && isLandlordRole() }
            >
              { t(`cms.landlord.detail.${tab.toLowerCase()}.tab`) }
            </TabPane>
          </For>
        </Tabs>
      </div>
    );
  }
}

LandlordHeader.propTypes = {
  t: PropTypes.func.isRequired,
  landlord: PropTypes.object,
  handleSetActiveTab: PropTypes.func.isRequired,
  history: PropTypes.shape({
    push: PropTypes.func.isRequired,
  }),
  setPreparedContract: PropTypes.func.isRequired,
};

LandlordHeader.defaultProps = {
  t: () => {},
  landlord: {},
  handleSetActiveTab: () => {},
  history: {
    push: () => {},
  },
  setPreparedContract: () => {},
};
