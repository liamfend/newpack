import React from 'react';
import { Spin, Row, Col, Icon, Select } from 'antd';
import { communicationStatus } from '~constants';
import PropTypes from 'prop-types';

const Option = Select.Option;
export default function LinkSelects({ t, search, status, fetchProperty,
  handleChange, handlePropertySelect, options, addUnitType, renderUnitType,
  isEdited, unitTypes }) {
  return (<div>
    <Row>
      <Col span={ 8 }>
        <div className="add-property__title">{t('cms.special_offer.form.property')}</div>
      </Col>
      <Col span={ 8 }>
        <div className="add-property__title">Unit Type</div>
      </Col>
      <Col span={ 8 }>
        <div className="add-property__title">Listing</div>
      </Col>
    </Row>
    <Row>
      <Col span={ 8 }>
        <div className="user-role-select-container">
          <Select
            showSearch
            className="add-property__select-small"
            getPopupContainer={ () => document.querySelector('.user-role-select-container') }
            value={ search }
            defaultActiveFirstOption={ false }
            showArrow={ false }
            disabled={ isEdited }
            filterOption={ false }
            notFoundContent={ <If condition={ status === communicationStatus.FETCHING }><Spin size="small" /></If> }
            onSearch={ fetchProperty }
            onChange={ handleChange }
            onSelect={ handlePropertySelect }
          >
            <For each="d" of={ options }>
              <Option value={ d.slug } key={ d.id } >
                {d.name}
                <span className="add-property__city">{d.city.name}</span>
              </Option>
            </For>
          </Select>
        </div>
      </Col>
      <Col span={ 16 }>
        {renderUnitType()}
        <If condition={ unitTypes.length > 0 }>
          <Row>
            <Icon onClick={ () => { addUnitType(); } } type="plus-circle" className="add-property__plus-icon" />
          </Row>
        </If>
      </Col>
    </Row>
  </div>);
}

LinkSelects.propTypes = {
  t: PropTypes.func.isRequired,
  search: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  isEdited: PropTypes.bool.isRequired,
  fetchProperty: PropTypes.func.isRequired,
  handleChange: PropTypes.func.isRequired,
  handlePropertySelect: PropTypes.func.isRequired,
  options: PropTypes.array.isRequired,
  addUnitType: PropTypes.func.isRequired,
  renderUnitType: PropTypes.func.isRequired,
  unitTypes: PropTypes.array.isRequired,
};

LinkSelects.defaultProps = {
  t: () => {},
};
