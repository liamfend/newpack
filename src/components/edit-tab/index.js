import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import { Tabs, Icon } from 'antd';
import { locationTabType } from '~constants';

const { TabPane } = Tabs;

export default class EditTab extends React.Component {
  constructor() {
    super();

    this.state = {
      activeKey: locationTabType.DETAILS,
    };
  }

  componentDidMount() {
    document.addEventListener('changeLocationTab', this.changeLocationTab);
    if (window.location.hash) {
      this.handleChangeTab(window.location.hash.replace('#', ''));
    }
  }

  componentWillUnMount() {
    document.removeEventListener('changeLocationTab', this.changeLocationTab);
  }

  changeLocationTab = (data) => {
    this.handleChangeTab(data.detail);
  }

  handleChangeTab = (activeKey) => {
    this.setState({ activeKey });
    this.props.onChange(activeKey);
  }

  getTabStatus = (tab) => {
    if (this.props.fields[tab]) {
      let hasError = false;
      const keys = Object.keys(this.props.fields[tab]);
      keys.map((key) => {
        if (!this.props.fields[tab][key].validate) {
          hasError = true;

          if (tab === 'seo') {
            if (
              ['srpIntroHeadline', 'srpIntroParagraph', 'metaDescription', 'metaKeywords', 'metaTitle'].indexOf(key) !== -1
              && this.props.fields[tab][`${key.concat('Enabled')}`]
              && this.props.fields[tab][`${key.concat('Enabled')}`].value
            ) {
              hasError = false;
            }
          }
        }

        return true;
      });

      return hasError;
    }
    return false;
  };

  render() {
    return (
      <div className={ classNames('edit-tab', this.props.className) }>
        <Tabs
          type="card"
          onTabClick={ this.handleChangeTab }
          activeKey={ this.state.activeKey }
        >
          <For of={ this.props.dataSource } each="data">
            <TabPane
              tab={
                <span>
                  <If condition={
                    this.getTabStatus(data.key)
                    || (this.props.isSeoErr && data.key === 'seo')
                    || (this.props.commonNamesError && data.key === 'details')
                  }
                  >
                    <Icon className="edit-tab__icon" style={ { color: '#ed9b1e' } } theme="filled" type="exclamation-circle" />
                  </If>
                  { data.name }
                </span> }
              key={ data.key }
              forceRender
            >
              <div className={ classNames('edit-tab__pane', data.className || '') }>
                { data.render }
              </div>
            </TabPane>
          </For>
        </Tabs>
      </div>
    );
  }
}

EditTab.propTypes = {
  onChange: PropTypes.func,
  className: PropTypes.string,
  dataSource: PropTypes.array,
  fields: PropTypes.shape({
    details: PropTypes.object,
    content: PropTypes.object,
    seo: PropTypes.object,
  }),
  isSeoErr: PropTypes.bool,
  commonNamesError: PropTypes.bool,
};

EditTab.defaultProps = {
  onChange: () => {},
  className: '',
  dataSource: [],
  fields: {
    details: null,
    content: null,
    seo: null,
  },
  isSeoErr: false,
  commonNamesError: false,
};
