import getEnvironment, { environments } from '~base/global/helpers/environment';

const getOldCMSHost = () => (getEnvironment() === environments.PROD ? '//cms.student.com' : 'storm-back-office.dandythrust.com');

const routing = {
  login: {
    path: 'login',
  },
  account: {
    path: 'account',
  },
  myProfile: {
    path: 'account/my-profile',
  },
  accountManagement: {
    path: 'account/account-management',
  },
  cities: {
    path: 'locations/cities',
  },
  areas: {
    path: 'locations/areas',
  },
  universities: {
    path: 'locations/universities',
  },
  billing: {
    path: 'billing',
    childRoutes: {
      transfers: {
        path: 'transfers',
      },
      transferDetail: {
        path: 'transfer/{id}/detail',
      },
      receivables: {
        path: 'receivables',
      },
      receiveDetail: {
        path: 'receive/{id}/detail',
      },
      refunds: {
        path: 'refunds',
      },
      refundDetail: {
        path: 'refund/{id}/detail',
      },
    },
  },
  reconciliation: {
    path: 'reconciliation',
    childRoutes: {
      view: {
        path: '/landlord/{id}',
      },
    },
  },
  city: {
    path: 'locations/city',
    childRoutes: {
      edit: {
        path: '{slug}/edit',
      },
    },
  },
  area: {
    path: 'locations/area',
    childRoutes: {
      edit: {
        path: '{slug}/edit',
      },
    },
  },
  university: {
    path: 'locations/university',
    childRoutes: {
      edit: {
        path: '{slug}/edit',
      },
    },
  },
  forgotPassword: {
    path: 'forgot-password/{email}',
  },
  forgotPasswordSuccess: {
    path: 'forgot-password/{email}/success',
  },
  resetPassword: {
    path: 'reset-password',
  },
  specialOffer: {
    path: 'special-offers',
    childRoutes: {
      create: {
        path: 'create',
      },
      edit: {
        path: 'edit/{id}',
      },
    },
  },
  property: {
    path: 'property',
    childRoutes: {
      edit: {
        path: '{propertySlug}/edit',
      },
      homepage: {
        path: '{propertySlug}/homepage',
      },
      commission: {
        path: '{propertySlug}/commission',
      },
      depositAndFees: {
        path: '{propertySlug}/deposit-and-fees',
      },
      create: {
        path: 'create',
      },
      record: {
        path: '{propertySlug}/record',
      },
      referenceAndContact: {
        path: '{propertySlug}/reference-and-contact',
      },
      changeLog: {
        path: '{propertySlug}/change-log',
        childRoutes: {
          listingManagement: {
            path: 'listing-management',
          },
          commissionManagement: {
            path: 'commission-management',
          },
          contractRecord: {
            path: 'contract-record',
          },
          policySetting: {
            path: 'policy-setting',
          },
          depositAndFees: {
            path: 'deposit-and-fees',
          },
        },
      },
      terms: {
        path: '{propertySlug}/terms',
      },
    },
  },
  properties: {
    path: 'properties',
    childRoutes: {
      create: {
        path: 'create',
      },
      listings: {
        path: '{propertySlug}/listings',
        childRoutes: {
          create: {
            path: 'create',
          },
        },
      },
      unitTypes: {
        path: '{propertySlug}/unit-types',
        childRoutes: {
          create: {
            path: 'create',
          },
        },
      },
      distinctions: {
        path: '{propertySlug}/distinctions',
        childRoutes: {
          create: {
            path: 'create',
          },
        },
      },
      classification: {
        path: '{propertySlug}/classification',
        childRoutes: {
          create: {
            path: 'create',
          },
        },
      },
    },
  },
  landlords: {
    path: 'landlords',
  },
  landlord: {
    path: 'landlord/{landlordSlug}',
  },
  oldCMSEdit: {
    path: `//${getOldCMSHost()}/admin/property/mstr/country/{countrySlug}/city/{citySlug}/property/{propertySlug}/edit`,
  },
  contract: {
    path: 'contract',
  },
  bookings: {
    path: 'bookings',
  },
  reviews: {
    path: 'reviews',
  },
  comments: {
    path: 'comments/{propertySlug}',
  },
};

export default routing;
