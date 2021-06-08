import React from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';
import { Switch, Icon, DatePicker, Radio, Form, Popconfirm, Tooltip, Row, Col, Checkbox, Input } from 'antd';
import TenancyDetails from '~components/tenancy-details';
import AvailabilityAndPrice from '~components/availability-and-price';
import SearchComponent from '~components/search-component';
import { updateMutation, platformEntity, entityAction } from '~client/constants';
import showElementByAuth, { isLandlordRole } from '~helpers/auth';

const RadioGroup = Radio.Group;

class Modal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      discountedType: '',
      hasPriceMin: false,
      priceType: '',
      showSearchComponent: false,
      searchComponentSelectedRooms: props.rooms.map(item => item.node)
        .filter(item => item.id === props.listing.roomsId),
    };

    this.checkFields = [
      'type',
      'moveIn',
      'moveInType',
      'moveOut',
      'moveOutType',
      'tenancyLengthType',
      'tenancyLengthValue',
      'availability',
      'priceMin',
      'priceMax',
      'discountType',
      'discountValue',
      'liveOn',
      'liveUntil',
      'autoPriceAllowed',
      'autoAvailAllowed',
    ];
    this.openEndDate = '9999-12-31T00:00:00+00:00';
  }

  setDiscountedType = (value) => {
    this.setState({ discountedType: value });
  };

  setHasPriceMin = (value) => {
    this.setState({ hasPriceMin: value });
  };

  setPriceType = (value) => {
    this.setState({ priceType: value });
  };

  handleSubmit = (e) => {
    e.preventDefault();

    this.props.form.validateFieldsAndScroll([
      'moveIn',
      'moveInType',
      'moveOut',
      'moveOutType',
      'tenancyLengthType',
      'tenancyLengthValueMin',
      'tenancyLengthValueMax',
      'availability',
      'priceMin',
      'priceMax',
      'priceType',
      'discountType',
      'discountValue',
      'liveOn',
      'liveUntil',
      'autoPriceAllowed',
      'autoAvailAllowed',
      'copyListingToRoom',
    ], {
      scroll: {
        offsetTop: 70,
        offsetBottom: 70,
      },
    }, (err, values) => {
      if (!err) {
        const data = this.formatListingData(values);
        if (data.liveUntil === null && this.props.form.getFieldValue('openEnd')) {
          data.liveUntil = this.openEndDate;
        }

        const hasChange = this.checkFormValueChanged(data, this.props.listing);

        if ((hasChange && !this.props.listing.id.match(/fake-id-copied/g)) || this.props.listing.id.match(/fake-id-new/g)) {
          this.props.updatePropertyListing(
            this.props.listing.roomsId,
            this.props.listing.id,
            data,
          );
        }

        if (this.props.listing.id.match(/fake-id-copied/g)) {
          this.state.searchComponentSelectedRooms.map((item) => {
            this.props.updatePropertyListing(
              item.id,
              this.props.listing.id,
              data,
            );
            return true;
          });
          if (!this.state.searchComponentSelectedRooms.map(item => item.id)
            .includes(this.props.listing.roomsId)) {
            this.props.updatePropertyListing(
              this.props.listing.roomsId,
              this.props.listing.id,
              null,
            );
          }
        }

        this.props.handleComfirmModal();
        this.resetPMSModal();
        this.props.setListingsDataChanged(false);
      }
    });
  };

  formatListingData = (values) => {
    const data = {};
    data.id = this.props.listing.id;
    data.moveInType = values.moveInType || null;
    data.moveOutType = values.moveOutType || null;
    data.discountType = values.discountType;
    data.availability = values.availability;
    data.discountValue = values.discountValue || null;
    data.autoAvailAllowed = values.autoAvailAllowed;
    data.autoPriceAllowed = values.autoPriceAllowed;
    data.tenancyLengthType = values.tenancyLengthType || null;
    data.priceMin = values.priceMin ? parseFloat(values.priceMin).toFixed(2) : null;
    data.moveIn = values.moveIn ? moment(values.moveIn).format('YYYY-MM-DD') : null;
    data.moveOut = values.moveOut ? moment(values.moveOut).format('YYYY-MM-DD') : null;
    data.updatedAt = moment().format('YYYY-MM-DDTHH:mm:ssZ');
    data.liveOn = moment(values.liveOn).format('YYYY-MM-DDT00:00:00');
    data.liveUntil = this.props.form.getFieldValue('openEnd') ? this.openEndDate : moment(values.liveUntil).format('YYYY-MM-DDT00:00:00');
    data.priceMax = values.priceMax ? parseFloat(values.priceMax).toFixed(2) : null;
    data.action = this.props.listing.id.match(/fake-id/g) ? updateMutation.INSERT : updateMutation.UPDATE;
    data.type = this.props.form.getFieldValue('placeHolder') ? 'PLACEHOLDER' : null;

    if (values.tenancyLengthValueMax) {
      data.tenancyLengthValue = `${values.tenancyLengthValueMin}-${values.tenancyLengthValueMax}`;
    } else {
      data.tenancyLengthValue = values.tenancyLengthValueMin ? `${values.tenancyLengthValueMin}` : null;
    }

    return data;
  };

  checkFormValueChanged = (values, listing) => {
    let hasChanged = false;
    this.checkFields.map((item) => {
      if (values[item] !== listing[item]) {
        hasChanged = true;
      }

      return true;
    });

    return hasChanged;
  };

  componentDidMount() {
    this.setPMSModalData(this.props.listing);

    this.isOpenEndLiveUntil();
  }

  isOpenEndLiveUntil = () => {
    if (this.props.listing && this.props.listing.liveUntil === this.openEndDate) {
      this.props.form.setFieldsValue({ openEnd: true });
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.listing !== this.props.listing) {
      this.setPMSModalData(this.props.listing);
    }
  }

  componentWillUnmount() {
    if (this.props.listing) {
      this.props.handleCloseModal();
    }
  }

  resetPMSModal = () => {
    this.props.form.resetFields();
  };

  setPMSModalData = (listing) => {
    if (!listing) {
      return true;
    }

    const data = {
      autoAvailAllowed: listing && listing.autoAvailAllowed ?
        listing.autoAvailAllowed : false,
      autoPriceAllowed: listing && listing.autoPriceAllowed ?
        listing.autoPriceAllowed : false,
    };

    data.liveOn = listing.liveOn ? moment(listing.liveOn) : null;
    data.liveUntil = listing.liveUntil && listing.liveUntil !== this.openEndDate ?
      moment(listing.liveUntil) : null;
    data.availability = listing.availability || 'GOOD';
    data.priceType = listing.priceType || null;
    data.discountType = listing.discountType || 'NO_DISCOUNT';
    this.state.discountType = data.discountType;
    data.moveInType = listing.moveInType || null;
    data.moveOutType = listing.moveOutType || null;
    data.placeHolder = !!(listing.type && listing.type === 'PLACEHOLDER');
    data.tenancyLengthType = listing.tenancyLengthType || null;

    if (listing.tenancyLengthValue) {
      if (isNaN(Number(listing.tenancyLengthValue))) {
        const tenancyLengthList = listing.tenancyLengthValue.split('-');
        let min;
        let max;
        if (Array.isArray(tenancyLengthList) && tenancyLengthList.length === 2) {
          [min, max] = tenancyLengthList;
        } else {
          [min, max] = listing.tenancyLengthValue.split('_');
        }

        [data.tenancyLengthValueMin, data.tenancyLengthValueMax] = [Number(min), Number(max)];
      } else {
        data.tenancyLengthValueMin = Number(listing.tenancyLengthValue);
        this.props.form.resetFields(['tenancyLengthValueMin']);
      }
    } else {
      this.props.form.resetFields(['tenancyLengthValueMin', 'tenancyLengthValueMax']);
    }

    data.moveIn = listing.moveIn ? moment(listing.moveIn) : null;
    data.moveOut = listing.moveOut ? moment(listing.moveOut) : null;

    if (listing.priceMin && listing.discountValue && listing.discountType === 'ABSOLUTE') {
      data.currentPrice = listing.priceMin - listing.discountValue;
      data.discountValue = listing.discountValue;
    } else if (listing.priceMin && listing.discountValue && listing.discountType === 'PERCENTAGE') {
      // eslint-disable-next-line  no-mixed-operators
      data.currentPrice = (listing.priceMin * (100 - listing.discountValue) / 100);
      data.discountValue = listing.discountValue;
    }

    if (listing.priceMin) {
      data.priceMin = Number(listing.priceMin);
      data.originPrice = Number(listing.priceMin);
      this.state.hasPriceMin = true;

      if (listing.priceMax) {
        data.priceMax = Number(listing.priceMax);
        data.priceType = listing.priceMax !== listing.priceMin ? 'range' : 'exact';
      } else {
        data.priceType = 'exact';
      }

      this.state.priceType = data.priceType;
    }

    this.setState(this.state);
    this.props.form.setFieldsValue(data);
    this.tenancyDetails.handleCalculateMoveOutDateRange('moveIn', data.moveIn, true);
    return true;
  };

  disabledStartDate = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return startValue.valueOf() > endValue.valueOf();
  };

  disabledEndDate = (startValue, endValue) => {
    if (!startValue || !endValue) {
      return false;
    }

    return endValue.valueOf() <= startValue.valueOf();
  };

  handleCloseModal = () => {
    this.props.handleCloseModal();
    this.resetPMSModal();
  };

  handleModalCopy = () => {
    this.props.handleCopyRoomListing(this.props.listing);
  }

  handleModalDelete = () => {
    if (
      [updateMutation.UPDATE, updateMutation.INSERT, null].indexOf(this.props.listing.action) !== -1
    ) {
      this.props.handleDeleteRoomListing(this.props.listing);
    }

    this.handleCloseModal();
  }

  handlePlaceHolderChange = (value) => {
    if (value) {
      this.props.form.resetFields([
        'moveIn',
        'moveInType',
        'moveOut',
        'moveOutType',
        'tenancyLengthType',
        'tenancyLengthValueMin',
        'tenancyLengthValueMax',
      ]);
    }
  };

  handleCloseModalPopupVisibleChange = (visible) => {
    if (!visible) {
      this.props.onControlPopup(false);
    }
  }

  handleCloseModalPopupConfirm = () => {
    this.props.onControlPopup(false);
    this.props.handleCloseModal();
    if (this.props.nextListing) {
      this.props.onChooseNextListing();
    }
    this.props.setListingsDataChanged(false);
  }

  liveUntilChange = (dateString) => {
    if (dateString.format('DD/MM/YYYY') === moment(this.openEndDate).format('DD/MM/YYYY')) {
      this.props.form.setFieldsValue({ openEnd: true });
    }
  }

  render() {
    const { getFieldDecorator, getFieldValue, setFieldsValue } = this.props.form;
    if (getFieldValue('openEnd')) {
      this.props.form.resetFields(['liveUntil']);
    }
    return (
      <div className="listing-modal" ref={ (node) => { this.modal = node; } }>
        <Form layout="inline" onSubmit={ this.handleSubmit }>
          <div className="listing-modal__container">
            {/* Header */}
            <div className="listing-modal__header">
              <If condition={ this.props.listing && this.props.listing.id && !this.props.listing.id.match(/fake-id/g) }>
                <span className="listing-modal__listing-id">{
                  this.props.t('cms.listing.modal.lisitng_id.label', {
                    id: JSON.parse(atob(this.props.listing.id)).id,
                  })
                }</span>
              </If>
              <Choose>
                <When condition={ this.props.editedFields.listingsDataChanged }>
                  <Popconfirm
                    visible={ this.props.closeModalPopupVisible }
                    onVisibleChange={ this.handleCloseModalPopupVisibleChange }
                    title={ this.props.t('cms.properties.edit.modal_close_tip') }
                    placement="left"
                    onConfirm={ this.handleCloseModalPopupConfirm }
                    onCancel={ () => { this.props.onControlPopup(false); } }
                    okText={ this.props.t('cms.properties.edit.btn.yes') }
                    cancelText={ this.props.t('cms.properties.edit.btn.no') }
                  >
                    <button
                      type="button"
                      className="listing-modal__btn listing-modal__btn--close"
                      onClick={ () => {
                        if (this.props.editedFields.listingsDataChanged ||
                          (this.props.listing.action === updateMutation.NEW)) {
                          this.props.onControlPopup(true);
                        } else {
                          this.props.onControlPopup(false);
                        }
                      } }
                    >
                      <Icon type="close" style={ { fontSize: '12px' } } />
                    </button>
                  </Popconfirm>
                </When>
                <Otherwise>
                  <button type="button" className="listing-modal__btn listing-modal__btn--close" onClick={ this.handleCloseModal }>
                    <Icon type="close" style={ { fontSize: '12px' } } />
                  </button>
                </Otherwise>
              </Choose>
            </div>
            {/* Body */}
            <div
              className="listing-modal__content"
              ref={ (node) => { this.tipsContainer = node; } }
            >
              <div className="listing-modal__content-container">
                <h4 className="listing-modal__name-title">
                  { this.props.listing && this.props.listing.roomsName }
                </h4>
                <div className="listing-modal__placeholder-container">
                  <span className="listing-modal__placeholder">{ this.props.t('cms.listing.modal.place_holder.label') }</span>
                  <Form.Item className="listing-modal__place-holder-item">
                    { getFieldDecorator('placeHolder', {
                      valuePropName: 'checked',
                    })(
                      <Switch checkedChildren={ <Icon type="check" /> } onClick={ this.handlePlaceHolderChange } />,
                    )}
                  </Form.Item>
                </div>

                {/* Tenancy Details */}
                <TenancyDetails
                  ref={ (node) => { this.tenancyDetails = node; } }
                  form={ this.props.form }
                  billingCycle={ this.props.billingCycle }
                  listing={ this.props.listing }
                  showPlaceHolder={ getFieldValue('placeHolder') }
                  t={ this.props.t }
                />

                {/* Availability and Price */}
                <AvailabilityAndPrice
                  form={ this.props.form }
                  currency={ this.props.currency }
                  listing={ this.props.listing }
                  discountedType={ this.state.discountedType }
                  hasPriceMin={ this.state.hasPriceMin }
                  priceType={ this.state.priceType }
                  setDiscountedType={ this.setDiscountedType }
                  setHasPriceMin={ this.setHasPriceMin }
                  setPriceType={ this.setPriceType }
                  t={ this.props.t }
                  showPlaceHolder={ getFieldValue('placeHolder') }
                />

                {/* General Setting */}
                <div className="listing-modal__general-setting">
                  <h4 className="listing-modal__title isting-modal__title--general-setting">
                    { this.props.t('cms.listing.modal.general_setting.label') }
                  </h4>

                  {/* Live on & Live until */}
                  <div className="listing-modal__row-container" >
                    <Row gutter={ 9 }>
                      <Col span={ 12 }>
                        <div className="listing-modal__column-container">
                          <label className="listing-modal__label listing-modal__label--required">
                            { this.props.t('cms.listing.modal.live_on.label') }
                            <Tooltip
                              overlayStyle={ { minWidth: 300 } }
                              getPopupContainer={ () => this.tipsContainer }
                              title={ this.props.t('cms.listing.modal.live_on.label.tips') }
                            >
                              <Icon type="question-circle" className="rooms-tab__tips-icon" />
                            </Tooltip>
                          </label>
                          <Form.Item>
                            <div ref={ (node) => { this.liveOnContainer = node; } }>
                              { getFieldDecorator('liveOn', {
                                rules: [{ required: true, message: this.props.t('cms.listing.modal.error_message.can_not_empty') }],
                              })(
                                <DatePicker
                                  style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                                  getCalendarContainer={ () => this.liveOnContainer }
                                  format="ll"
                                  disabledDate={
                                    startValue => this.disabledStartDate(startValue, this.props.form.getFieldValue('liveUntil'))
                                  }
                                />,
                              )}
                            </div>
                          </Form.Item>
                        </div>
                      </Col>

                      <Col span={ 12 }>
                        <div className="listing-modal__column-container" >
                          <label className="listing-modal__label listing-modal__label--required">
                            { this.props.t('cms.listing.modal.live_until.label') }
                            <Tooltip
                              overlayStyle={ { minWidth: 300 } }
                              getPopupContainer={ () => this.tipsContainer }
                              title={ this.props.t('cms.listing.modal.live_until.label.tips') }
                            >
                              <Icon type="question-circle" className="rooms-tab__tips-icon" />
                            </Tooltip>
                            <div className="listing-modal__open-end">
                              <div className="listing-modal__open-end-checkbox">
                                <Form.Item>
                                  { getFieldDecorator('openEnd', { valuePropName: 'checked' })(
                                    <Checkbox />,
                                  )}
                                </Form.Item>
                              </div>
                              <span className="listing-modal__open-end-text">
                                {this.props.t('cms.listing.modal.live_until.open_end')}
                              </span>
                            </div>
                          </label>
                          <Form.Item>
                            <div ref={ (node) => { this.liveUntilContainer = node; } }>
                              { getFieldDecorator('liveUntil', {
                                rules: [{
                                  required: !getFieldValue('openEnd'),
                                  message: this.props.t('cms.listing.modal.error_message.can_not_empty') }],
                              })(
                                <DatePicker
                                  style={ { width: '100%', height: '32px', borderRadius: '2px' } }
                                  getCalendarContainer={ () => this.liveUntilContainer }
                                  format="ll"
                                  disabledDate={
                                    endValue => this.disabledEndDate(getFieldValue('liveOn'), endValue)
                                  }
                                  disabled={ getFieldValue('openEnd') }
                                  placeholder={ getFieldValue('openEnd') ? '' : this.props.t('cms.listing.modal.live_until.placeholder') }
                                  onChange={ dateString => this.liveUntilChange(dateString) }
                                />,
                              )}
                            </div>
                          </Form.Item>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  <If condition={ !isLandlordRole() }>
                    {/* Auto Price & Auto availability */}
                    <div className="listing-modal__row-container listing-modal__row-container--last">
                      <Row gutter={ 9 }>
                        <Col span={ 12 }>
                          <div className="listing-modal__column-container">
                            <label className="listing-modal__label">{ this.props.t('cms.listing.modal.auto_price.label') }</label>
                            <Form.Item>
                              { getFieldDecorator('autoPriceAllowed', {
                                initialValue: false,
                              })(
                                <RadioGroup>
                                  <Radio value>{ this.props.t('cms.listing.modal.option.yes') }</Radio>
                                  <Radio value={ false }>{ this.props.t('cms.listing.modal.option.no') }</Radio>
                                </RadioGroup>,
                              )}
                            </Form.Item>
                          </div>
                        </Col>

                        <Col span={ 12 }>
                          <div className="listing-modal__column-container">
                            <label className="listing-modal__label">{ this.props.t('cms.listing.modal.auto_availability.label') }</label>
                            <Form.Item>
                              { getFieldDecorator('autoAvailAllowed', {
                                initialValue: false,
                              })(
                                <RadioGroup>
                                  <Radio value>{ this.props.t('cms.listing.modal.option.yes') }</Radio>
                                  <Radio value={ false }>{ this.props.t('cms.listing.modal.option.no') }</Radio>
                                </RadioGroup>,
                              )}
                            </Form.Item>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </If>

                </div>
                {/* Copy listing to */}
                <If condition={ this.props.listing && this.props.listing.action === 'NEW' && this.props.listing.id.includes('copied') }>
                  <div className="listing-modal__copy-listing-to">
                    <div ref={ (node) => { this.searchComponentContainer = node; } }>
                      <Form.Item label={ this.props.t('cms.listing.modal.copy_listing_to_room') } colon={ false }>
                        {
                          getFieldDecorator('copyListingToRoom', {
                            initialValue: this.state.searchComponentSelectedRooms.map(item => item.name).join('; '),
                            rules: [{ required: true, message: this.props.t('cms.properties.edit.error.blank') }],
                          })(
                            <Input
                              className="listing-modal__copy-listing-to__input"
                              ref={ (node) => { this.copyListingToRoomInput = node.input; } }
                              onFocus={ () => { this.setState({ showSearchComponent: true }); } }
                            />)
                        }
                        <If condition={ this.state.searchComponentSelectedRooms.length }>
                          <Tooltip
                            overlayStyle={ { minWidth: 300 } }
                            arrowPointAtCenter
                            getPopupContainer={ () => this.searchComponentContainer }
                            placement="topRight"
                            title={ this.state.searchComponentSelectedRooms.map(item => <div key={ item.id } className="indicator-text">{item.name}</div>) }
                          >
                            <div className="indicator">{this.state.searchComponentSelectedRooms.length}</div>
                          </Tooltip>
                        </If>
                        <If condition={ this.state.showSearchComponent }>
                          <SearchComponent
                            t={ this.props.t }
                            targetInput={ this.copyListingToRoomInput }
                            container={ this.searchComponentContainer }
                            options={ this.props.rooms.map(room => room.node) }
                            type={ 'input' }
                            onChange={ (value) => {
                              setFieldsValue({
                                copyListingToRoom: value.value.map(item => item.name).join('; '),
                              });
                              this.setState({
                                searchComponentSelectedRooms: value.value,
                              });
                            } }
                            keyValue="id"
                            className="listing-modal__copy-listing-to__search-component"
                            selectList={ [this.props.listing.roomsId] }
                          />
                        </If>
                      </Form.Item>
                    </div>
                  </div>
                </If>

              </div>

            </div>
            {/* Footer */}
            <div className="listing-modal__footer">
              <If condition={ this.props.listing && (!this.props.listing.action ||
                this.props.listing.action !== updateMutation.NEW)
              }
              >
                <button
                  type="button"
                  className="listing-modal__btn listing-modal__btn--copy"
                  onClick={ this.handleModalCopy }
                >
                  <Icon
                    type="copy"
                    style={ {
                      color: '#38b2a6',
                      fontSize: '16px',
                    } }
                  />
                </button>
              </If>
              <If condition={ this.props.listing && this.props.listing.action &&
                this.props.listing.action === updateMutation.NEW &&
                showElementByAuth(platformEntity.LISTINGS_LISTINGS, entityAction.CREATE)
              }
              >
                <button
                  type="button"
                  className="listing-modal__btn listing-modal__btn--copy listing-modal__btn--copy-disable"
                  disabled
                  ref={ (node) => { this.copybtn = node; } }
                >
                  <Tooltip
                    placement="topLeft"
                    overlayStyle={ { minWidth: 300 } }
                    overlayClassName="listing-modal__copy-tooltip"
                    title={ this.props.t('cms.listing.edit.tooltips.copy_tooltips') }
                    getPopupContainer={ () => this.copybtn }
                  >
                    <Icon
                      type="copy"
                      style={ {
                        color: '#c8c9cb',
                        fontSize: '16px',
                      } }
                    />
                  </Tooltip>
                </button>
              </If>


              <If condition={ showElementByAuth(
                platformEntity.LISTINGS_LISTINGS,
                entityAction.DELETE,
              ) }
              >
                <Popconfirm
                  placement="topRight"
                  title={ this.props.t('cms.properties.edit.listings.delete_listing_hint') }
                  onConfirm={ (e) => { e.stopPropagation(); this.handleModalDelete(); } }
                  onCancel={ (e) => { e.stopPropagation(); } }
                  okType="danger"
                  okText={ this.props.t('cms.properties.edit.btn.yes') }
                  cancelText={ this.props.t('cms.properties.edit.btn.no') }
                >
                  <button type="button" className="listing-modal__btn listing-modal__btn--delete">
                    <Icon
                      type="delete"
                      style={ {
                        color: '#38b2a6',
                        fontSize: '16px',
                      } }
                    />
                  </button>
                </Popconfirm>
              </If>
              <button type="submit" className="listing-modal__btn listing-modal__btn--confirm">
                { this.props.t('cms.listing.modal.confirm.btn') }
              </button>
            </div>
          </div>
        </Form>
      </div>
    );
  }
}

Modal.propTypes = {
  handleCloseModal: PropTypes.func.isRequired,
  form: PropTypes.shape({
    validateFields: PropTypes.func.isRequired,
    resetFields: PropTypes.func.isRequired,
    getFieldDecorator: PropTypes.func.isRequired,
    getFieldValue: PropTypes.func.isRequired,
    setFieldsValue: PropTypes.func.isRequired,
    validateFieldsAndScroll: PropTypes.func.isRequired,
  }).isRequired,
  listing: PropTypes.object,
  currency: PropTypes.string.isRequired,
  billingCycle: PropTypes.string.isRequired,
  updatePropertyListing: PropTypes.func.isRequired,
  handleComfirmModal: PropTypes.func.isRequired,
  handleCopyRoomListing: PropTypes.func.isRequired,
  handleDeleteRoomListing: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  nextListing: PropTypes.object,
  editedFields: PropTypes.object,
  closeModalPopupVisible: PropTypes.bool.isRequired,
  onControlPopup: PropTypes.func.isRequired,
  onChooseNextListing: PropTypes.func.isRequired,
  setListingsDataChanged: PropTypes.func.isRequired,
  rooms: PropTypes.array,
};

Modal.defaultProps = {
  handleCloseModal: () => {},
  listing: null,
  t: () => {},
  nextListing: null,
  editedFields: {},
  closeModalPopupVisible: false,
  onControlPopup: () => {},
  onChooseNextListing: () => {},
  setListingsDataChanged: () => {},
  rooms: [],
};

const PMSListingEditModal = Form.create({
  name: 'pms_listing_edit_modal',
  onFieldsChange: (props, changedFields) => {
    const changedObj = Object.keys(changedFields)
      .find(fieldName => changedFields[fieldName].touched);
    if (changedObj && !props.editedFields.listingsDataChanged) {
      props.setListingsDataChanged(true);
    } else if (!changedObj && !props.editedFields.listingsDataChanged) {
      props.setListingsDataChanged(false);
    }
  },
})(Modal);

export default PMSListingEditModal;
