import React from 'react';
import PropTypes from 'prop-types';
import { Icon } from 'antd';
import modal from '~components/modal';
import Slider from 'react-slick';
import { ArrowBigLeft as ArrowBigLeftIcon, ArrowBigRight as ArrowBigRightIcon } from "~components/svgs";
import endpoints from '~settings/endpoints';

@modal()
export default class GalleryModal extends React.Component {
  constructor(props) {
    super();
    this.state = {
      slideIndex: props.currentImageIndex,
      updateCount: 0,
    };
  }

  handleClickArrow = (type) => {
    this.slider.slickGoTo(type === 'next' ?
      this.state.slideIndex + 1 : this.state.slideIndex - 1);
  }

  componentDidMount() {
  }

  render() {
    const slideSetting = {
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      afterChange: () =>
        this.setState(state => ({ updateCount: state.updateCount + 1 })),
      beforeChange: (current, next) => this.setState({ slideIndex: next }),
      className: 'gallery-modal__image-slider',
      initialSlide: this.state.slideIndex,
    };

    const { handleClickClose, imageArray } = this.props;

    return (
      <div className="gallery-modal">

        <div className="gallery-modal__header">
          <div className="gallery-modal__header-container">
            <span className="gallery-modal__header-title">
              { imageArray[this.state.slideIndex].name }
            </span>
            <button
              className="gallery-modal__btn gallery-modal__btn--close"
              onClick={ handleClickClose }
            >
              <Icon type="close" style={ { fontSize: '24px', color: '#e7e7e7' } } />
            </button>
          </div>
        </div>

        <div
          className="gallery-modal__image-container"
        >
          <div
            className="gallery-modal__image-container__limit"
            style={ { height: '900px', width: '755px' } }
          >
            <Slider ref={ (slider) => { this.slider = slider; } } { ...slideSetting }>
              <For each="imageItem" of={ imageArray } index="index">
                <img
                  className="gallery-modal__image-size"
                  src={ `${endpoints.getOpportunityNoteFile.url()}/${imageItem.source}` }
                  alt={ imageItem.name }
                  key={ imageItem.id }
                  style={ { height: 'auto', width: 'auto' } }
                />
              </For>
            </Slider>
          </div>
        </div>

        <If condition={ imageArray.length > 1 }>
          <button
            onClick={ () => { this.handleClickArrow('prev'); } }
            className="gallery-modal__arrow-container gallery-modal__arrow-container--prev"
          >
            <ArrowBigLeftIcon className="gallery-modal__arrow-icon" />
          </button>

          <button
            onClick={ () => { this.handleClickArrow('next'); } }
            className="gallery-modal__arrow-container gallery-modal__arrow-container--next"
          >
            <ArrowBigRightIcon className="gallery-modal__arrow-icon" />
          </button>
        </If>

      </div>
    );
  }
}

GalleryModal.propTypes = {
  handleClickClose: PropTypes.func,
  imageArray: PropTypes.array,
  currentImageIndex: PropTypes.number,
};

GalleryModal.defaultProps = {
  handleClickClose: () => {},
  imageArray: [],
  currentImageIndex: 0,
};
