import React from 'react';
import PropTypes from 'prop-types';
import { Row, Col } from 'antd';
import { withTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Svg from '~components/svg';

@withTranslation()
export default class UserGuide extends React.Component {
  render() {
    return (
      <div className="user-guide">
        <div className="user-guide__banner">
          <div className="user-guide__banner-container">
            <div className="user-guide__title-container">
              <h1 className="user-guide__title">{ this.props.t('cms.help_center.homepage.title.welcome') }</h1>
              <p className="user-guide__summary">{ this.props.t('cms.help_center.homepage.summary.started') }</p>
            </div>
            <Svg className="user-guide__banner-icon" hash="illustrator" />
          </div>
        </div>

        <div className="user-guide__content">
          <h3 className="user-guide__content-title">{ this.props.t('cms.help_center.homepage.content.title.browse') }</h3>
          <Row className="user-guide__row" gutter={ 67 }>
            <Col span={ 8 } className="user-guide__block">
              <div className="user-guide__block-container">
                <Link to="/help-center/things-to-know" className="user-guide__link" />
                <Svg
                  className="user-guide__block-icon user-guide__block-icon--things-to-know"
                  hash="help-center-things-to-know"
                />
                <p className="user-guide__block-label">{ this.props.t('cms.help_center.homepage.block.title.things_to_know') }</p>
                <ul className="user-guide__block-list">
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.things_to_know.line1') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.things_to_know.line2') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.things_to_know.line3') }
                  </li>
                  <li className="user-guide__block-item user-guide__block-item--read-more">
                    { this.props.t('cms.help_center.homepage.block.item.things_to_know.read_more') }
                  </li>
                </ul>
              </div>
            </Col>
            <Col span={ 8 } className="user-guide__block">
              <div className="user-guide__block-container">
                <Link to="/help-center/listing-your-properties" className="user-guide__link" />
                <Svg
                  className="user-guide__block-icon user-guide__block-icon--listing-your-properties"
                  hash="help-center-listing-your-properties"
                />
                <p className="user-guide__block-label">
                  { this.props.t('cms.help_center.homepage.block.title.listing_your_properties') }
                </p>
                <ul className="user-guide__block-list">
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.listing_your_properties.line1') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.listing_your_properties.line2') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.listing_your_properties.line3') }
                  </li>
                </ul>
              </div>
            </Col>
            <Col span={ 8 } className="user-guide__block">
              <div className="user-guide__block-container">
                <Link to="/help-center/price-and-availability" className="user-guide__link" />
                <Svg
                  className="user-guide__block-icon user-guide__block-icon--price-and-availability"
                  hash="help-center-price-and-availability"
                />
                <p className="user-guide__block-label">
                  { this.props.t('cms.help_center.homepage.block.title.price_and_availability') }
                </p>
                <ul className="user-guide__block-list">
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.price_and_availability.line1') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.price_and_availability.line2') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.price_and_availability.line3') }
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
          <Row className="user-guide__row" gutter={ 67 }>
            <Col span={ 8 } className="user-guide__block">
              <div className="user-guide__block-container">
                <Link to="/help-center/commission-and-contract" className="user-guide__link" />
                <Svg
                  className="user-guide__block-icon user-guide__block-icon--commission-and-contract"
                  hash="help-center-commission"
                />
                <p className="user-guide__block-label">
                  { this.props.t('cms.help_center.homepage.block.title.commission_and_contract') }
                </p>
                <ul className="user-guide__block-list">
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.commission_and_contract.line1') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.commission_and_contract.line2') }
                  </li>
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.commission_and_contract.line3') }
                  </li>
                </ul>
              </div>
            </Col>
            <Col span={ 8 } className="user-guide__block">
              <div className="user-guide__block-container">
                <Link to="/help-center/my-account" className="user-guide__link" />
                <Svg
                  className="user-guide__block-icon user-guide__block-icon--my-account"
                  hash="help-center-my-account"
                />
                <p className="user-guide__block-label">
                  { this.props.t('cms.help_center.homepage.block.title.my_account') }
                </p>
                <ul className="user-guide__block-list">
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.my_account.line1') }
                  </li>
                </ul>
              </div>
            </Col>
            <Col span={ 8 } className="user-guide__block">
              <div className="user-guide__block-container user-guide__block-container--disabled">
                <Link to="/help-center/review-management" className="user-guide__link" disabled />
                <Svg
                  className="user-guide__block-icon user-guide__block-icon--review-management"
                  hash="help-center-review"
                />
                <p className="user-guide__block-label">
                  { this.props.t('cms.help_center.homepage.block.title.review_management') }
                </p>
                <ul className="user-guide__block-list">
                  <li className="user-guide__block-item">
                    { this.props.t('cms.help_center.homepage.block.item.review_management.line1') }
                  </li>
                </ul>
              </div>
            </Col>
          </Row>
        </div>
      </div>
    );
  }
}

UserGuide.propTypes = {
  t: PropTypes.func,
};

UserGuide.defaultProps = {
  t: () => {},
};
