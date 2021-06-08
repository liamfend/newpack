import { environments, getEnvironment } from '~helpers/environments';

const environment = getEnvironment();

const STAGE_API = '//gateway-ap.dandythrust.com/graphql';
const PROD_API = '//gateway-ap.student.com/graphql';
const UAT_API1 = '//gateway-uat1.dandythrust.com/graphql';
const UAT_API2 = '//gateway-uat2.dandythrust.com/graphql';
const UAT_API3 = '//gateway-uat3.dandythrust.com/graphql';
/**
 * Get use of local mock server or stage server
 * const url = link => link;
 */
const url = () => {
  if (environment === environments.PROD) {
    return PROD_API;
  } else if (environment === environments.DEV) {
    return STAGE_API;
  } else if (environment === environments.STAGE) {
    return STAGE_API;
  } else if (environment === environments.UAT1) {
    return UAT_API1;
  } else if (environment === environments.UAT2) {
    return UAT_API2;
  } else if (environment === environments.UAT3) {
    return UAT_API3;
  }

  return STAGE_API;
};

export const GRAPH_URL = url();

const cmsFacadeUrl = (link) => {
  if (environment === environments.PROD) {
    return `//cms-facade.student.com${link}`;
  }
  return `//cms-facade.dandythrust.com${link}`;
};

const cmsFacadeEnvUrl = (link) => {
  if (environment === environments.PROD) {
    return `//cms-facade.student.com${link}`;
  } else if (environment === environments.DEV) {
    return `//cms-facade-uat3.dandythrust.com${link}`;
  } else if (environment === environments.STAGE) {
    return `//cms-facade.dandythrust.com${link}`;
  } else if (environment === environments.UAT1) {
    return `//cms-facade-uat1.dandythrust.com${link}`;
  } else if (environment === environments.UAT2) {
    return `//cms-facade-uat2.dandythrust.com${link}`;
  } else if (environment === environments.UAT3) {
    return `//cms-facade-uat3.dandythrust.com${link}`;
  }

  return `//cms-facade.dandythrust.com${link}`;
};

const imageUrl = (link) => {
  if (environment === environments.PROD) {
    return `//image.student.com${link}`;
  }
  return `//image.dandythrust.com${link}`;
};

const authImageUrl = (link) => {
  if (environment === environments.PROD) {
    return `//www.student.com${link}`;
  } else if (environment === environments.DEV) {
    return `//hurricane-cn.dandythrust.com${link}`;
  }

  return `//hurricane-www.dandythrust.com${link}`;
};

export const authUrl = (link) => {
  if (environment === environments.PROD) {
    return `//www.student.com${link}`;
  } else if (environment === environments.DEV) {
    return `//uat3-www.dandythrust.com${link}`;
    // return link;
  } else if (environment === environments.UAT1) {
    return `//uat1-www.dandythrust.com${link}`;
  } else if (environment === environments.UAT2) {
    return `//uat2-www.dandythrust.com${link}`;
  } else if (environment === environments.UAT3) {
    return `//uat3-www.dandythrust.com${link}`;
  }

  return `//hurricane-www.dandythrust.com${link}`;
};

const endpoints = {
  defaultUrl: {
    isSecure: true,
    url: () => url(),
  },

  login: {
    isSecure: true,
    url: () => url(),
  },

  forgotPassword: {
    isSecure: true,
    url: () => url(),
  },

  resetPassword: {
    isSecure: true,
    url: () => url(),
  },

  checkUserExist: {
    isSecure: true,
    url: () => url(),
  },

  getPropertyList: {
    isSecure: true,
    url: () => url('/api/properties/properties/list'),
  },

  getSpecialOfferList: {
    isSecure: true,
    url: () => url(),
  },

  deleteSpecialOffer: {
    isSecure: true,
    url: () => url(),
  },

  getRoomListings: {
    isSecure: true,
    url: () => url('/api/properties/listing/room-listings'),
  },

  getUnitTypes: {
    isSecure: true,
    url: () => url('/api/properties/unit-types/list'),
  },

  createUnitType: {
    isSecure: true,
    url: () => url('/api/properties/unit-types/create'),
  },

  updateUnitType: {
    isSecure: true,
    url: () => url('/api/properties/unit-types/update'),
  },

  deleteUnitType: {
    isSecure: true,
    url: () => url('/api/properties/unit-types/delete'),
  },

  getDistinctions: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/list'),
  },

  createDistinction: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/create'),
  },

  updateDistinction: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/update'),
  },

  deleteDistinction: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/delete'),
  },

  removeDistinctionFromUnitType: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/remove-distinction'),
  },

  addDistinctionToUnitType: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/add-distinction'),
  },

  createRoomList: {
    isSecure: true,
    url: () => url('/api/properties/listing/create-listing'),
  },

  updateRoomList: {
    isSecure: true,
    url: () => url('/api/properties/listing/update-listing'),
  },

  deleteRoomList: {
    isSecure: true,
    url: () => url('/api/properties/listing/remove-listing'),
  },

  getClassifications: {
    isSecure: true,
    url: () => url('/api/properties/classifications/list'),
  },

  updateClassification: {
    isSecure: true,
    url: () => url('/api/properties/classifications/update'),
  },

  createClassification: {
    isSecure: true,
    url: () => url('/api/properties/classifications/create'),
  },

  deleteClassification: {
    isSecure: true,
    url: () => url('/api/properties/classifications/delete'),
  },

  removeClassificationFromUnitType: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/remove-classification'),
  },

  addClassificationToUnitType: {
    isSecure: true,
    url: () => url('/api/properties/distinctions/add-classification'),
  },

  search: {
    isSecure: true,
    url: type =>
      url(
        type ? `/api/properties/search/${type}` : '/api/properties/search/list',
      ),
  },

  exportList: {
    isSecure: true,
    url: landlordSlug =>
      `/service/nomination-list/download?landlord=${landlordSlug}`,
  },

  uploadList: {
    isSecure: true,
    url: landlordSlug => `/service/nomination-list/upload/${landlordSlug}`,
  },

  getStudentDetail: {
    isSecure: true,
    url: () => url('/api/udesk/student-detail'),
  },

  getPropertyDetail: {
    isSecure: true,
    url: () => url('/api/properties/properties/get-property-detail'),
  },

  updateProperty: {
    isSecure: true,
    url: () => url('/api/properties/properties/update-property'),
  },

  publishProperty: {
    isSecure: true,
    url: () => url('/api/properties/properties/publish-property'),
  },

  uploadImage: {
    isSecure: true,
    url: () => cmsFacadeUrl('/images'),
  },

  uploadPropertyImage: {
    isSecure: true,
    url: () => cmsFacadeEnvUrl('/property_images'),
  },

  downloadOpportunityBulkUpdateExcel: {
    isSecure: true,
    url: fileName => cmsFacadeEnvUrl(`/opportunity_bulk_update_file/${fileName}`),
  },

  image: {
    isSecure: true,
    url: (filename, options) => (
      imageUrl(`/${options.type ? `${options.type}_` : ''}${options.width}x${options.height}/${filename}`)
    ),
  },

  getCountryList: {
    isSecure: true,
    url: () => url(),
  },

  getCityDetail: {
    isSecure: true,
    url: () => url(),
  },

  getCityList: {
    isSecure: true,
    url: () => url(),
  },

  createCity: {
    isSecure: true,
    url: () => url(),
  },

  updateCity: {
    isSecure: true,
    url: () => url(),
  },

  getUniversityDetail: {
    isSecure: true,
    url: () => url(),
  },

  getAreaList: {
    isSecure: true,
    url: () => url(),
  },

  getAreaDetail: {
    isSecure: true,
    url: () => url(),
  },

  updateArea: {
    isSecure: true,
    url: () => url(),
  },

  createArea: {
    isSecure: true,
    url: () => url(),
  },

  getUniversityList: {
    isSecure: true,
    url: () => url(),
  },

  updateUniversity: {
    isSecure: true,
    url: () => url(),
  },

  createUniversity: {
    isSecure: true,
    url: () => url(),
  },

  updateLocationImage: {
    isSecure: true,
    url: () => url(),
  },

  createLocationImage: {
    isSecure: true,
    url: () => url(),
  },

  deletedLocationImage: {
    isSecure: true,
    url: () => url(),
  },
  getUploadVideoToken: {
    isSecure: true,
    url: () => url(),
  },
  checkVideoUploaded: {
    isSecure: true,
    url: () => url(),
  },
  createVideo: {
    isSecure: true,
    url: () => url(),
  },
  createProperty: {
    isSecure: true,
    url: () => url(),
  },
  commissionModal: {
    isSecure: true,
    url: () => url(),
  },

  depositUrl: {
    isSecure: true,
    url: () => url(),
  },

  recordModal: {
    isSecure: true,
    url: () => url(),
  },

  getLandlordProperties: {
    isSecure: true,
    url: () => url(),
  },
  getContractList: {
    isSecure: true,
    url: () => url(),
  },
  createContract: {
    isSecure: true,
    url: () => url(),
  },
  updateContract: {
    isSecure: true,
    url: () => url(),
  },
  deleteContract: {
    isSecure: true,
    url: () => url(),
  },
  updateContractFile: {
    isSecure: true,
    url: () => cmsFacadeUrl('/document'),
  },
  updatePendingNoteFile: {
    isSecure: true,
    url: () => cmsFacadeUrl('/opportunity_pending_note_file'),
  },
  getContractFile: {
    isSecure: true,
    url: () => authImageUrl('/apis/v1/properties/contract-img'),
  },
  getOpportunityNoteFile: {
    isSecure: true,
    url: () => authImageUrl('/apis/v1/properties'),
  },
  bulkDuallySigned: {
    isSecure: true,
    url: () => url(),
  },
  getLandlordList: {
    isSecure: true,
    url: () => url(),
  },
  getCmsUser: {
    isSecure: true,
    url: () => url(),
  },
  getGeneralUrl: {
    isSecure: true,
    url: () => url(),
  },
  getReferenceAndContact: {
    isSecure: true,
    url: () => url(),
  },
  getPropertyComments: {
    isSecure: true,
    url: () => url('/api/properties/properties/get-property-comments'),
  },
  expirePropertyDraft: {
    isSecure: true,
    url: () => url(),
  },
  getPropertyChangeLogs: {
    isSecure: true,
    url: () => url(),
  },
  getLandlords: {
    isSecure: true,
    url: () => url(),
  },
  getLandlord: {
    isSecure: true,
    url: () => url(),
  },
  createLandlord: {
    isSecure: true,
    url: () => url(),
  },
  updateLandlord: {
    isSecure: true,
    url: () => url(),
  },
  getPropertiesByLandlordSlug: {
    isSecure: true,
    url: () => url(),
  },
  searchPropertyNameList: {
    isSecure: true,
    url: () => url(),
  },
  getDisplayCountryList: {
    isSecure: true,
    url: () => url(),
  },
  updatePropertyDetails: {
    isSecure: true,
    url: () => url(),
  },
  updatePropertyInternalFields: {
    isSecure: true,
    url: () => url(),
  },
  deleteRoom: {
    isSecure: true,
    url: () => url(),
  },
  createRoom: {
    isSecure: true,
    url: () => url(),
  },
  getPropertyTerms: {
    isSecure: true,
    url: () => url(),
  },
  createPropertyTerms: {
    isSecure: true,
    url: () => url(),
  },
  updatePropertyTerms: {
    isSecure: true,
    url: () => url(),
  },
  deletePropertyTerms: {
    isSecure: true,
    url: () => url(),
  },
  uploadTermsFile: {
    isSecure: true,
    url: () => url(),
  },
};

export default endpoints;
