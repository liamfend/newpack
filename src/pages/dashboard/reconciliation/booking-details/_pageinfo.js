// 本文件开发使用，并且在批处理后的文件用于正式环境，code review 请忽略，查看去掉下划线的使用版本
// 批处理js 查看根目录 autotrans
export default () => ({
  modal: {
    title: 'Update landlord booking status',
    mainStateLabel: 'Landlord booking status',
    secondaryLabel: 'Secondary status',
    pendingReason: 'Pending reason',
    description: 'Comment description',
    descripitionHolder: 'Please generally describe the issue of this booking',
    succ: 'Landlord booking status successfully updated.',
    files: 'Files',
    uploadLabel: 'Click or drag and drop files to upload here',
    uploadLimit: 'Format: .pdf .jpg .jpeg. No more than 15M each. ',
    emptyError: 'This part cannot be empty.',
    btnConfirm: 'Confirm',
    btnCancel: 'Cancel',
    lbs: 'Please select a primary landlord booking status',
    ss: 'Please select a secondary landlord booking status',
    pr: 'Please select a pending reason',
  },
  filesUpload: {
    limit: 'File exceed 15M!',
    fileTpe: 'You can only upload JPG/PNG/JPEG file!',
    succ: 'file uploaded successfully.',
    failed: 'file upload failed.',
    hover: 'You are able to upload maximum 10 files.',
  },
  confirm: {
    title: 'Update landlord booking status',
    content: 'Booking team is now checking the booking, If you continue to update, the case will be closed. Are you sure to continue?',
    okText: 'Yes,Close',
    cancelText: 'Cancel',
    succ: 'Case successfully closed.',
    failed: 'Landlord booking status failed.',
  },
  // keys 在内存中使用，不需要翻译的
  keys: {
    mainState: 'mainState',
    secondary: 'secondary',
    pendingReason: 'pendingReason',
    description: 'description',
  },
});

