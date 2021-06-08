import React from 'react';
import PropTypes from 'prop-types';
import modal from '~components/modal';
import Svg from '~components/svg';

@modal({ className: 'unpubilshed-modal' }, true)
export default class UnpubilshedModal extends React.Component {
  handleYesBtn = () => {
    this.props.updateUnpubilshed();
  }

  render() {
    return (
      <div className="unpubilshed-modal__content">
        <Svg className="unpubilshed-modal__icon" hash="warning" />
        <span className="unpubilshed-modal__text">
          {this.props.text}
        </span>
        <button
          className="unpubilshed-modal__no-btn"
          onClick={ this.props.onClose }
        >
          {this.props.t('cms.form.value.no')}
        </button>
        <button
          className="unpubilshed-modal__yes-btn"
          onClick={ this.handleYesBtn }
        >
          {this.props.t('cms.form.value.yes')}
        </button>
      </div>
    );
  }
}

UnpubilshedModal.propTypes = {
  t: PropTypes.func.isRequired,
  updateUnpubilshed: PropTypes.func,
  onClose: PropTypes.func,
  text: PropTypes.string,
};

UnpubilshedModal.defaultProps = {
  updateUnpubilshed: () => {},
  onClose: () => {},
  text: '',
};

