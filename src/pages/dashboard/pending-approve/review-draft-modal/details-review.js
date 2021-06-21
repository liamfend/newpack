import React from 'react';
import PropTypes from 'prop-types';
import { getFreeCancellationPeriodText, getCancellationPeriodText } from '~helpers/property-field-option';
import { draftLongtailCancellationPeriod } from '~constants/property-field-options';
import MoreEllipsis from '~pages/dashboard/pending-approve/review-draft-modal/more-ellipsis';

export default class DetailsReview extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowCnMore: false,
      isShowEnMore: false,
    };
  }

  initDetails = () => {
    const { detail, t } = this.props;
    const result = [];
    if (detail.name) {
      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.property_name.title'),
        content: detail.name,
      });
    }
    if (detail.totalBeds !== undefined) {
      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.bed_count.title'),
        content: detail.totalBeds ? (detail.totalBeds).toString() : '0',
      });
    }
    if (detail.freeCancellationPeriod) {
      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.free_cancellation_period.title'),
        content: getFreeCancellationPeriodText(detail.freeCancellationPeriod),
      });
    }

    if (detail.cancellationPeriod) {
      const cancellationPeriod =
      draftLongtailCancellationPeriod[detail.cancellationPeriod] || detail.cancellationPeriod;

      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.cancellation_period.title'),
        content: getCancellationPeriodText(cancellationPeriod),
      });
    }

    if (detail.noVisaNoPay !== undefined || detail.noPlaceNoPay !== undefined) {
      const NoVisaContent = detail.noVisaNoPay !== undefined ?
        `NoVisaNoPay (${detail.noVisaNoPay ? 'False => True' : 'True => False'})` : '';
      const NoPlaceContent = detail.noPlaceNoPay !== undefined ?
        `NoPlaceNoPay (${detail.noPlaceNoPay ? 'False => True' : 'True => False'})` : '';

      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.booking_guarantee.title'),
        content: `${NoVisaContent}${detail.noVisaNoPay !== undefined && detail.noPlaceNoPay !== undefined ? ', ' : ''}${NoPlaceContent}`,
      });
    }
    if (detail.covid19Policy !== undefined) {
      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.covid19_policy.title'),
        content: detail.covid19Policy || '-',
      });
    }
    if (detail.cancellationProcess !== undefined) {
      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.cancelation_policy.title'),
        content: detail.cancellationProcess || '-',
      });
    }
    return result;
  }

  initOtherDetails = () => {
    const { detail, t } = this.props;
    const result = [];

    if (detail.headlineCn !== undefined || detail.descriptionCn !== undefined) {
      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.tagline_cn.title'),
        content: detail.headlineCn || '-',
        subTitle: t('cms.properties.pending_approval.review_modal.details.descripation_cn.title'),
        subContent: detail.descriptionCn || '-',
        isShowHeadline: detail.headlineCn !== undefined,
        isShowDescription: detail.descriptionCn !== undefined,
      });
    }

    if (detail.headline !== undefined || detail.description !== undefined) {
      result.push({
        title: t('cms.properties.pending_approval.review_modal.details.tagline_en.title'),
        content: detail.headline || '-',
        subTitle: t('cms.properties.pending_approval.review_modal.details.descripation_en.title'),
        subContent: detail.description || '-',
        isShowHeadline: detail.headline !== undefined,
        isShowDescription: detail.description !== undefined,
      });
    }
    return result;
  }

  render() {
    const detailsData = this.initDetails();
    const otherDetailsData = this.initOtherDetails();

    return (
      <div>
        <For each="item" of={ detailsData } index="index">
          <div className="review-draft__details" key={ index }>
            <MoreEllipsis
              t={ this.props.t }
              title={ item.title }
              content={ item.content }
            />
          </div>
        </For>
        <div className="review-draft__details-others">
          <For each="other" of={ otherDetailsData } index="index">
            <div className="review-draft__details" key={ index }>
              <If condition={ other.isShowHeadline }>
                <MoreEllipsis
                  t={ this.props.t }
                  title={ other.title }
                  content={ other.content }
                />
              </If>

              <If condition={ other.isShowDescription }>
                <MoreEllipsis
                  t={ this.props.t }
                  title={ other.subTitle }
                  content={ other.subContent }
                  innerClassName={ other.isShowHeadline ? 'draft__details__subtitle' : '' }
                />
              </If>
            </div>
          </For>
        </div>
      </div>
    );
  }
}


DetailsReview.propTypes = {
  t: PropTypes.func,
  detail: PropTypes.object,
};

DetailsReview.defaultProps = {
  t: () => {},
  detail: {},
};
