const gallery = {
  videoStatus: {
    waitCompress: 'PENDING',
    compressing: 'SUBMITTED',
    compressed: 'COMPLETED',
    error: 'ERROR',
  },
  media: {
    image: {
      size: 10 * (1024 ** 2), // 10MB
      types: {
        'image/jpg': 'JPG',
        'image/jpeg': 'JPEG',
        'image/png': 'PNG',
      },
      max: 9999,
      errorKeys: {
        size: 'cms.properties.edit.gallery.uploading.tips.error.images_size',
      },
    },
    video: {
      size: 1 * (1024 ** 3), // 1GB
      types: {
        'video/mp4': 'MP4',
      },
      max: 10,
      errorKeys: {
        size: 'cms.properties.edit.gallery.uploading.tips.error.videos_size',
      },
    },
  },

  libraries: {
    photo: {
      category: 'PHOTO',
      multiple: true,
      cover: false,
      transKey: 'cms.properties.edit.gallery.library.title.photo',
      descriptionTransKey: 'cms.properties.edit.gallery.library.description.photo',
      drapzoneTransKey: 'cms.properties.edit.gallery.library.dropzone_description.photo',
    },
    undefined_room: {
      category: 'ROOM',
      multiple: true,
      cover: false,
      transKey: 'cms.properties.edit.gallery.library.title.undefined_room',
      drapzoneTransKey: 'cms.properties.edit.gallery.library.description.undefined_room',
    },
    room: {
      category: 'ROOM',
      multiple: true,
      cover: true,
      drapzoneTransKey: 'cms.property.listing_management.gallery.dropzone_description',
    },
    property: [
      {
        category: 'COVER_PHOTO',
        minSize: [600, 370], // width * height
        types: ['image'], // default: [image, video]
        multiple: false,
        cover: false,
        required: true,
        transKey: 'cms.properties.edit.gallery.library.title.cover_photo',
        drapzoneTransKey: 'cms.property.listing_management.gallery.cover_photo.dropzone_description',
        errorKeys: {
          measure: 'cms.properties.edit.gallery.uploading.tips.error.cover_measure',
          multiple: 'cms.properties.edit.gallery.uploading.tips.error.cover_limited',
        },
        reminderTransKey: 'cms.property.listing_management.gallery.cover_photo.reminder',
      },
      {
        category: 'BUILDING_EXTERIOR',
        multiple: true,
        cover: false,
        transKey: 'cms.properties.edit.gallery.library.title.building_exterior',
        drapzoneTransKey: 'cms.property.listing_management.gallery.dropzone_description',
      },
      {
        category: 'COMMON_INDOOR_SPACES',
        multiple: true,
        cover: false,
        transKey: 'cms.properties.edit.gallery.library.title.common_indoor_spaces',
        drapzoneTransKey: 'cms.property.listing_management.gallery.dropzone_description',
      },
      {
        category: 'COMMON_OUTDOOR_SPACES',
        multiple: true,
        cover: false,
        transKey: 'cms.properties.edit.gallery.library.title.common_outdoor_spaces',
        drapzoneTransKey: 'cms.property.listing_management.gallery.dropzone_description',
      },
      {
        category: 'GENERAL',
        multiple: true,
        cover: false,
        transKey: 'cms.properties.edit.gallery.library.title.general',
        drapzoneTransKey: 'cms.property.listing_management.gallery.dropzone_description',
      },
    ],
  },
};

export const uploadStatus = {
  SUCCESS: 'SUCCESS',
  IN_PROGRESS: 'IN_PROGRESS',
  FAILED: 'FAILED',
  EXCEED: 'EXCEED',
  PAUSE: 'PAUSE',
};

export const imageSizes = {
  cover: {
    width: 960,
    height: 144,
  },
  small: {
    width: 144,
    height: 144,
  },
  middle: {
    width: 664,
    height: 192,
  },
  big: {
    width: 1200,
    height: 800,
    type: 'max',
  },
  heroImageThumbnail: {
    width: 380,
    height: 120,
  },
  smallHeroImageThumbnail: {
    width: 196,
    height: 120,
  },
};

export const localeMapping = {
  ALL: [
    'en-us',
    'en-gb',
    'vi-vn',
    'ja-jp',
    'ko-kr',
    'zh-hk',
    'zh-tw',
    'zh-cn',
    'th-th',
    'fr-fr',
    'it-it',
    'de-de',
    'es-es',
    'es-la',
    'pt-br',
    'el-gr',
    'el-cy',
    'tr-tr',
    'ru-ru',
  ].join(','),
  CN: ['zh-cn'].join(','),
  ROW: [
    'en-us',
    'en-gb',
    'zh-tw',
    'zh-hk',
    'ko-kr',
    'ja-jp',
    'th-th',
    'vi-vn',
    'de-de',
    'el-gr',
    'el-cy',
    'es-es',
    'es-la',
    'fr-fr',
    'it-it',
    'pt-br',
    'ru-ru',
    'tr-tr',
  ].join(','),
};

export const vrUrlPrefix = 'https://';

export const vrLinkLabel = {
  PROPERTY: 'PROPERTY',
  OVERALL: 'OVERALL',
  ROOM: 'ROOM',
};

export const galleryCategories = {
  building_exterior: 'BUILDING_EXTERIOR',
  common_indoor_spaces: 'COMMON_INDOOR_SPACES',
  common_outdoor_spaces: 'COMMON_OUTDOOR_SPACES',
  photo: 'PHOTO',
  general: 'GENERAL',
  room: 'ROOM',
};

export const galleryStatus = {
  INTERNAL_NEW: 'INTERNAL_NEW',
  EXTERNAL_NEW: 'EXTERNAL_NEW',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
};

export default gallery;
