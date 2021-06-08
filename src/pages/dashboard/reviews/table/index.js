import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Table, Popover, Rate, Icon, Input, InputNumber, DatePicker } from 'antd';
import { communicationStatus, platformEntity, entityAction } from '~constants';
import { connect } from 'react-redux';
import HTMLEllipsis from 'react-lines-ellipsis/lib/html';
import * as actions from '~actions/reviews';
import SearchProperty from '~pages/dashboard/reviews/table/search-property';
import Images from '~pages/dashboard/reviews/image';
import ContentText from '~pages/dashboard/reviews/table/content-text';
import showElementByAuth from '~helpers/auth';

const mapStateToProps = state => ({
  communication: state.dashboard.reviews.get('communication').toJS(),
});

const mapDispatchToProps = dispatch => ({
  deletedReview: (id, successCallback) => {
    dispatch(actions.deleteReview(id, successCallback));
  },

  rejectReview: (id, successCallback, isUnpublish) => {
    dispatch(actions.rejectReview(id, successCallback, isUnpublish));
  },

  approvalReview: (id, successCallback) => {
    dispatch(actions.approvalReview(id, successCallback));
  },
});

@connect(mapStateToProps, mapDispatchToProps)
export default class ReviewsTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      content: '',
      ratingMin: null,
      ratingMax: null,
      propertySlugs: '',
      updatedAtMax: '',
      updatedAtMin: '',
    };

    this.ratingType =
      ['ratingLocation', 'ratingTransport', 'ratingSafety', 'ratingStaff', 'ratingValue'];
  }

  formatRating = (value) => {
    if (typeof value === 'number') {
      const fullStarsCount = Math.floor(value);
      const decimal = value - fullStarsCount;

      if (decimal > 0 && decimal < 0.4) {
        return fullStarsCount + 0.5;
      }

      if (decimal >= 0.5) {
        return fullStarsCount + 1;
      }
    }
    return value;
  };

  renderRating = record => (
    <For each="type" index="index" of={ this.ratingType }>
      <If condition={ record[type] > 0 }>
        <div className="reviews-tab__rating-type" key={ type }>
          <span className="reviews-tab__rating-title">
            {this.props.t(`cms.reviews.table.${type.toLowerCase().replace('rating', 'rating_')}.type`)}
          </span>
          <Rate disabled allowHalf defaultValue={ this.formatRating(record[type]) } />
        </div>
      </If>
    </For>
  );

  handleContent = ({ target: { value } }) => {
    this.setState({
      content: value,
    });
  };

  setfilter = (e, type) => {
    if (!e && type) {
      this.props.onSearch(this.state[type], type);
    }
  };

  inputChange = (e, type) => {
    if (['ratingMax', 'ratingMin'].indexOf(type) !== -1) {
      this.state[type] = typeof e === 'number' ? Number(e) : 0;
    } if (type === 'content') {
      this.state.content = e.target ? e.target.value : '';
    } if (type === 'propertySlugs') {
      this.state.propertySlugs = e ? [e] : null;
    }

    this.setState(this.state);
  };

  filterRating = (e) => {
    if (!e) {
      this.props.searchScore(this.state.ratingMin, this.state.ratingMax);
    }
  };

  dateChange = (e) => {
    let min = '';
    let max = '';
    if (e && e.length > 0) {
      min = moment(e[0]).format('YYYY-MM-DDTHH:mm:ssZ');
      max = moment(e[1]).format('YYYY-MM-DDTHH:mm:ssZ');
    }

    this.setState({
      updatedAtMax: max,
      updatedAtMin: min,
    });
  };

  filterDate = (e) => {
    if (!e) {
      this.props.searchDate(this.state.updatedAtMin, this.state.updatedAtMax);
    }
  };

  isHaveReviewsUpdateAuth = () => showElementByAuth(
    platformEntity.REVIEWS_REVIEWS, entityAction.UPDATE,
  );

  tableColumns = () => [
    {
      title: this.props.t('cms.reviews.table.score'),
      dataIndex: 'rating',
      key: 'rating',
      width: '6%',
      className: 'reviews-tab__score',
      filterIcon: (
        <Icon
          type="filter"
          theme="filled"
          style={ {
            color:
            this.props.filters.ratingMax || this.props.filters.ratingMin ?
              '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      filterDropdown: (
        <div className="reviews-tab__filter">
          <span className="reviews-tab__filter-title">
            { this.props.t('cms.reviews.table.rating_filter.title') }
          </span>
          <Input.Group compact>
            <InputNumber
              value={ this.state.ratingMin }
              max={
                this.state.ratingMax > 0 && this.state.ratingMax < 5 ?
                  this.state.ratingMax : 5
              }
              min={ 0 }
              onChange={ (e) => { this.inputChange(e, 'ratingMin'); } }
              style={ { width: 108, textAlign: 'center' } }
              placeholder={ this.props.t('cms.reviews.table.rating_filter.placeholder.min') }
            />
            <Input
              style={ {
                width: 30,
                borderLeft: 0,
                borderRight: 0,
                pointerEvents: 'none',
                backgroundColor: '#fff',
                marginLeft: 1,
                marginRight: 1,
              } }
              placeholder="~"
              disabled
            />
            <InputNumber
              value={ this.state.ratingMax }
              max={ 5 }
              min={ this.state.ratingMin ? this.state.ratingMin : 0 }
              onChange={ (e) => { this.inputChange(e, 'ratingMax'); } }
              style={ { width: 108, textAlign: 'center' } }
              placeholder={ this.props.t('cms.reviews.table.rating_filter.placeholder.max') }
            />
          </Input.Group>
        </div>
      ),
      onFilterDropdownVisibleChange: this.filterRating,
      render: (text, record) => (
        <div>
          <Choose>
            <When condition={ this.ratingType.filter(item => record[item] > 0).length === 0 }>
              <span className="reviews-tab__rating">{ text.toFixed(1) }</span>
            </When>
            <Otherwise>
              <Popover
                key={ record.id }
                placement="topLeft"
                content={ this.renderRating(record) }
              >
                <span className="reviews-tab__rating--hover">
                  { text.toFixed(1) }
                </span>
              </Popover>
            </Otherwise>
          </Choose>
        </div>
      ),
    },
    {
      title: this.props.t('cms.reviews.table.review_details'),
      dataIndex: 'content',
      key: 'content',
      width: '50%',
      className: 'reviews-tab__text',
      filterIcon: (
        <Icon
          type="search"
          style={ {
            color: this.props.filters.content ? '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      onFilterDropdownVisibleChange: (e) => { this.setfilter(e, 'content'); },
      filterDropdown: (
        <div className="reviews-tab__filter reviews-tab__filter-content">
          <Input
            allowClear
            style={ { width: 214 } }
            defaultValue={ this.props.filters.content }
            onChange={ this.handleContent }
            placeholder={ this.props.t('cms.reviews.table.details.placeholder') }
          />
        </div>
      ),
      render: (text, record) => (
        <span key={ text }>
          <ContentText record={ record } t={ this.props.t } />
          <If condition={
            (record.propertyImages && record.propertyImages.length > 0)
            || (record.unitTypeImages && record.unitTypeImages.length > 0)
          }
          >
            <Images
              id={ record.id }
              t={ this.props.t }
              propertyImages={ record.propertyImages }
              unitTypeImages={ record.unitTypeImages }
              filters={ this.props.filters }
            />
          </If>
        </span>
      ),
    },
    {
      title: this.props.t('cms.reviews.table.date'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: '14%',
      filterIcon: (
        <Icon
          type="filter"
          theme="filled"
          style={ {
            color:
            this.props.filters.updatedAtMin || this.props.filters.updatedAtMax ?
              '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      onFilterDropdownVisibleChange: this.filterDate,
      filterDropdown: (
        <div className="reviews-tab__filter">
          <DatePicker.RangePicker
            allowClear
            format="DD/MM/YYYY"
            onChange={ this.dateChange }
            defaultValue={ this.props.filters.updatedAtMin ? [
              moment(this.props.filters.updatedAtMin),
              moment(this.props.filters.updatedAtMax),
            ] : null }
          />
        </div>
      ),
      render: (text, record) => (
        <span className="reviews-tab__text reviews-tab__date">
          <Choose>
            <When condition={ this.props.filters.statuses === 'NEW' }>
              { moment(record.createdAt).format('DD/MM/YYYY HH:mm') }
            </When>
            <Otherwise>
              { moment(text).format('DD/MM/YYYY HH:mm') }
            </Otherwise>
          </Choose>
        </span>
      ),
    },
    {
      title: this.props.t('cms.reviews.table.property'),
      dataIndex: 'property',
      key: 'property',
      width: '18%',
      filterIcon: (
        <Icon
          type="search"
          style={ {
            color:
              this.props.filters.propertySlugs
              && this.props.filters.propertySlugs.length > 0
                ? '#38b2a6' : '#c8c9cb',
            backgroundColor: 'transparent',
          } }
        />
      ),
      filterDropdown: (
        <div className="reviews-tab__filter">
          <SearchProperty
            inputChange={ this.inputChange }
            t={ this.props.t }
          />
        </div>
      ),
      onFilterDropdownVisibleChange: (e) => { this.setfilter(e, 'propertySlugs'); },
      render: text => (
        <div>
          <HTMLEllipsis
            unsafeHTML={ text && text.name ? text.name : '-' }
            maxLine="3"
            className="reviews-tab__text reviews-tab__property"
            ellipsisHTML={ '...' }
          />
        </div>
      ),
    },
  ];

  logSectionsColumn = () => ({
    title: this.props.t('cms.reviews.table.log_section'),
    dataIndex: 'id',
    key: 'id',
    width: '12%',
    className: 'reviews-tab__btn-td',
    render: (id) => {
      const { t, filters, communication } = this.props;
      return (
        <React.Fragment>
          <If condition={
            ['NEW', 'REJECTED'].indexOf(filters.statuses[0]) !== -1 &&
            this.isHaveReviewsUpdateAuth()
          }
          >
            <button
              className="reviews-tab__btn"
              onClick={
                communication.approval &&
                communication.approval.status === communicationStatus.FETCHING ?
                  () => {} : () => { this.handelApprovalReview(id); }
              }
            >
              { t('cms.reviews.table.log_section.approve.btn') }
            </button>
          </If>
          <If condition={
            filters.statuses[0] === 'NEW' &&
            this.isHaveReviewsUpdateAuth()
          }
          >
            <button
              className="reviews-tab__btn"
              onClick={
                communication.reject &&
                communication.reject.status === communicationStatus.FETCHING ?
                  () => {} : () => { this.handelRejectReview(id); }
              }
            >
              { t('cms.reviews.table.log_section.reject.btn') }
            </button>
          </If>
          <If condition={
            (filters.statuses[0] === 'APPROVED' || filters.statuses.length === 0) &&
            this.isHaveReviewsUpdateAuth()
          }
          >
            <button
              className="reviews-tab__btn"
              onClick={
                communication.reject &&
                communication.reject.status === communicationStatus.FETCHING ?
                  () => {} : () => { this.handleUnpublishReview(id); }
              }
            >
              { t('cms.reviews.table.log_section.unpublish.btn') }
            </button>
          </If>
        </React.Fragment>
      );
    },
  });

  handelDeletedReview = (id) => {
    this.props.deletedReview(id, () => {
      this.props.getReviews(this.props.filters);
    });
  };

  handelRejectReview = (id) => {
    this.props.rejectReview(id, () => {
      this.props.getReviews(this.props.filters);
    });
  };

  handleUnpublishReview = (id) => {
    this.props.rejectReview(id, () => {
      this.props.getReviews(this.props.filters);
    }, true);
  };

  handelApprovalReview = (id) => {
    this.props.approvalReview(id, () => {
      this.props.getReviews(this.props.filters);
    });
  };

  render() {
    const { list, communication, filters } = this.props;
    const tableColumns = this.tableColumns();
    if (this.isHaveReviewsUpdateAuth()) {
      tableColumns.push(this.logSectionsColumn());
    }

    return (
      <div className="reviews-tab">
        <Table
          rowKey="id"
          className="table-list"
          scroll={ { x: '0' } }
          columns={ tableColumns }
          onChange={ this.props.handleTableChange }
          dataSource={ list.payload }
          loading={
            communication.list
            && communication.list.status === communicationStatus.FETCHING
          }
          pagination={ {
            current: filters.pageNumber,
            pageSize: filters.pageSize,
            showSizeChanger: true,
            hideOnSinglePage: false,
            total: list.total,
            showQuickJumper: true,
          } }
        />
      </div>
    );
  }
}

ReviewsTable.propTypes = {
  t: PropTypes.func.isRequired,
  deletedReview: PropTypes.func,
  rejectReview: PropTypes.func,
  approvalReview: PropTypes.func,
  getReviews: PropTypes.func,
  handleTableChange: PropTypes.func,
  onSearch: PropTypes.func,
  searchScore: PropTypes.func,
  searchDate: PropTypes.func,
  communication: PropTypes.object,
  list: PropTypes.object,
  filters: PropTypes.object,
};

ReviewsTable.defaultProps = {
  t: () => {},
  rejectReview: () => {},
  deletedReview: () => {},
  approvalReview: () => {},
  getReviews: () => {},
  handleTableChange: () => {},
  onSearch: () => {},
  searchScore: () => {},
  searchDate: () => {},
  communication: {},
  list: {},
  filters: {},
};
