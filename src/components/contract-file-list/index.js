import React from 'react';
import PropTypes from 'prop-types';
import { Tooltip } from 'antd';
import endpoints from '~settings/endpoints';
import { ContractPdf as ContractPdfIcon } from "~components/svgs";

export default class ContractFileList extends React.Component {
  constructor(props) {
    super(props);

    this.fileContainer = [];
  }

    buildAuthContractUrl = source => `${endpoints.getContractFile.url()}/${source}`;

  render() {
    return (
      <div className="contract-file-list">
        <For each="file" index="index" of={ this.props.files }>
          <Choose>
            <When condition={ file.contentType === 'application/pdf' || file.content_type === 'application/pdf' }>
              <Tooltip
                key={ index }
                getPopupContainer={ () => this.fileContainer[index] }
                title={ file.name }
              >
                <div className="contract-file-list__tooltips-container" ref={ (node) => { this.fileContainer[index] = node; } }>
                  <div className="contract-file-list__file-container" >
                    <a href={ this.buildAuthContractUrl(file.source) } target="_blank" rel="noopener noreferrer">
                      <div className="contract-file-list__file">
                        <ContractPdfIcon className="contract-file-list__file-pdf" />
                      </div>
                    </a>
                  </div>
                </div>
              </Tooltip>
            </When>
            <Otherwise>
              <div className="contract-file-list__img-container" key={ index }>
                <a href={ this.buildAuthContractUrl(file.source) } target="_blank" rel="noopener noreferrer">
                  <img className="contract-file-list__img" src={ this.buildAuthContractUrl(file.source) } alt={ file.name } />
                </a>
              </div>
            </Otherwise>
          </Choose>

        </For>
      </div>
    );
  }
}

ContractFileList.propTypes = {
  files: PropTypes.array,
};

ContractFileList.defaultProps = {
  files: [],
};

