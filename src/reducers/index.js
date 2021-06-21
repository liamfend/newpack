import { combineReducers } from 'redux'
import authReducer from '~reducers/auth'
import propertyListReducer from '~reducers/properties/property-list'
import propertyEditReducer from '~reducers/properties/property-edit'
import listingManagementReducer from '~reducers/properties/listing-management'
import specialOffersListReducer from '~reducers/special-offer/offer-list'
import offerMapReducer from '~reducers/special-offer/offer-map'
import countryReducer from '~reducers/location/country'
import universityReducer from '~reducers/location/university'
import cityReducer from '~reducers/location/city'
import areaReducer from '~reducers/location/area'
import imageReducer from '~reducers/location/image'
import udeskReducer from '~reducers/udesk'
import commissionReducer from '~reducers/properties/commission'
import depositReducer from '~reducers/properties/deposit'
import contractReducer from '~reducers/contract/contract'
import accountReducer from '~reducers/account/account'
import referenceAndContactReducer from '~reducers/properties/reference-and-contact'
import pendingApprovalReducer from '~reducers/pending-approval'
import changeLogReducer from '~reducers/properties/change-log'
import recordReducer from '~reducers/properties/record'
import landlordReducer from '~reducers/landlord'
import reviewReducer from '~reducers/reviews'
import billingReducer from '~reducers/billing'
import reconciliationReducer from '~reducers/reconciliation'
import propertyTermsReducer from '~reducers/properties/terms'

const reducer = combineReducers({
  auth: authReducer,
  udesk: udeskReducer,
  dashboard: combineReducers({
    propertyList: propertyListReducer,
    propertyEdit: propertyEditReducer,
    specialOfferList: specialOffersListReducer,
    specialOfferMap: offerMapReducer,
    country: countryReducer,
    university: universityReducer,
    city: cityReducer,
    area: areaReducer,
    locationImage: imageReducer,
    contract: contractReducer,
    account: accountReducer,
    commissionReducer,
    depositReducer,
    referenceAndContact: referenceAndContactReducer,
    pendingApproval: pendingApprovalReducer,
    changeLog: changeLogReducer,
    recordReducer,
    landlord: landlordReducer,
    reviews: reviewReducer,
    listingManagement: listingManagementReducer,
    billing: billingReducer,
    reconciliation: reconciliationReducer,
    propertyTerms: propertyTermsReducer,
  }),
})

export default reducer
