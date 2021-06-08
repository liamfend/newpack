import i18next from 'i18next';

export default () => ({
  modal: {
    title: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.title'),
    mainStateLabel: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.mainStateLabel'),
    secondaryLabel: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.secondaryLabel'),
    pendingReason: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.pendingReason'),
    description: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.description'),
    descripitionHolder: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.descripitionHolder'),
    succ: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.succ'),
    files: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.files'),
    uploadLabel: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.uploadLabel'),
    uploadLimit: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.uploadLimit'),
    emptyError: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.emptyError'),
    btnConfirm: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.btnConfirm'),
    btnCancel: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.btnCancel'),
    lbs: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.lbs'),
    ss: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.ss'),
    pr: i18next.t('cms.reconciliation.booking.details.statusmodal.modal.pr'),

  },
  filesUpload: {
    limit: i18next.t('cms.reconciliation.booking.details.statusmodal.filesUpload.limit'),
    fileTpe: i18next.t('cms.reconciliation.booking.details.statusmodal.filesUpload.fileTpe'),
    succ: i18next.t('cms.reconciliation.booking.details.statusmodal.filesUpload.succ'),
    failed: i18next.t('cms.reconciliation.booking.details.statusmodal.filesUpload.failed'),
    hover: i18next.t('cms.reconciliation.booking.details.statusmodal.filesUpload.hover'),

  },
  confirm: {
    title: i18next.t('cms.reconciliation.booking.details.statusmodal.confirm.title'),
    content: i18next.t('cms.reconciliation.booking.details.statusmodal.confirm.content'),
    okText: i18next.t('cms.reconciliation.booking.details.statusmodal.confirm.okText'),
    cancelText: i18next.t('cms.reconciliation.booking.details.statusmodal.confirm.cancelText'),
    succ: i18next.t('cms.reconciliation.booking.details.statusmodal.confirm.succ'),
    failed: i18next.t('cms.reconciliation.booking.details.statusmodal.confirm.failed'),

  },
  keys: {
    mainState: 'mainState',
    secondary: 'secondary',
    pendingReason: 'pendingReason',
    description: 'description',
  },
});
