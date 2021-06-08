import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';
import Dropzone from 'react-dropzone';
import { Form, Row, Col, Input, Icon } from 'antd';
import Svg from '~components/svg';
import ReactQuill from '~components/react-quill';
import { htmlMinify, getHtmlLength } from '~helpers/property-edit';
import updatePayloadDetails from '~helpers/location';
import cookies from 'js-cookie';
import { cookieNames } from '~constants';
import endpoints from '~settings/endpoints';
import axios from 'axios';
import { getItem } from '~base/global/helpers/storage';
import { getFileInfo, getFileType, imageUrl } from '~helpers/gallery';
import gallery, { uploadStatus, imageSizes } from '~constants/gallery';

const CONTENT_AMOUNT_LIMIT = 20000;

class ContentForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      heroImageBig: {
        uploading: null,
        error: false,
      },
      heroImageSmall: {
        uploading: null,
        error: false,
      },
      isDrapSmall: false,
      isDrapBig: false,
    };
    this.heroImageBig = null;
    this.heroImageSmall = null;
  }

  uploadItem = (item, type) => {
    this.updateStatus(
      item,
      uploadStatus.IN_PROGRESS,
      0,
      type,
    );
    const data = new FormData();
    data.append('document', item.file);

    const cancelSource = axios.CancelToken.source();
    const headers = {
      Authorization: `Bearer ${cookies.get(cookieNames.token)}`,
    };
    const authPayload = getItem('PMS_CURRENT_USER_AUTH');
    if (authPayload && authPayload.payload && authPayload.payload.currentRoleSlug) {
      headers['Current-Role'] = authPayload.payload.currentRoleSlug;
    }
    const config = {
      cancelToken: cancelSource.token,
      onUploadProgress: (progressEvent) => {
        const progress = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
        this.updateStatus(
          item,
          uploadStatus.IN_PROGRESS,
          progress,
          type,
        );
      },
      headers,
      timeout: 600 * 1000,
    };
    axios.post(endpoints.uploadImage.url(), data, config)
      .then((response) => {
        if (!response.data) {
          throw new Error('unknown error.');
        }
        const responseData = response.data;
        const itemToUpdate = item;
        itemToUpdate.response = {
          filename: responseData.filename,
          extension: responseData.extension,
          contentType: responseData.content_type,
          width: responseData.width,
          height: responseData.height,
          size: responseData.size,
          imageHash: responseData.image_hash,
        };
        let imgProp = null;
        if (type === 'big') {
          imgProp = {
            heroImage: {
              dirty: false,
              value: itemToUpdate.response,
              name: 'heroImage',
              touched: true,
            },
          };
        } else {
          imgProp = {
            smallHeroImage: {
              dirty: false,
              value: itemToUpdate.response,
              name: 'smallHeroImage',
              touched: true,
            },
          };
        }

        const result = updatePayloadDetails(this.props.data, this.props.type, imgProp, 'content');
        this.props.setTabStatus(result);
        this.updateStatus(
          itemToUpdate,
          uploadStatus.SUCCESS,
          100,
          type,
        );
      })
      .catch(() => {
        this.updateStatus(
          item,
          uploadStatus.FAILED,
          100,
          type,
        );
      });
    return cancelSource;
  }

  updateStatus = (item, status, progress = 100, type = 'big') => {
    const data = item;
    const differentStatus = item.status !== status;
    data.status = status;
    data.progress = progress;
    if (differentStatus && type === 'big') {
      this.setState({
        heroImageBig: {
          uploading: item.status === uploadStatus.IN_PROGRESS,
        },
      });
    }

    if (differentStatus && type === 'small') {
      this.setState({
        heroImageSmall: {
          uploading: item.status === uploadStatus.IN_PROGRESS,
        },
      });
    }
  }

  upload = async (file, type) => {
    if (file) {
      const newItem = await getFileInfo(file);

      if (type === 'small' && (newItem.height !== 320 || newItem.width !== 468)) {
        this.state.heroImageSmall.error = true;
        this.setState(this.state);
        return false;
      }

      if ((newItem.height !== 320 || newItem.width !== 984) && type === 'big') {
        this.state.heroImageBig.error = true;
        this.setState(this.state);
        return false;
      }

      this.state.heroImageSmall.error = false;
      this.state.heroImageBig.error = false;
      this.setState(this.state);

      const targetItem = {
        ...newItem,
        status: this.getUploadStatus(newItem),
        progress: 0,
        element: null,
        cancelSource: null,
        response: null,
      };

      if (type === 'big') {
        this.heroImageBig = targetItem;
      } else {
        this.heroImageSmall = targetItem;
      }

      this.uploadItem(targetItem, type);
    }

    return true;
  }

  getUploadStatus = (list) => {
    const media = gallery.media[getFileType(list.contentType)];

    if (list.size !== null && media.size < list.size) {
      return uploadStatus.EXCEED;
    }

    return uploadStatus.IN_PROGRESS;
  };

  getAcceptTypes = () => {
    let acceptTypes = [];
    Object.values(gallery.media).forEach((media) => {
      acceptTypes = acceptTypes.concat(Object.keys(media.types));
    });
    return acceptTypes;
  }

  dropBigProps = data => ({
    ...data,
    accept: this.getAcceptTypes(),
    multiple: false,
    onDragEnter: () => this.setDrapStatus(true, 'big'),
    onDragLeave: () => this.setDrapStatus(false, 'big'),
    onDrop: files => this.upload(files[0], 'big'),
  });

  dropSmallProps = data => ({
    ...data,
    accept: this.getAcceptTypes(),
    multiple: false,
    onDragEnter: () => this.setDrapStatus(true, 'small'),
    onDragLeave: () => this.setDrapStatus(false, 'small'),
    onDrop: files => this.upload(files[0], 'small'),
  });

  setDrapStatus = (bool, type) => {
    if (type === 'big') {
      this.setState({ isDrapBig: bool });
    } else {
      this.setState({ isDrapSmall: bool });
    }
  }

  onDelete = (target) => {
    let result;
    if (target === 'heroImageBig') {
      this.heroImageBig = null;
      result = updatePayloadDetails(this.props.data, this.props.type, {
        heroImage: {
          dirty: false,
          value: null,
          name: 'heroImage',
          touched: true,
        },
      }, 'content');
    } else {
      this.heroImageSmall = null;
      result = updatePayloadDetails(this.props.data, this.props.type, {
        smallHeroImage: {
          dirty: false,
          value: null,
          name: 'smallHeroImage',
          touched: true,
        },
      }, 'content');
    }
    this.props.setTabStatus(result);
    this.forceUpdate();
  }

  quillCounter = (html, limit) => {
    const number = getHtmlLength(html);
    return (
      <div className={ classNames('content-form__counter', { 'content-form__counter--red': number > limit,
      }) }
      >
        {`${number}/${limit}`}
      </div>
    );
  }

  textCounter = (text, limit) => {
    const number = text ? text.length : 0;
    return (
      <div className={ classNames('content-form__counter', { 'content-form__counter--red': number > limit,
      }) }
      >
        {`${number}/${limit}`}
      </div>
    );
  }

  render() {
    const { getFieldDecorator, getFieldValue } = this.props.form;

    return (
      <div className={ classNames('content-form', this.props.className) }>
        <Form className="content-form__form">
          <Row>
            <Col span={ 12 }>
              <div className="content-form__upload-image-container">
                <label className="content-form__label">{ this.props.t('cms.edit.content.label.hero_image') }</label>
                <p
                  className="content-form__summary"
                  dangerouslySetInnerHTML={ {
                    __html: this.props.t('cms.edit.content.summary.tips'),
                  } }
                />
                <Choose>
                  <When condition={ this.props.data && this.props.data.heroImage }>
                    <div className="content-form__img-container content-form__img-container--big">
                      <button type="button" className="content-form__img-delete" onClick={ () => { this.onDelete('heroImageBig'); } }>
                        <Icon type="delete" />
                      </button>
                      <img className="content-form__img" src={ imageUrl(this.props.data.heroImage, imageSizes.big) } alt={ this.props.data.heroImage.filename } />
                    </div>
                  </When>
                  <Otherwise>
                    <Dropzone { ...this.dropBigProps() }>
                      {({ getRootProps, getInputProps }) => (
                        <div
                          className={ classNames('content-form__upload-container content-form__upload-container--big', {
                            'content-form__upload-container--error': this.state.heroImageBig.error,
                            'content-form__upload-container--keppel': this.state.isDrapBig,
                          }) }
                          { ...getRootProps() }
                        >
                          <input { ...getInputProps() } />
                          <Svg className="content-form__upload-icon" hash="image" />
                          <p className="content-form__upload-summary">{ this.props.t('cms.edit.content.upload_image.tips') }</p>
                          <span className="content-form__image-size">{ this.props.t('cms.edit.content.upload_image.size.big') }</span>
                        </div>
                      )}
                    </Dropzone>
                  </Otherwise>
                </Choose>

                <Choose>
                  <When condition={ this.props.data && this.props.data.smallHeroImage }>
                    <div className="content-form__img-container content-form__img-container--small">
                      <button type="button" className="content-form__img-delete" onClick={ () => { this.onDelete('heroImageSmall'); } }>
                        <Icon type="delete" />
                      </button>
                      <img className="content-form__img" src={ imageUrl(this.props.data.smallHeroImage, imageSizes.big) } alt={ this.props.data.smallHeroImage.filename } />
                    </div>
                  </When>
                  <Otherwise>
                    <Dropzone { ...this.dropSmallProps() }>
                      {({ getRootProps, getInputProps }) => (
                        <div
                          className={ classNames('content-form__upload-container content-form__upload-container--small', {
                            'content-form__upload-container--error': this.state.heroImageSmall.error,
                            'content-form__upload-container--keppel': this.state.isDrapSmall,
                          }) }
                          { ...getRootProps() }
                        >
                          <input { ...getInputProps() } />
                          <Svg className="content-form__upload-icon" hash="image" />
                          <p className="content-form__upload-summary">{ this.props.t('cms.edit.content.upload_image.tips') }</p>
                          <span className="content-form__image-size">{ this.props.t('cms.edit.content.upload_image.size.small') }</span>
                        </div>
                      )}
                    </Dropzone>
                  </Otherwise>
                </Choose>

              </div>
            </Col>
            <Col span={ 12 }>
              <Form.Item className="content-form__item content-form__item--headline">
                <label className="content-form__label">{ this.props.t('cms.edit.content.label.headline') }</label>
                { getFieldDecorator('headline', {
                  initialValue: this.props.data ? this.props.data.headline : '',
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: false,
                    message: '',
                    validator: (rule, value, callback) => {
                      if (value && value.length > 200) {
                        callback(this.props.t('cms.properties.edit.error.format_error_message'));
                      } else {
                        callback();
                      }
                    },
                  }],
                })(
                  <Input className="content-form__headline-input" placeholder={ this.props.t('cms.edit.content.placeholder.headline') } />,
                ) }
                { this.textCounter(getFieldValue('headline'), 200) }
              </Form.Item>

              <Form.Item className="content-form__item content-form__item--summary">
                <label className="content-form__label">{ this.props.t('cms.edit.content.label.summary') }</label>
                {getFieldDecorator('summary', {
                  initialValue: htmlMinify(this.props.data ? this.props.data.summary : ''),
                  validateTrigger: 'onBlur',
                  rules: [{
                    required: false,
                    message: '',
                    validator: (rule, value, callback) => {
                      if (value && getHtmlLength(value) > CONTENT_AMOUNT_LIMIT) {
                        callback(this.props.t('cms.properties.edit.error.format_error_message'));
                      } else {
                        callback();
                      }
                    },
                  }],
                })(
                  <ReactQuill />
                  ,
                )}
                { this.quillCounter(getFieldValue('summary'), CONTENT_AMOUNT_LIMIT) }
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </div>
    );
  }
}

ContentForm.propTypes = {
  t: PropTypes.func,
  className: PropTypes.string,
  form: PropTypes.object.isRequired,
  data: PropTypes.shape({
    headline: PropTypes.string,
    summary: PropTypes.string,
    heroImage: PropTypes.object,
    smallHeroImage: PropTypes.object,
  }),
  type: PropTypes.string,
  setTabStatus: PropTypes.func.isRequired,
};

ContentForm.defaultProps = {
  t: () => {},
  className: '',
  type: '',
  data: {},
};

export default Form.create({
  name: 'content_form',
  onFieldsChange: (props, changedFields) => {
    const result = updatePayloadDetails(props.data, props.type, changedFields, 'content');

    if (result) {
      props.setTabStatus(result);
    }
  },
})(ContentForm);
