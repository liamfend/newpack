/* eslint-disable react/prop-types */
/* eslint-disable no-param-reassign */
/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';
import { Checkbox, Form, Row, Col } from 'antd';


export default class Facilities extends React.Component {
  constructor(props) {
    super(props);
    this.newRoomFacilities = [
      { checked: false, group: null, label: 'Air Conditioning', slug: 'unit_type_air_conditioning' },
      { checked: false, group: null, label: 'Bathroom', slug: 'unit_type_bathroom' },
      { checked: false, group: null, label: 'Chairs', slug: 'unit_type_chairs' },
      { checked: false, group: null, label: 'Closet', slug: 'unit_type_closet' },
      { checked: false, group: null, label: 'Desk', slug: 'unit_type_desk' },
      { checked: false, group: null, label: 'Door Lock', slug: 'unit_type_door_lock' },
      { checked: false, group: null, label: 'Heating', slug: 'unit_type_heating' },
      { checked: false, group: null, label: 'Kitchen', slug: 'unit_type_Kitchen' },
      { checked: false, group: null, label: 'Television', slug: 'unit_type_television' },
      { checked: false, group: null, label: 'WiFi', slug: 'unit_type_wifi' },
    ];
  }

  handleCheckboxChange = (checkBoxItem) => {
    const { value } = this.props;
    const mapedFacilities = value || this.newRoomFacilities;
    const newFacilities = mapedFacilities.map((facility) => {
      if (facility.checked !== checkBoxItem.value) {
        if (checkBoxItem.slug === facility.slug) {
          if (checkBoxItem.value) {
            return {
              action: 'INSERT',
              slug: facility.slug,
              label: facility.label,
              checked: true,
            };
          }
          return {
            action: 'DELETE',
            slug: facility.slug,
            label: facility.label,
            checked: false,
          };
        }
      }
      return facility;
    });
    this.props.onChange(newFacilities);
  }

  render() {
    const { t, value } = this.props;
    return (
      <div className="facilities">
        <div className="content-title">
          <span className="content-title__text">{t('cms.properties.edit.rooms.facilities')}</span>
        </div>
        <Row gutter={ 16 }>
          <Col span={ 12 }>
            <For of={ value ? value.slice(0, 5) : this.newRoomFacilities.slice(0, 5) } each="checkBoxItem">
              <Form.Item key={ checkBoxItem.slug }>
                <Checkbox
                  onChange={
                    (e) => {
                      this.handleCheckboxChange({ value: e.target.checked, ...checkBoxItem });
                    }
                  }
                  defaultChecked={ checkBoxItem.checked || checkBoxItem.action === 'INSERT' }
                >
                  {checkBoxItem.label}
                </Checkbox>
              </Form.Item>
            </For>
          </Col>
          <Col span={ 12 }>
            <For of={ value ? value.slice(5, 10) : this.newRoomFacilities.slice(5, 10) } each="checkBoxItem">
              <Form.Item key={ checkBoxItem.slug }>
                <Checkbox
                  onChange={
                    (e) => {
                      this.handleCheckboxChange({ value: e.target.checked, ...checkBoxItem });
                    }
                  }
                  defaultChecked={ checkBoxItem.checked || checkBoxItem.action === 'INSERT' }
                >
                  {checkBoxItem.label}
                </Checkbox>
              </Form.Item>
            </For>
          </Col>
        </Row>
      </div>
    );
  }
}

Facilities.propTypes = {
  t: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
};

Facilities.defaultProps = {
  t: () => { },
  onChange: () => { },
};

