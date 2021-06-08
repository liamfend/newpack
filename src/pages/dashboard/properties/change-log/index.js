import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { Spin, Tabs, Button } from 'antd';
import * as editActions from '~actions/properties/property-edit';
import { communicationStatus } from '~constants';
import generatePath from '~settings/routing';
import { formatCamelCase } from '~helpers/change-log';
import Svg from '~components/svg';
import Header from '~components/property-header';
import { isEmptyObject } from '~helpers/property-edit';

const { TabPane } = Tabs;

const mapStateToProps = (state) => {
  const propertyData = state.dashboard.propertyEdit.toJS();

  return {
    property: propertyData.payload,
    getPropertyStatus: propertyData.communication.getDetail.status,
  };
};

const mapDispatchToProps = dispatch => ({
  getPropertyDetail: (id, successCallback) => {
    dispatch(editActions.getPropertyDetail(id, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
@withTranslation()
export default class ChangeLog extends React.Component {
  constructor() {
    super();
    this.changeLogTabs = [
      'listing_management',
      'commission_management',
      'contract_record',
      'policy_setting',
      'deposit_and_fees',
    ];
  }

  componentDidMount() {
    this.props.getPropertyDetail(decodeURIComponent(this.props.match.params.propertySlug), () => {
      if (isEmptyObject(this.props.property)) {
        this.props.history.push(generatePath('properties', {}));
      }
    });
  }

  redirectToChangeLogTabPage = (tab) => {
    const camelCaseTab = formatCamelCase(tab);
    return generatePath(`property.changeLog.${camelCaseTab}`, {
      propertySlug: this.props.match.params.propertySlug,
    });
  };

  render() {
    const { t, property, getPropertyStatus } = this.props;
    return (
      <div className="property-change-log">
        <Choose>
          <When condition={ getPropertyStatus !== communicationStatus.IDLE }>
            <div className="property-change-log__loading">
              <Spin />
            </div>
          </When>
          <Otherwise>
            <Header t={ t } property={ property } type="change-log" />
            <div className="property-change-log__tabs-wrap">
              <Svg className="property-change-log__coming-soon-tag" hash="coming-soon-tag" />
              <Tabs defaultActiveKey="0">
                <For index="index" each="tab" of={ this.changeLogTabs }>
                  <TabPane
                    key={ index }
                    tab={ t(`cms.change_log.${tab}.tab_name`) }
                    disabled={ index > 0 }
                  >
                    <div className="property-change-log__container">
                      <Svg className="property-change-log__icon" hash={ tab.replace(/_/g, '-') } />
                      <div className="property-change-log__content-wrap">
                        <div className="property-change-log__title">
                          { t(`cms.change_log.${tab}.tab_name`) }
                        </div>
                        <div className="property-change-log__description">
                          { t(`cms.change_log.${tab}.description`) }
                        </div>
                        <Link to={ this.redirectToChangeLogTabPage(tab) }>
                          <Button
                            type="primary"
                            className="property-change-log__go-to-check"
                          >
                            { t('cms.change_log.go_to_check.button') }
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </TabPane>
                </For>
              </Tabs>
            </div>
          </Otherwise>
        </Choose>
      </div>
    );
  }
}

ChangeLog.propTypes = {
  property: PropTypes.object,
  t: PropTypes.func.isRequired,
  getPropertyDetail: PropTypes.func.isRequired,
  getPropertyStatus: PropTypes.string,
  history: PropTypes.object,
  match: PropTypes.object,
};

ChangeLog.defaultProps = {
  property: {},
  t: () => {},
  getPropertyDetail: () => {},
  getPropertyStatus: '',
  history: {},
  match: {},
};
