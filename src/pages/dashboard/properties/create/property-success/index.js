import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'antd';
import { withTranslation } from 'react-i18next';
import { withRouter } from 'react-router-dom';
import { PropertySuccess as PropertySuccessIcon } from "~components/svgs";
import generatePath from '~settings/routing';

@withTranslation()
@withRouter

export default class PropertySuccess extends React.Component {
  constructor() {
    super();

    this.formData = {
      basicInfo: {},
    };

    this.state = {
      current: 2,
      successFlag: false,
    };
  }

  componentDidMount() {
  }

  backHomelist = () => {
    const url = generatePath('properties');
    this.props.history.push(url);
  }

  render() {
    const { t } = this.props;

    return (
      <div className="property-success">
        <PropertySuccessIcon className="property-success__icon" />
        <div className="property-success__create-success">
          {t('cms.properties.create.property_success.create_success')}
        </div>
        <Button type="primary" className={ 'steps-action__button steps-action__button--back-home' } onClick={ () => this.backHomelist() }>
          {this.props.t('cms.properties.create.property_success.back_homelist')}
        </Button>
      </div>
    );
  }
}

PropertySuccess.propTypes = {
  t: PropTypes.func.isRequired,
  history: PropTypes.object.isRequired,
};

PropertySuccess.defaultProps = {
  t: () => {},
  history: {},
};
