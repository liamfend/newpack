import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Tooltip } from 'antd';
import getEnvironment, { environments } from '~base/global/helpers/environment';

const imageHost = getEnvironment() === environments.PROD ? '//image.student.com' : '//image.dandythrust.com';

export default class reviewImages extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      islarge: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.filters !== this.props.filters) {
      this.shrinkImage();
    }
  }

  shrinkImage = () => {
    this.setState({
      islarge: false,
    });
  }

  handleImg = () => {
    this.setState({
      islarge: !this.state.islarge,
    });

    if (this.state.islarge) {
      const tr = document.getElementById(this.props.id);
      if (tr && tr.offsetParent) {
        window.scrollTo(0, tr.offsetParent.offsetTop + 140);
      }
    }
  };

formatImages = () => {
  const propertyImages = this.props.propertyImages;
  const unitTypeImages = this.props.unitTypeImages;
  const allImages = [];

  if (propertyImages.length > 0) {
    propertyImages.map((item) => {
      const image = item;
      image.type = 'property';
      allImages.push(image);

      return true;
    });
  }

  if (unitTypeImages.length > 0) {
    unitTypeImages.map((item) => {
      const image = item;
      image.type = 'room';
      allImages.push(image);

      return true;
    });
  }

  return allImages;
};

buildAuthContractUrl = item => `${imageHost}/${item.width}x${item.height}/${item.source}`;

render() {
  const { t, id } = this.props;
  const fileList = this.formatImages();

  return (
    <div
      className={ classNames('reviews-tab__imgs', {
        'reviews-tab__large-img': this.state.islarge,
      }) }
      id={ id }
    >
      <For of={ fileList } each="item" index="index">
        <button
          key={ 'large'.concat(item.id) }
          onClick={ this.handleImg }
          className={ classNames('reviews-tab__img-content', {
            'reviews-tab__img-content--show': this.state.islarge,
          }) }
        >
          <Tooltip
            placement="right"
            overlayClassName="reviews-tab__img-tips"
            title={ t(`cms.reviews.review.image_type.${item.type}`) }
          >
            <img
              src={ this.buildAuthContractUrl(item) }
              alt={ item.filename }
              className={ classNames('reviews-tab__img', {
                'reviews-tab__img--last': index + 1 === fileList.length,
              }) }
              style={ { width: '100%' } }
            />
          </Tooltip>
        </button>
        <button
          key={ 'small'.concat(item.id) }
          onClick={ this.handleImg }
          className={ classNames('reviews-tab__img-content', {
            'reviews-tab__img-content--show': !this.state.islarge && index < 4,
          }) }
        >
          <img
            src={ this.buildAuthContractUrl(item) }
            alt={ item.filename }
            className="reviews-tab__img"
            style={ {
              width: item.width >= item.height ? 'auto' : 72,
              height: item.height > item.width ? 'auto' : 72,
            } }
          />
          <If condition={ index === 3 && fileList.length > 4 }>
            <div className="reviews-tab__img--block">
              <span>{ t('cms.reviews.review.image.more', { count: fileList.length - 4 }) }</span>
            </div>
          </If>
        </button>
      </For>
    </div>
  );
}
}

reviewImages.propTypes = {
  t: PropTypes.func.isRequired,
  propertyImages: PropTypes.array,
  unitTypeImages: PropTypes.array,
  id: PropTypes.string,
  filters: PropTypes.object,
};

reviewImages.defaultProps = {
  t: () => {},
  propertyImages: [],
  unitTypeImages: [],
  id: '',
  filters: {},
};
