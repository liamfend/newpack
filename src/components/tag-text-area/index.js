import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Tag } from 'antd';

export default class TagTextArea extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      list: props.contentList,
      value: '',
      showErr: false,
    };
  }

  handleClose = (e, item) => {
    e.preventDefault();
    if (this.state.list.indexOf(item) !== -1) {
      const newState = this.state.list.filter(tag => tag !== item);
      this.setState({ list: newState }, () => {
        this.props.onChange(this.state.list);
      });
    }
  };

  getValue = () => this.state.list;

  componentDidMount() {
    this.tagTextAreaInput.addEventListener('keyup', this.handleComfirmEnter);
    this.tagTextAreaInput.addEventListener('keydown', this.handleDeleteKey);
    this.tagTextAreaContainer.addEventListener('click', this.handleFocus);
    document.addEventListener('click', this.handleTextAreaBlur);
  }

  componentWillUnmount() {
    this.tagTextAreaInput.removeEventListener('keyup', this.handleComfirmEnter);
    this.tagTextAreaInput.removeEventListener('keydown', this.handleDeleteKey);
    this.tagTextAreaContainer.removeEventListener('click', this.handleFocus);
    document.removeEventListener('click', this.handleTextAreaBlur);
  }

  handleComfirmEnter = (e) => {
    if (e.keyCode === 13) {
      this.addTag();
    }
  };

  handleFocus = () => {
    this.setState({ showErr: false });
    this.tagTextAreaInput.focus();
  };

  handleDeleteKey = (e) => {
    if (this.state.value === '' && e.keyCode === 8) {
      this.state.list.splice(-1, 1);
      this.setState(this.state, () => {
        this.props.onChange(this.state.list);
      });
    }
  };

  handleTextAreaBlur = (e) => {
    if (!this.tagTextAreaContainer.contains(e.target)) {
      this.addTag();
    }
  };

  addTag = () => {
    if (this.state.list.indexOf(this.state.value) !== -1) {
      this.setState({ showErr: true });
      return false;
    }

    this.state.showErr = false;
    if (this.state.list.indexOf(this.state.value) === -1 &&
        this.tagTextAreaInput.value.trim() !== '' &&
        !(/[\u4e00-\u9fa5]+/.test(this.state.value))
        && this.state.value.length <= this.props.tagLengthLimit
    ) {
      this.state.list.push(this.state.value);
      this.state.value = '';
      this.setState(this.state, () => {
        this.props.onChange(this.state.list);
      });
    } else if (this.state.value.trim() !== '' &&
      (/[\u4e00-\u9fa5]+/.test(this.tagTextAreaInput.value))) {
      this.state.value = '';
      this.setState(this.state);
    }

    return true;
  }

  showLabel = name => (name.length > this.props.tagLengthLimit ? `${name.slice(0, this.props.tagLengthLimit)}...` : name)

  handleInputChange = (e) => {
    this.state.value = e.target.value;
    this.setState(this.state);
  }

  render() {
    const { countLimit } = this.props;
    return (
      <div>
        <div
          className={ classNames('tag-text-area', {
            'tag-text-area--error': this.state.list.length > countLimit || this.state.showErr,
          }) }
          ref={ (node) => { this.tagTextAreaContainer = node; } }
        >
          <div className="tag-text-area__container">
            <For each="item" of={ this.state.list }>
              <Tag key={ item } closable onClose={ event => this.handleClose(event, item) }>
                { this.showLabel(item) }
              </Tag>
            </For>
            <input
              className="tag-text-area__input"
              ref={ (node) => { this.tagTextAreaInput = node; } }
              placeholder={ this.props.placeholder }
              value={ this.state.value }
              onChange={ this.handleInputChange }
            />
          </div>
        </div>
        <div >
          <If condition={ this.state.list.length > countLimit || this.state.showErr }>
            <span className="tag-text-area__error-msg">
              <Choose>
                <When condition={ this.state.showErr }>
                  { this.props.errorMessage }
                </When>
                <Otherwise>{ this.props.t('cms.properties.edit.list.other.length_limit_error') }</Otherwise>
              </Choose>
            </span>
          </If>
          <span className={ classNames('tag-text-area__counter', {
            'tag-text-area__counter--red': this.state.list.length > countLimit }) }
          >
            { `${this.state.list.length}/${countLimit}`}
          </span>
        </div>
      </div>
    );
  }
}


TagTextArea.propTypes = {
  contentList: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
  countLimit: PropTypes.number.isRequired,
  tagLengthLimit: PropTypes.number,
  placeholder: PropTypes.string,
  errorMessage: PropTypes.string,
};

TagTextArea.defaultProps = {
  tagLengthLimit: 40,
  placeholder: '',
  errorMessage: '',
};

