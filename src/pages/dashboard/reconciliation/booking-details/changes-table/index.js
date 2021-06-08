import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { Card, Table, Popover } from 'antd';
import Svg from '~components/svg';
import { withTranslation } from 'react-i18next';
import GalleryModal from '~components/gallery-modal';
import { bookingPedingNoteType } from '~constants/reconciliation-booking';

@withTranslation()
export default class ChangesTable extends React.Component {
  constructor() {
    super();

    this.state = {
      isShowModal: false,
      opportunityPendingNoteFiles: [],
    };
  }

  tableColumns = () => [
    {
      title: this.props.t('cms.reconciliation.booking.details.table.label.landlord_booking_status'),
      dataIndex: 'currentLandlordBookingStatus',
      key: 'currentLandlordBookingStatus',
      render: text => (text ?
        this.props.t(`cms.reconciliation.booking.status.${text.toLowerCase()}`) : '-'),
    },
    {
      title: this.props.t('cms.reconciliation.booking.details.table.label.secondary_status'),
      dataIndex: 'currentSecondaryLandlordBookingStatus',
      key: 'currentSecondaryLandlordBookingStatus',
      render: text => (text ?
        this.props.t(`cms.reconciliation.booking.secondary_status.${text.toLowerCase()}`) : '-'),
    },
    {
      title: this.props.t('cms.reconciliation.booking.details.table.label.updated_by'),
      dataIndex: 'updatedBy',
      key: 'updatedBy',
      render: text => text || '-',
    },
    {
      title: this.props.t('cms.reconciliation.booking.details.table.label.updated_at'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (text) => {
        if (text) {
          return moment(text).format('DD/MM/YYYY HH:mm:ss');
        }
        return '-';
      },
    },
    {
      title: this.props.t('cms.reconciliation.booking.details.table.label.booking_comments'),
      dataIndex: 'opportunityPendingNote',
      key: 'opportunityPendingNote',
      render: (text) => {
        if (text && text.length < 1) {
          return <span>-</span>;
        }

        return (
          <div
            key={ text }
            className="reconciliation-changes__pending-note"
            ref={ (node) => { this.pendingNoteContainer = node; } }
          >
            <span className="reconciliation-changes__table-text">
              { text && text.pendingNote ?
                bookingPedingNoteType[text.pendingNote] : '-' }
            </span>
            <If condition={ text && text.description }>
              <Popover
                placement="topRight"
                content={ text.description }
                title={ `${bookingPedingNoteType[text.pendingNote] || '-'}:` }
                getPopupContainer={ () => this.pendingNoteContainer }
                overlayStyle={ { left: 10 } }
                overlayClassName="reconciliation-changes__table-popover"
              >
                <button className="reconciliation-changes__massage-btn">
                  <Svg hash="massage" className="reconciliation-changes__massage-icon" />
                </button>
              </Popover>
            </If>
          </div>
        );
      },
    },
    {
      title: this.props.t('cms.reconciliation.booking.details.table.label.files'),
      dataIndex: 'files',
      key: 'files',
      render: (text, record) => (
        <Choose>
          <When condition={ record && record.opportunityPendingNote
            && record.opportunityPendingNote.opportunityPendingNoteFiles
            && record.opportunityPendingNote.opportunityPendingNoteFiles.length > 0 }
          >
            <button
              className="reconciliation-changes__table-btn"
              onClick={ () => {
                this.handleOpenGallery(record.opportunityPendingNote.opportunityPendingNoteFiles);
              } }
            >
              { this.props.t('cms.form.label.view') }
            </button>
          </When>
          <Otherwise>
            { '-' }
          </Otherwise>
        </Choose>

      ),
    },
  ];

  handleOpenGallery = (noteFiles) => {
    this.setState({
      isShowModal: true,
      opportunityPendingNoteFiles: noteFiles,
    });
  }

  handleClickCloseGallery = () => {
    this.setState({
      isShowModal: false,
      opportunityPendingNoteFiles: [],
    });
  }

  render() {
    const { list, t } = this.props;

    return (
      <div className="reconciliation-changes" id="reconciliation_history">
        <Card
          bordered={ false }
          className="reconciliation-changes__card"
          title={ t('cms.reconciliation.booking.details.cards.label.reconciliation_history') }
        >
          <Table
            rowKey={ record => record.id }
            columns={ this.tableColumns() }
            dataSource={ list }
            pagination={ false }
          />
        </Card>

        <If condition={
          this.state.isShowModal &&
          this.state.opportunityPendingNoteFiles.length > 0 }
        >
          <GalleryModal
            activeModal={ this.state.isShowModal }
            handleClickClose={ this.handleClickCloseGallery }
            imageArray={ this.state.opportunityPendingNoteFiles }
          />
        </If>
      </div>
    );
  }
}

ChangesTable.propTypes = {
  t: PropTypes.func.isRequired,
  list: PropTypes.array,
};

ChangesTable.defaultProps = {
  t: () => {},
  list: [],
};
