import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Form, Input, Select, Switch, Icon, Button, Tooltip } from 'antd';

export default class VirtualLinks extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value || [{ link: '', enabled: false, displayRegion: 'ALL' }], // eslint-disable-line
    };
    this.regionOptions = ['ALL', 'CN', 'ROW'];
  }

  handleInputChange =(value, index) => {
    this.state.value[index].link = value;
    this.setState(this.state);
  }

  handleSelectorChange = (value, index) => {
    this.state.value[index].displayRegion = value;
    this.setState(this.state);
    this.checkAllSwitch();
    this.props.onChange(this.state.value);
  }

  checkAllSwitch = () => {
    const enabledList = this.state.value.filter(item => item.enabled);
    if (enabledList.find(item => item.displayRegion === 'ALL')) {
      this.state.value = this.state.value.map(
        item => Object.assign(item, { switchDisabled: !item.enabled }));
    } else if (enabledList.length > 0) {
      const hasEnabledCN = enabledList.find(item => item.displayRegion === 'CN');
      const hasEnabledROW = enabledList.find(item => item.displayRegion === 'ROW');
      if (hasEnabledCN && hasEnabledROW) {
        this.state.value = this.state.value.map(
          item => Object.assign(item, { switchDisabled: !item.enabled }));
      } else if (!hasEnabledCN && hasEnabledROW) {
        this.state.value = this.state.value.map(
          item => Object.assign(item, { switchDisabled: !item.enabled && item.displayRegion !== 'CN' }));
      } else if (hasEnabledCN && !hasEnabledROW) {
        this.state.value = this.state.value.map(
          item => Object.assign(item, { switchDisabled: !item.enabled && item.displayRegion !== 'ROW' }));
      }
    } else {
      this.state.value = this.state.value.map(
        item => Object.assign(item, { switchDisabled: false }));
    }
    this.setState(this.state);
  }

  handleSwitchChange = (index) => {
    this.state.value[index].enabled = !this.state.value[index].enabled;
    this.setState(this.state);
    this.checkLinkValidate(index, this.state.value[index].enabled);
    this.checkAllSwitch();
    this.props.onChange(this.state.value);
  }

  checkLinkValidate = (index, checkEmpty = false) => {
    if (this.state.value[index].link) {
      const urlRegex = new RegExp(/^(https?|chrome):\/\/[^\s$.?#].[^\s]*$/gm);
      this.state.value[index].urlError = !urlRegex.test(this.state.value[index].link);
      this.setState(this.state);
      return !this.state.value[index].urlError;
    }
    if (checkEmpty) {
      this.state.value[index].urlError = true;
      this.setState(this.state);
      return false;
    }
    this.state.value[index].urlError = false;
    this.setState(this.state);
    return true;
  }

  handleInputBlur = (index) => {
    this.checkLinkValidate(index);
    this.props.onChange(this.state.value);
  }

  handleCheckButtonClick = (index) => {
    if (this.checkLinkValidate(index, true)) {
      window.open(this.state.value[index].link);
    }
  }

  handleAddAnotherLinkClick = () => {
    this.state.value.push({ link: '', enabled: false, displayRegion: 'ALL' });
    this.handleSelectorChange('ALL', this.state.value.length - 1);
    this.setState(this.state);
    this.props.onChange(this.state.value);
  }

  handleRemoveThisLinkClick = (index) => {
    this.state.value.splice(index, 1);
    this.setState(this.state);
    this.checkAllSwitch();
    this.props.onChange(this.state.value);
  }

  wrapWithTooltip = (msg, tooltipShow, content, placement = 'top') => {
    if (tooltipShow) {
      return (
        <Tooltip title={ msg } placement={ placement } >
          {content}
        </Tooltip>
      );
    }
    return content;
  }

  getLinkLabel = (antdLabel, type, index, disabled = false) => {
    const links = this.state.value;
    return (
      <span className="address-tab__custom-label">
        <span
          className="address-tab__custom-label-text"
          role="presentation"
          onClick={ (e) => { e.preventDefault(); } }
        >{antdLabel}</span>
        <Choose>
          <When condition={ type === 'remove_this_link' }>
            <span
              role="presentation"
              className="address-tab__link-delete"
              onClick={ () => { this.handleRemoveThisLinkClick(index); } }
            >
              {this.props.t(`cms.properties.edit.address.${type}`)}
            </span>
          </When>
          <When condition={ type === 'switch' }>
            {this.wrapWithTooltip(this.props.t('cms.properties.edit.address.virtual_link.tooltip.region_deny'), disabled, (
              <span
                className="display-permission__switch"
              >
                <Switch
                  style={ { pointerEvents: 'none' } }
                  onChange={ () => { this.handleSwitchChange(index); } }
                  defaultChecked={ links[index].enabled }
                  checked={ links[index].enabled }
                  checkedChildren={ <Icon type="check" style={ { pointerEvents: 'none' } } /> }
                  unCheckedChildren={ <Icon type="close" style={ { pointerEvents: 'none' } } /> }
                  disabled={ disabled }
                />
              </span>
            ), 'topRight')}
          </When>
        </Choose>
      </span>
    );
  }

  render() {
    const { t } = this.props;
    return (
      <div>
        <For of={ this.state.value } each="virtualLinkItem" index="index">
          <div key={ index }>
            <Form.Item
              className={ classNames({ 'address-tab__label--disable': virtualLinkItem.enabled }) }
              label={
                this.getLinkLabel(
                  t('cms.properties.edit.address.virtual_tour_link'), this.state.value.length > 1 ? 'remove_this_link' : '', index,
                )
              }
              validateStatus={ virtualLinkItem.urlError ? 'error' : null }
              help={ virtualLinkItem.urlError ? t('cms.properties.edit.address.virtual_tour_link_error') : null }
            >
              {this.wrapWithTooltip(t('cms.properties.edit.address.virtual_link.tooltip.uneditable'), virtualLinkItem.enabled,
                (<Input
                  className="virtual-tour-link"
                  placeholder={ t('cms.properties.edit.address.virtual_tour_link_hint') }
                  suffix={
                    <Button
                      className={ classNames('check-btn', { 'check-btn--active': !virtualLinkItem.enabled && virtualLinkItem.link }) }
                      onClick={ () => { this.handleCheckButtonClick(index); } }
                      disabled={ virtualLinkItem.enabled || !virtualLinkItem.link }
                    >
                      {t('cms.properties.edit.address.button_check')}
                    </Button>
                  }
                  defaultValue={ virtualLinkItem.link }
                  value={ virtualLinkItem.link }
                  onChange={ (e) => { this.handleInputChange(e.target.value, index); } }
                  onBlur={ () => { this.handleInputBlur(index); } }
                  disabled={ virtualLinkItem.enabled }
                />),
              )}

            </Form.Item>
            <Form.Item
              className={ classNames({ 'address-tab__label--disable': virtualLinkItem.enabled }) }
              label={ this.getLinkLabel(
                t('cms.properties.edit.address.display_permission'), 'switch', index, virtualLinkItem.switchDisabled,
              ) }
              validateStatus={ virtualLinkItem.switchError ? 'error' : null }
              help={ virtualLinkItem.switchError ? t('cms.properties.edit.address.display_permission_error') : null }
            >

              {this.wrapWithTooltip(t('cms.properties.edit.address.virtual_link.tooltip.uneditable'), virtualLinkItem.enabled, (
                <Select
                  placeholder={ t('cms.properties.edit.address.display_permission_hint') }
                  onChange={ (value) => { this.handleSelectorChange(value, index); } }
                  value={ virtualLinkItem.displayRegion }
                  disabled={ virtualLinkItem.enabled }
                >
                  <For of={ this.regionOptions } each="displayItem">
                    <Select.Option key={ displayItem } value={ displayItem }>
                      {t(`cms.properties.edit.address.display_permission_${displayItem}`)}
                    </Select.Option>
                  </For>
                </Select>
              ))}
            </Form.Item>
          </div>
        </For>
        <span role="presentation" className="add-another-link" onClick={ this.handleAddAnotherLinkClick } >
          {this.props.t('cms.properties.edit.address.add_another_link')}
        </span>
      </div>
    );
  }
}

VirtualLinks.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func,
};

VirtualLinks.defaultProps = {
  t: () => { },
  onChange: () => {},
};
