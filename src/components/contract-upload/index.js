import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { Icon, Upload, message } from 'antd';
import cookies from 'js-cookie';
import endpoints from '~settings/endpoints';

export default class ContractUpload extends React.Component {
  constructor() {
    super();

    this.state = {
      previewImage: '',
      previewVisible: false,
      loading: false,
    };
  }


  handlePreview = async (file) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

  uploadButton = () => (
    <div>
      <Icon type={ this.state.loading ? 'loading' : 'plus' } />
      <div className="ant-upload-text">{ this.props.t('cms.contract.upload.btn.upload') }</div>
    </div>
  );

  buildAuthContractUrl = source => `${endpoints.getContractFile.url()}/${source}`;

  formFilesData = () => this.props.files.map((file) => {
    const newFile = { ...file };
    newFile.url = this.buildAuthContractUrl(file.source);
    newFile.uid = file.id || file.uid;
    newFile.name = file.name;
    newFile.status = 'done';
    return newFile;
  })

  handleRemove = (file) => {
    this.props.onMediaRemove(file);
  }

  render() {
    const uploadProps = {
      multiple: true,
      accept: '.jpg, .pdf, .png, .jpeg',
      beforeUpload: (file) => {
        const isLt = file.size / 1024 / 1024 < 15;
        if (!isLt) {
          message.error(this.props.t('cms.upload.error_message.too_large'));
          return false;
        }

        this.setState({ loading: true });
        const session = cookies.get('CMSACCESSSESSION');
        const formData = new FormData();
        const hasChinese = /[\u4E00-\u9FA5\uF900-\uFA2D]/g.test(file.name);
        let fileName = file.name;
        if (hasChinese) {
          switch (file.type) {
            case 'image/png':
              fileName = `${(new Date()).getTime()}.png`;
              break;
            case 'image/jpg':
              fileName = `${(new Date()).getTime()}.jpg`;
              break;
            case 'image/jpeg':
              fileName = `${(new Date()).getTime()}.jpeg`;
              break;
            default:
              fileName = `${(new Date()).getTime()}.pdf`;
          }
        }

        formData.append('document', file, fileName);
        axios.post(`${endpoints.updateContractFile.url()}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${session}`,
              'Content-Type': 'multipart/form-data',
            },
          },
        ).then((res) => {
          res.data.url = this.buildAuthContractUrl(res.data.source);
          res.data.uid = file.uid;
          res.data.name = file.name;
          res.data.status = 'done';

          this.props.setContractFiles(res.data);
          this.props.onChange();
          this.setState({ loading: false });
        }).catch((err) => {
          console.log('err: ', err);
          this.setState({ loading: false });
        });
        return false;
      },
    };

    if (this.props.files && this.props.files.length > 0) {
      uploadProps.listType = 'picture-card';
      uploadProps.fileList = this.formFilesData();
      uploadProps.onPreview = this.handlePreview;
      uploadProps.onRemove = this.handleRemove;
    }
    return (
      <div className="contract-upload">
        <If condition={ this.props.files && this.props.files.length > 0 }>
          <Upload { ...uploadProps }>
            { this.uploadButton() }
          </Upload>
        </If>
        <If condition={ this.props.files && this.props.files.length === 0 }>
          <Upload.Dragger { ...uploadProps }>
            <div className="contract-upload__upload-icon">
              <Icon type={ this.state.loading ? 'loading' : 'plus' } style={ { fontSize: '48px' } } />
            </div>
            <div className="contract-upload__upload-content">
              <p className="contract-upload__upload-text">{ this.props.t('cms.contract.upload.tips.text') }</p>
              <p className="contract-upload__upload-hint">
                { this.props.t('cms.contract.upload.hint.text') }
              </p>
              <p className="contract-upload__upload-hint">
                { this.props.t('cms.contract.upload.size_hint.size') }
              </p>
            </div>
          </Upload.Dragger>
        </If>
      </div>
    );
  }
}

ContractUpload.propTypes = {
  t: PropTypes.func.isRequired,
  setContractFiles: PropTypes.func.isRequired,
  files: PropTypes.array,
  onChange: PropTypes.func,
  onMediaRemove: PropTypes.func,
};

ContractUpload.defaultProps = {
  files: [],
  onChange: () => {},
  onMediaRemove: () => {},
  t: () => {},
};

