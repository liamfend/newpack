import React from 'react';
import PropTypes from 'prop-types';
import modal from '~components/modal';
import { Form, Row, Col, Transfer, Button, Icon } from 'antd';

@modal({ className: 'other-rooms-modal-container' })
class OtherRoomsModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      targetKeys: [],
    };
    this.dataSource = this.formatDataSource(props.roomDataSource);
  }

  formatDataSource = units => units.map((unit) => {
    const { id, name } = unit.node;

    return {
      key: id,
      unitName: name,
    };
  })

  handleTransferRooms = (targetKeys) => {
    this.setState({ targetKeys });
  };

  handleConfirm = () => {
    this.props.form.validateFieldsAndScroll(
      { scroll: { offsetTop: 76, offsetBottom: 76 } },
      (err) => {
        if (!err) {
          const toUnitIds = this.props.form.getFieldValue('rooms');
          this.props.onCopyListingToRooms(toUnitIds);
          this.props.onClose();
        }
      },
    );
  }

  render() {
    const { t } = this.props;
    const { getFieldDecorator } = this.props.form;

    return (
      <Form className="other-rooms-modal">
        <button
          className="other-rooms-modal__close-btn"
          onClick={ this.props.onClose }
        >
          <Icon type="close" className="other-rooms-modal__close-icon" />
        </button>
        <div className="other-rooms-modal__main">
          <p className="other-rooms-modal__title">
            { t('cms.property.listing_management.copy_to_other_rooms.title') }
          </p>
          <div className="other-rooms-modal__tip">
            <Icon type="info-circle" theme="filled" className="other-rooms-modal__warning-icon" />
            { t('cms.property.listing_management.copy_to_other_rooms.tip') }
          </div>
          <div className="other-rooms-modal__subtitle">
            { t('cms.property.listing_management.room_name.transfer.title') }
          </div>
          <Row>
            <Col span={ 24 }>
              <Form.Item>
                { getFieldDecorator('rooms', {
                  trigger: 'onChange',
                  rules: [{
                    required: true,
                    validator: (rule, value, callback) => {
                      if (value && value.length > 0) {
                        callback();
                      }
                      callback(t('cms.property.listing_management.copy_listing.error_message.can_not_empty'));
                    },
                  }],
                })(
                  <Transfer
                    dataSource={ this.dataSource }
                    className="other-rooms-modal__transfer"
                    showSearch
                    style={ { width: '100%' } }
                    listStyle={ { width: 388, height: 260 } }
                    locale={ {
                      itemUnit: 'room',
                      itemsUnit: 'rooms',
                      notFoundContent: t('cms.property.listing_management.copy_listing.not_content'),
                      searchPlaceholder: t('cms.property.listing_management.copy_listing.search_placeholder'),
                    } }
                    targetKeys={ this.state.targetKeys }
                    onChange={ this.handleTransferRooms }
                    render={ item => item.unitName.toLowerCase() }
                  />,
                )}
              </Form.Item>
            </Col>
          </Row>
        </div>
        <div className="other-rooms-modal__btn-wrap">
          <Button
            className="other-rooms-modal__confirm-btn"
            type="primary"
            size="large"
            onClick={ this.handleConfirm }
          >
            { t('cms.property.listing_management.confirm_to_other_rooms.btn') }
          </Button>
        </div>
      </Form>
    );
  }
}

OtherRoomsModal.propTypes = {
  t: PropTypes.func.isRequired,
  roomDataSource: PropTypes.array,
  form: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onCopyListingToRooms: PropTypes.func.isRequired,
};

OtherRoomsModal.defaultProps = {
  t: () => {},
  roomDataSource: [],
  onClose: () => {},
  onCopyListingToRooms: () => {},
};

export default Form.create({ name: 'otherRooms' })(OtherRoomsModal);
