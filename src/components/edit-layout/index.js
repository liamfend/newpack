import PropTypes from 'prop-types';
import React from 'react';
import { Link, withRouter } from 'react-router-dom';
import classNames from 'classnames';
import { Popover, Icon, Button } from 'antd';
import LocationReviewModal from '~components/location-review-modal';
import LeaveAlert from '~components/leave-alert';
import { locationType } from '~constants';
import generatePath from '~settings/routing';
import { getItem } from '~base/global/helpers/storage';

@withRouter
export default class EditLayout extends React.Component {
  constructor() {
    super();

    this.state = {
      showReviewModal: false,
      showWarning: false,
    };

    this.cityName = null;
  }

  handleClose = () => {
    this.props.onClose();
  };

  handleSave = (published = null) => {
    this.cityName = null;
    this.props.onSave(published);
  };

  handleReview = () => {
    this.props.onReview((validate) => {
      if (validate) {
        this.setState({ showReviewModal: true });
      } else {
        this.toogleWarning(true);
      }
    });
  };

  closeReviewModal = () => {
    this.setState({ showReviewModal: false });
  };

  getFilters = () => {
    const filters = getItem(`cms_location_${this.getCloseUrlType()}_list_filters`);
    const result = {};
    if (filters) {
      Object.keys(filters).map((key) => {
        if (filters[key]) {
          result[key] = filters[key];
        }
        return true;
      });
    }
    return result;
  }

  renderWarning = () => (
    <div className="edit-layout__warning">
      <Icon type="exclamation-circle" className="edit-layout__warning__icon" />
      <div className="edit-layout__warning__text">
        {this.props.t('cms.properties.edit.submit.warning.text')}
      </div>
      <div className="edit-layout__warning__btn-wrapper">
        <Button className="edit-layout__warning__btn" onClick={ () => { this.toogleWarning(false); } } type="primary">
          {this.props.t('cms.properties.edit.submit.warning.btn')}
        </Button>
      </div>
    </div>
  )

  toogleWarning = (value) => {
    this.setState({ showWarning: value });
  }

  hasUnsavedData = () => {
    const changFields = Object.values(this.props.changeFields).filter(value => !!value);
    return changFields.length > 0;
  }

  getCloseUrlType = () => {
    let target;
    switch (this.props.type) {
      case locationType.CITY_TYPE:
        target = 'cities';
        break;
      case locationType.AREA_TYPE:
        target = 'areas';
        break;
      case locationType.UNIVERSITY_TYPE:
        target = 'universities';
        break;
      default:
        break;
    }

    return target;
  };

  render() {
    if (!this.cityName && this.props.data) {
      this.cityName = this.props.data.name;
    }

    return (
      <div className={ classNames('edit-layout', this.props.className) }>
        <LeaveAlert
          history={ this.props.history }
          t={ this.props.t }
          when={ this.hasUnsavedData() }
        />
        <div className="edit-layout__header-container">
          <div className="edit-layout__summary-container">
            <p className="edit-layout__summary-name">{ this.cityName }</p>
            <span className={ classNames('edit-layout__summary-status', {
              'edit-layout__summary-status--green': this.props.published,
            }) }
            >{ this.props.t(`cms.edit.layout.status.${
                this.props.published ? 'published' : 'unpublish'}`)
              }</span>
          </div>
          <div className="edit-layout__action-container">
            <Link to={ generatePath(this.getCloseUrlType(), {}, this.getFilters()) } className="edit-layout____link">
              <button type="button" className="edit-layout__action-btn edit-layout__action-btn--close" onClick={ this.handleClose }>{ this.props.t('cms.edit.layout.status.btn.close') }</button>
            </Link>
            <If condition={ !this.props.published }>
              <button type="button" className="edit-layout__action-btn edit-layout__action-btn--save" onClick={ () => { this.handleSave(); } }>{ this.props.t('cms.edit.layout.status.btn.save') }</button>
            </If>
            <Popover
              content={ this.renderWarning() }
              placement="topRight"
              trigger="click"
              visible={ this.state.showWarning }
            >
              <button type="button" className="edit-layout__action-btn edit-layout__action-btn--review" onClick={ this.handleReview }>{ this.props.t('cms.edit.layout.status.btn.review') }</button>
            </Popover>
          </div>
        </div>

        <div className="edit-layout__content-container">{ this.props.children }</div>
        <LocationReviewModal
          activeModal={ this.state.showReviewModal }
          type={ this.props.type }
          handleClose={ this.closeReviewModal }
          data={ this.props.data }
          t={ this.props.t }
          onSave={ this.handleSave }
        />
      </div>
    );
  }
}

EditLayout.propTypes = {
  t: PropTypes.func.isRequired,
  onClose: PropTypes.func,
  onReview: PropTypes.func,
  onSave: PropTypes.func,
  className: PropTypes.string,
  name: PropTypes.string,
  published: PropTypes.bool,
  children: PropTypes.element,
  data: PropTypes.object,
  type: PropTypes.string.isRequired,
  changeFields: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

EditLayout.defaultProps = {
  onClose: () => {},
  onReview: () => {},
  onSave: () => {},
  className: '',
  name: '',
  published: false,
  children: '',
  data: null,
  t: () => {},
  history: {},
};
