export const properties = variables => ({
  operationName: 'CMS_PropertiesView',
  variables,
  query: `
    query CMS_PropertiesView(
      $pageNumber: Int!,
      $pageSize: Int!,
      $sortBy: PropertySortBy,
      $sortDirection: SortDirection,
      $countrySlug: String,
      $citySlug: String,
      $landlordSlug: String,
      $statuses: [PropertyStatus!],
      $fullName: String,
      $propertyType: PropertyType,
    ) {
    properties(
      pageNumber: $pageNumber,
      pageSize: $pageSize,
      sortBy: $sortBy,
      sortDirection: $sortDirection,
      countrySlug: $countrySlug,
      citySlug: $citySlug,
      landlordSlug: $landlordSlug,
      statuses: $statuses
      fullName: $fullName,
      propertyType: $propertyType,
    ) {
      totalCount
      edges {
        node {
          name
          slug
          state
          reviewsSummary {
            averageRating
          }
          city {
            name
            country {
              name
            }
          }
          landlord {
            name
          }
          heroImage {
            source
          }
          status
          updatedAt
          updatedByUser {
            name
          }
        }
      }
    }
  }`,
});

export const specialOfferList = variables => ({
  operationName: 'listSpecialOffer',
  variables,
  query: `
    query listSpecialOffer( 
      $pageNumber: Int!,
      $pageSize: Int!,
      $sortBy: SpecialOfferSortBy,
      $sortDirection: SortDirection,
      $statuses: [SpecialOfferStatus!],
      $internalTitle: String,
      $propertyId: Int,
      $cityId: Int,
      $landlordId: Int,
      $universityId: Int,
      $offerType: OfferType,
      $ownerType: [OwnerType!],
    ) {
      specialOffers(
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        statuses: $statuses,
        internalTitle: $internalTitle,
        propertyId: $propertyId,
        cityId: $cityId,
        landlordId: $landlordId,
        universityId: $universityId,
        offerType: $offerType,
        ownerType: $ownerType,
      ) {
        pageInfo {
          numPages
        }
        totalCount
        edges {
          node {
            id
            title
            internalTitle
            createdAt
            notes
            startDate
            fulfillmentInstructions
            endDate
            description
            link
            amount
            maxBookings
            termsAndConditions
            minTenancyValue
            tenancyUnit
            exclusive
            ownerType
            locales
            offerType
            referralCode
            properties(pageNumber: 1, pageSize: 9999) {
              edges {
                node {
                  slug
                  name
                  id
                  landlord {
                    name
                  }
                  unitTypes {
                    edges {
                      node {
                        id
                        name
                      }
                    }
                  }
                }
              }
            }
            listings {
              edges {
                node {
                  id
                  moveIn
                  moveOut
                  type
                  unitType {
                    id
                    name
                    property {
                      slug
                      id
                      name
                      landlord {
                        name
                      }
                      unitTypes {
                        edges {
                          node {
                            id
                            name
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
            unitTypes {
              edges {
                node {
                  id
                  name
                  listings {
                    id
                    moveIn
                    moveOut
                    type
                  }
                  property {
                    slug
                    id
                    name
                    landlord {
                      name
                    }
                    unitTypes {
                      edges {
                        node {
                          id
                          name
                        }
                      }
                    }
                  }
                }
              }
            }
            cities {
              edges {
                node {
                  slug
                  name
                  id
                }
              }
            }
          }
        }
      }
    }
  `,
});

export const landlordOfferList = variables => ({
  operationName: 'listSpecialOffersForLandlord',
  variables,
  query: `query listSpecialOffersForLandlord($pageNumber: Int!, $pageSize: Int!, $sortBy: SpecialOfferSortBy, $sortDirection: SortDirection, $statuses: [SpecialOfferStatus!], $propertyId: Int, $cityId: Int, $title: String, $offerType: OfferType) {
    viewer {
      ... on LandlordContact {
        company {
          specialOffers(pageNumber: $pageNumber, pageSize: $pageSize, sortBy: $sortBy, sortDirection: $sortDirection, statuses: $statuses, propertyId: $propertyId, cityId: $cityId, title: $title, offerType: $offerType) {
            pageInfo {
              numPages
            }
            totalCount
            edges {
              node {
                id
                title
                createdAt
                notes
                startDate
                endDate
                description
                amount
                link
                locales
                offerType
                maxBookings
                termsAndConditions
                referralCode
                properties {
                  edges {
                    node {
                      slug
                      name
                      id
                      unitTypes {
                        edges {
                          node {
                            id
                            name
                            listings {
                              id
                              moveIn
                              moveOut
                              type
                            }
                          }
                        }
                      }
                    }
                  }
                }
                listings {
                  edges {
                    node {
                      id
                      moveIn
                      moveOut
                      type
                      unitType {
                        id
                        name
                        property {
                          slug
                          id
                          name
                          unitTypes {
                            edges {
                              node {
                                id
                                name
                                listings {
                                  id
                                  moveIn
                                  moveOut
                                  type
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                unitTypes {
                  edges {
                    node {
                      id
                      name
                      listings {
                        id
                        moveIn
                        moveOut
                        type
                      }
                      property {
                        slug
                        id
                        name
                        unitTypes {
                          edges {
                            node {
                              id
                              name
                              listings {
                                id
                                moveIn
                                moveOut
                                type
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
                cities {
                  edges {
                    node {
                      slug
                      name
                      id
                    }
                  }
                }
                universities {
                  edges {
                    node {
                      slug
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`,
});

export const getSpecialOffer = variables => ({
  operationName: 'GetSpecialOffer',
  variables,
  query: `query GetSpecialOffer($id: ID!) {
    node(id: $id) {
      ... on SpecialOffer {
        id
        title
        internalTitle
        createdAt
        notes
        startDate
        fulfillmentInstructions
        endDate
        description
        amount
        exclusive
        ownerType
        ipAddresses
        minTenancyValue
        tenancyUnit
        link
        locales
        offerType
        maxBookings
        termsAndConditions
        referralCode
        properties(pageNumber: 1, pageSize: 9999) {
          edges {
            node {
              slug
              name
              id
              landlord {
                name
              }
              unitTypes {
                edges {
                  node {
                    id
                    name
                    listings {
                      id
                      moveIn
                      moveOut
                      type
                    }
                  }
                }
              }
            }
          }
        }
        listings {
          edges {
            node {
              id
              moveIn
              moveOut
              type
              unitType {
                id
                name
                property {
                  slug
                  id
                  name
                  landlord {
                    name
                  }
                  unitTypes {
                    edges {
                      node {
                        id
                        name
                        listings {
                          id
                          moveIn
                          moveOut
                          type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        unitTypes {
          edges {
            node {
              id
              name
              listings {
                id
                moveIn
                moveOut
                type
              }
              property {
                slug
                id
                name
                landlord {
                  name
                }
                unitTypes {
                  edges {
                    node {
                      id
                      name
                      listings {
                        id
                        moveIn
                        moveOut
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cities {
          edges {
            node {
              slug
              name
              id
            }
          }
        }
        universities {
          edges {
            node {
              slug
              name
            }
          }
        }
      }
    }
  }`,
});

export const searchProperties = variables => ({
  operationName: 'search',
  variables,
  query: `query search($query:String, $pageNumber: Int, $pageSize: Int  ) {
    search(query: $query, pageSize: $pageSize, pageNumber: $pageNumber, publishedStatus: PUBLISHED) {
      totalCount
      edges {
        node {
          ...on Property {
            name
            slug,
            id,
            city {
              name
            },
            unitTypes {
              edges {
                node {
                  id
                  name
                  listings {
                    id
                    moveIn
                    moveOut
                  }
                }
              }
            }
          }
        }
      }
    }
  }`,
});

export const searchLandlordProperties = variables => ({
  operationName: 'listPropertiesForLandlord',
  variables,
  query: `query listPropertiesForLandlord($pageNumber: Int!, $pageSize: Int!) {
    viewer {
      ... on LandlordContact {
        company {
          properties(pageNumber: $pageNumber, pageSize: $pageSize) {
            edges {
              node {
                name
                slug
                id
                city {
                  name
                }
                unitTypes {
                  edges {
                    node {
                      id
                      name
                      listings {
                        id
                        moveIn
                        moveOut
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  }`,
});

/**
 * {
 *  id: "sf-123ksdf",
 * }
 *
 * @param variables
 */
export const deleteSpecialOffer = variables => ({
  operationName: 'deleteSpecialOffer',
  variables: {
    input: variables,
  },
  query: `mutation deleteSpecialOffer($input: deleteSpecialOfferInput!) {
      deleteSpecialOffer(input: $input) {
        deleteSpecialOfferId
      }
    }`,
});

export const updateSpecialOffer = variables => ({
  operationName: 'updateSpecialOffer',
  variables: {
    input: variables,
  },
  query: `mutation updateSpecialOffer($input: updateSpecialOfferInput!) {
    updateSpecialOffer(input:$input) {
      specialOffer {
        id
        title
        internalTitle
        createdAt
        notes
        startDate
        ipAddresses
        minTenancyValue
        tenancyUnit
        fulfillmentInstructions
        endDate
        description
        amount
        link
        locales
        offerType
        maxBookings
        termsAndConditions
        referralCode
        properties(pageNumber: 1, pageSize: 9999) {
          edges {
            node {
              slug
              id
              name
              unitTypes {
                edges {
                  node {
                    id
                    name
                    listings {
                      id
                      moveIn
                      moveOut
                      type
                    }
                  }
                }
              }
            }
          }
        }
        listings {
          edges {
            node {
              id
              moveIn
              moveOut
              type
              unitType {
                id
                name
                property {
                  slug
                  id
                  name
                  unitTypes {
                    edges {
                      node {
                        id
                        name
                        listings {
                          id
                          moveIn
                          moveOut
                          type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        unitTypes {
          edges {
            node {
              id
              name
              listings {
                id
                moveIn
                moveOut
                type
              }
              property {
                slug
                id
                name
                unitTypes {
                  edges {
                    node {
                      id
                      name
                      listings {
                        id
                        moveIn
                        moveOut
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cities {
          edges {
            node {
              slug
              name
              id
            }
          }
        }
        universities {
          edges {
            node {
              slug
              name
            }
          }
        }
      }
    }
  }`,
});
export const unLinkSpecialOffer = variables => ({
  operationName: 'unLinkSpecialOffer',
  variables: { input: variables },
  query: `mutation unLinkSpecialOffer($input: unLinkSpecialOfferInput!) {
    unLinkSpecialOffer(input:$input) {
      specialOffer {
        id
        title
        internalTitle
        minTenancyValue
        tenancyUnit
        createdAt
        notes
        startDate
        fulfillmentInstructions
        endDate
        description
        amount
        link
        locales
        offerType
        maxBookings
        termsAndConditions
        referralCode
        properties(pageNumber: 1, pageSize: 9999) {
          edges {
            node {
              slug
              id
              name
              unitTypes {
                edges {
                  node {
                    id
                    name
                    listings {
                      id
                      moveIn
                      moveOut
                      type
                    }
                  }
                }
              }
            }
          }
        }
        listings {
          edges {
            node {
              id
              moveIn
              moveOut
              type
              unitType {
                id
                name
                property {
                  slug
                  id
                  name
                  unitTypes {
                    edges {
                      node {
                        id
                        name
                        listings {
                          id
                          moveIn
                          moveOut
                          type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        unitTypes {
          edges {
            node {
              id
              name
              listings {
                id
                moveIn
                moveOut
                type
              }
              property {
                slug
                id
                name
                unitTypes {
                  edges {
                    node {
                      id
                      name
                      listings {
                        id
                        moveIn
                        moveOut
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cities {
          edges {
            node {
              slug
              name
              id
            }
          }
        }
        universities {
          edges {
            node {
              slug
              name
            }
          }
        }
      }
    }
  }`,
});

export const createSpecialOffer = variables => ({
  operationName: 'createSpecialOffer',
  variables: {
    input: variables,
  },
  query: `mutation createSpecialOffer($input: createSpecialOfferInput!) {
    createSpecialOffer(input: $input) {
      specialOffer {
        id
        title
        internalTitle
        minTenancyValue
        tenancyUnit
        createdAt
        notes
        startDate
        fulfillmentInstructions
        endDate
        description
        amount
        link
        locales
        offerType
        maxBookings
        termsAndConditions
        referralCode
        properties(pageNumber: 1, pageSize: 9999) {
          edges {
            node {
              slug
              id
              name
              unitTypes {
                edges {
                  node {
                    id
                    name
                    listings {
                      id
                      moveIn
                      moveOut
                      type
                    }
                  }
                }
              }
            }
          }
        }
        listings {
          edges {
            node {
              id
              moveIn
              moveOut
              type
              unitType {
                id
                name
                property {
                  slug
                  id
                  name
                  unitTypes {
                    edges {
                      node {
                        id
                        name
                        listings {
                          id
                          moveIn
                          moveOut
                          type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        unitTypes {
          edges {
            node {
              id
              name
              listings {
                id
                moveIn
                moveOut
                type
              }
              property {
                slug
                id
                name
                unitTypes {
                  edges {
                    node {
                      id
                      name
                      listings {
                        id
                        moveIn
                        moveOut
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cities {
          edges {
            node {
              slug
              name
              id
            }
          }
        }
        universities {
          edges {
            node {
              slug
              name
            }
          }
        }
      }
    }
  }`,
});

export const linkSpecialOffer = variables => ({
  operationName: 'linkSpecialOffer',
  variables: {
    input: variables,
  },
  query: `mutation linkSpecialOffer($input: linkSpecialOfferInput!) {
    linkSpecialOffer(input:$input) {
      specialOffer {
        id
        title
        internalTitle
        minTenancyValue
        tenancyUnit
        createdAt
        notes
        startDate
        fulfillmentInstructions
        endDate
        description
        amount
        link
        locales
        offerType
        maxBookings
        termsAndConditions
        referralCode
        properties(pageNumber: 1, pageSize: 9999) {
          edges {
            node {
              slug
              id
              name
              unitTypes {
                edges {
                  node {
                    id
                    name
                    listings {
                      id
                      moveIn
                      moveOut
                      type
                    }
                  }
                }
              }
            }
          }
        }
        listings {
          edges {
            node {
              id
              moveIn
              moveOut
              type
              unitType {
                id
                name
                property {
                  slug
                  id
                  name
                  unitTypes {
                    edges {
                      node {
                        id
                        name
                        listings {
                          id
                          moveIn
                          moveOut
                          type
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        unitTypes {
          edges {
            node {
              id
              name
              listings {
                id
                moveIn
                moveOut
                type
              }
              property {
                slug
                id
                name
                unitTypes {
                  edges {
                    node {
                      id
                      name
                      listings {
                        id
                        moveIn
                        moveOut
                        type
                      }
                    }
                  }
                }
              }
            }
          }
        }
        cities {
          edges {
            node {
              slug
              name
              id
            }
          }
        }
        universities {
          edges {
            node {
              slug
              name
            }
          }
        }
      }
    }
  }`,
});

export const classificationList = variables => ({
  operationName: 'CMS_ClassificationList',
  variables,
  query: `
    query CMS_ClassificationList(
      $propertySlug: String,
      $pageNumber: Int!,
      $pageSize: Int!,
      $sortBy: ClassificationSortBy,
      $sortDirection: SortDirection
    ) {
      property(slug: $propertySlug){
        id
        name
        slug
        classifications(
          pageNumber: $pageNumber,
          pageSize: $pageSize,
          sortBy: $sortBy,
          sortDirection: $sortDirection
        ) {
          totalCount
          edges {
            node {
              id
              name
              updatedAt
              unitTypes {
                id
                name
              }
            }
          }
        }
        unitTypes(pageNumber: 1, pageSize: 9999) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }`,
});

/**
 * {
 *  propertyId: "sf-123ksdf",
 *  name: "sdfks fjas"
 * }
 *
 * @param variables
 */
export const createClassification = variables => ({
  operationName: 'CMS_CreateClassification',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateClassification($input: CreateClassificationInput!) {
      createClassification(input: $input) {
        classification {
          id
          name
          updatedAt
        }
      }
    }`,
});

/**
 * {
 *  id: "sf-123sdfsdfsd23423ksdf",
 *  name: "sdfks fjas"
 * }
 *
 * @param variables
 */
export const updateClassification = variables => ({
  operationName: 'CMS_UpdateClassification',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateClassification($input: UpdateClassificationInput!) {
      updateClassification(input: $input) {
        classification {
          id
          name
          updatedAt
        }
      }
    }`,
});

/**
 * {
 *  id: "sf-123ksdf",
 * }
 *
 * @param variables
 */
export const deleteClassification = variables => ({
  operationName: 'CMS_DeleteClassification',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeleteClassification($input: DeleteClassificationInput!) {
      deleteClassification(input: $input) {
        deletedClassificationId
      }
    }`,
});

/**
 * {
 *  "classificationId": "sfkasdf-234123",
 *  "unitTypeId": "sdf39-943k34nf"
 * }
 * @param variables
 */
export const addClassificationToUnitType = variables => ({
  operationName: 'CMS_AddClassificationToUnitType',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_AddClassificationToUnitType($input: AddClassificationToUnitTypeInput!) {
      addClassificationToUnitType(input: $input) {
        classification {
          id
          unitTypes {
            id
            name
          }
        }
      }
    }`,
});

/**
 * {
 *  "classificationId": "sfkasdf-234123",
 *  "unitTypeId": "sdf39-943k34nf"
 * }
 * @param variables
 */
export const removeClassificationFromUnitType = variables => ({
  operationName: 'CMS_RemoveClassificationFromUnitType',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_RemoveClassificationFromUnitType($input: RemoveClassificationFromUnitTypeInput!) {
      removeClassificationFromUnitType(input: $input) {
        classification {
          id
          unitTypes {
            id
            name
          }
        }
      }
    }`,
});

/**
 *
 * @param variables
 */
export const distinctionsList = variables => ({
  operationName: 'CMS_DistinctionsList',
  variables,
  query: `
    query CMS_DistinctionsList(
      $propertySlug: String,
      $pageNumber: Int!,
      $pageSize: Int!,
      $sortBy: PropertyDistinctionSortBy,
      $sortDirection: SortDirection,
      $typeIds: [ID!]
    ) {
      property(slug: $propertySlug){
        id
        name
        slug
        unitTypes(pageNumber: 1, pageSize: 9999) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }`,
});

/**
 * {
 *  id: "sdfsdfs990-123"
 * }
 * @param variables
 */
export const deleteDistinction = variables => ({
  operationName: 'CMS_DeletePropertyDistinction',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeletePropertyDistinction($input: DeletePropertyDistinctionInput!) {
      deletePropertyDistinction(input: $input) {
        deletedPropertyDistinctionId
      }
    }`,
});

export const unitTypesList = variables => ({
  operationName: 'CMS_UnitTypesList',
  variables,
  query: `
    query CMS_UnitTypesList(
      $propertySlug: String,
      $pageNumber: Int!,
      $pageSize: Int!,
      $sortBy: UnitTypeSortBy,
      $sortDirection: SortDirection,
      $name: String,
      $categories: [UnitTypeCategory!],
      $classificationIds: [ID!],
      $arrangements: [RoomArrangement!],
      $hasListing: Boolean
    ) {
      property(slug: $propertySlug){
        id
        name
        slug
        unitTypes(
          pageNumber: $pageNumber,
          pageSize: $pageSize,
          sortBy: $sortBy,
          sortDirection: $sortDirection,
          name: $name,
          categories: $categories,
          classificationIds: $classificationIds,
          arrangements: $arrangements,
          hasListing: $hasListing
        ) {
          totalCount
          edges {
            node {
              id
              name
              category
              roomArrangement
              bedCount
              bathroomCount
              bathroomType
              kitchenCount
              bedroomCountMin
              bedroomCountMax
              maxOccupancy
              genderMix
              dietaryPreference
              smokingPreference
              classification {
                id
                name
              }
              updatedAt
            }
          }
        }
        classifications(pageNumber:1, pageSize: 9999) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }`,
});

/**
 * {
 *    "propertyId": "sfdk323432",
 *    "name": "Single studio",
 *    "category": "ENSUITE_ROOM",
 *    "roomArrangement": "CLUSTER",
 *    "floorplanArea": 3,
 *    "floorplanAreaDisplayUnit": "M2",
 *    "bedCount": 123,
 *    "bathroomType": "PRIVATE_ENSUITE",
 *    "bathroomCount": 123,
 *    "kitchenCount": 44,
 *    "bedroomCountMin": 12,
 *    "bedroomCountMax": 44,
 *    "maxOccupancy": 123,
 *    "genderMix": "MALE_ONLY",
 *    "dietaryPreference": "VEGETARIAN",
 *    "smokingPreference": "NON_SMOKING",
 *    "classificationId": "sdf23423",
 *    "propertyDistinctionIds": ["sfsd", "sd234234"]
 *  }
 * @param variables
 */
export const createUnitType = variables => ({
  operationName: 'CMS_CreateUnitType',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateUnitType($input: CreateUnitTypeInput!) {
      createUnitType(input: $input) {
        unitType {
          id
          name
        }
      }
    }`,
});

/**
 * {
 *    "unitTypeId": "jksdf00202-12312",
 *    "name": "Single studio",
 *    "category": "ENSUITE_ROOM",
 *    "roomArrangement": "CLUSTER",
 *    "floorplanArea": 3,
 *    "floorplanAreaDisplayUnit": "M2",
 *    "bedCount": 123,
 *    "bathroomType": "PRIVATE_ENSUITE",
 *    "bathroomCount": 123,
 *    "kitchenCount": 44,
 *    "bedroomCountMin": 12,
 *    "bedroomCountMax": 44,
 *    "maxOccupancy": 123,
 *    "genderMix": "MALE_ONLY",
 *    "dietaryPreference": "VEGETARIAN",
 *    "smokingPreference": "NON_SMOKING",
 *    "classificationId": "sdf23423",
 *    "propertyDistinctionIds": ["sfsd", "sd234234"]
 * }
 * @param variables
 */
export const updateUnitType = variables => ({
  operationName: 'CMS_UpdateUnitType',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateUnitType($input: UpdateUnitTypeInput!) {
      updateUnitType(input: $input) {
        unitType {
          id
          name
        }
      }
    }`,
});

/**
 * {
 *  "id": "sdf-123j123"
 * }
 * @param variables
 */
export const deleteUnitType = variables => ({
  operationName: 'CMS_DeleteUnitType',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeleteUnitType($input: DeleteUnitTypeInput!) {
      deleteUnitType(input: $input) {
        deletedUnitTypeId
      }
    }`,
});

export const roomListing = variables => ({
  operationName: 'CMS_RoomListing',
  variables,
  query: `
    query CMS_RoomListing(
      $propertySlug: String,
      $pageNumber: Int!,
      $pageSize: Int!,
      $sortBy: ListingSortBy,
      $sortDirection: SortDirection,
      $unitTypeIds: [ID!],
      $availabilities: [Availability!]
      $hasListing: Boolean
    ) {
      property(slug: $propertySlug){
        id
        name
        slug
        currency
        billingCycle
        listings(
          pageNumber: $pageNumber,
          pageSize: $pageSize,
          sortBy: $sortBy,
          sortDirection: $sortDirection,
          unitTypeIds: $unitTypeIds,
          availabilities: $availabilities
        ) {
          totalCount
          edges {
            node {
              id
              unitType {
                id
                name
              }
              type
              discountType
              discountValue
              moveIn
              moveOut
              priceMin
              priceMax
              availability
              liveOn
              liveUntil
              autoPriceAllowed
              autoAvailAllowed
              updatedAt
            }
          }
        }
        unitTypes(pageNumber:1, pageSize:9999, hasListing: $hasListing) {
          edges {
            node {
              id
              name
            }
          }
        }
      }
    }`,
});

/**
 * {
 *  "autoAvailAllowed": false,
 *   "autoPriceAllowed": false,
 *   "availability": "GOOD",
 *   "liveOn": "2017-09-01",
 *   "liveUntil": "2017-09-02",
 *   "maxPrice": 123,
 *   "minPrice": 111,
 *   "moveIn": "2017-09-01",
 *   "moveOut": "2017-09-02",
 *   "type": "FIXED",
 *   "unitTypeId": "4cafa23d-3672-4d53-8168-c9a8b9890e86"
 *  }
 * @param variables
 */
export const createRoomListing = variables => ({
  operationName: 'CMS_CreateRoomListing',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateRoomListing($input: CreateListingInput!) {
      createListing(input: $input) {
        listing {
          id
          type
        }
      }
    }`,
});

/**
 * {
 *   "listingId": "sdfjskdfs",
 *   "autoAvailAllowed": false,
 *   "autoPriceAllowed": false,
 *   "availability": "GOOD",
 *   "liveOn": "2017-09-01",
 *   "liveUntil": "2017-09-02",
 *   "maxPrice": 123,
 *   "minPrice": 111,
 *   "moveIn": "2017-09-01",
 *   "moveOut": "2017-09-02",
 *   "type": "FIXED"
 * }
 * @param variables
 */
export const updateRoomListing = variables => ({
  operationName: 'CMS_UpdateRoomListing',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateRoomListing($input: UpdateListingInput!) {
      updateListing(input: $input) {
        listing {
          id
          type
        }
      }
    }`,
});

/**
 * {
 *  "id": "sdf-123j123"
 * }
 * @param variables
 */
export const deleteRoomListing = variables => ({
  operationName: 'CMS_DeleteRoomListing',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeleteRoomListing($input: DeleteListingInput!) {
      deleteListing(input: $input) {
        deletedListingId
      }
    }`,
});

export const search = (variables, type) => {
  let query = `
    ... on Property {
      type: __typename
      slug
      name
      status,
      id
      city {
        name
        id
        country {
          name
        }
      }
    },
    ... on Country {
      type: __typename
      slug
      name
      id
    },
    ... on City {
      type: __typename
      slug
      id
      name
      published
      country {
        name
      }
    },
    ... on Landlord {
      type: __typename
      slug
      id
      name
    }`;

  if (type && type !== 'city') {
    query = `
      ... on ${type[0].toUpperCase() + type.slice(1)} {
        type: __typename
        slug
        name
        id
      }`;
  }

  if (type && type === 'city') {
    query = `
      ... on ${type[0].toUpperCase() + type.slice(1)} {
        type: __typename
        slug
        name
        id
        published
        country {
          name
          currencyCode
          billingCycle
        }
      }`;
  }

  return {
    operationName: 'CMS_Search',
    variables,
    query: `
      query CMS_Search($query: String, $pageNumber: Int, $pageSize: Int) {
        search(query: $query, pageNumber: $pageNumber, pageSize: $pageSize, publishedStatus: ${
  variables.publishedStatus ? variables.publishedStatus : 'ALL'
}) {
          totalCount
          edges {
            node {
              ${query}
            }
          }
        }
      }
    `,
  };
};

export const searchUniversity = variables => ({
  operationName: 'CMS_Search',
  variables,
  query: `
    query CMS_Search($query: String, $pageNumber: Int, $pageSize: Int) {
      search(query: $query, pageNumber: $pageNumber, pageSize: $pageSize, publishedStatus: PUBLISHED) {
        totalCount
        edges {
          node {
            ... on University{
              id
              published
              name
              slug
            }
          }
        }
      }
    }
  `,
});

export const studentDetail = variables => ({
  operationName: 'UDESK_StudentDetail',
  variables,
  query: `
    query UDESK_StudentDetail(
      $userUuid: String,
      $wechatId: String,
      $phone: String,
    ) {
      getStudentDetails(
        userUuid: $userUuid,
        wechatId: $wechatId,
        phone: $phone
      ){
        userUuid
        firstName
        lastName
        language
        nationality
        emailAddress
        phoneNumber
        destinationUniversity
      }
    }`,
});

export const checkPropertySlug = variables => ({
  operationName: 'CMS_PropertySlugCheck',
  variables,
  query: `
  query CMS_PropertySlugCheck(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
      id
      slug
      name
    }
  }
  `,
});

export const getPropertyDetail = variables => ({
  operationName: 'CMS_PropertyDetail',
  variables,
  query: `
  query CMS_PropertyDetail(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
    country
    drafts(sortBy: UPDATED_AT, pageSize: 9999) {
      edges {
        node {
          id
          status
          updatedAt
          changes
          category
          createdUser {
            firstName
            lastName
            email
          }
          comments {
            comment
            id
            section
          }
          image {
            id
            discriminator
            category
            size
            extension
            contentType
            hero
            path
            position
            source
            filename
            imageHash
            status
            unitTypeId
            width
            height
          }
          video {
            id
            path
            transcodedStatus
            links {
              hls
              hqMp4
              lqMp4
              thumbnail
            }
            locales
            category
            position
            size
            unitTypeId
            videoHash
            fileName
            extension
            transcodeJobId
            transcodeJobStatus
            status
          }
          propertyLink {
            area
            displayRegion
            id
            link
            type
            propertyId
            status
          }
          unitTypeLink {
            displayRegion
            id
            link
            type
            status
            unitTypeId
          }
        }
      }
    }
    universities {
      name
      slug
      id
    }
    name
    slug
    id
    city {
      name
      longitude
      latitude
      id
      slug
      country {
        name
        slug
      }
      areas{
        totalCount
        edges{
          node{
            id
            name
            slug
            originalName
          }
        }
      }
      published
    }
    status
    currency
    billingCycle
    address
    addressLine2
    shippingCity
    zipCode
    area{
      id,
      name
    }
    latitude
    longitude
    allLinks {
      area
      displayRegion
      id
      link
      propertyId
      status
      type
    }
    feedControlled
    description
    descriptionCn
    headline
    headlineCn
    minPrice
    facilities {
      label
      slug
      group
      checked
      rank
      tags
    }
    cancellationChecked
    noPlaceNoPay
    noVisaNoPay
    covid19Policy
    cancellationProcess
    freeCancellationPeriod
    cancellationPeriod
    tenancyAgreement {
      calculateType
      field
      timeType
      unit
      value
      id
    }
    totalBeds
    landlord {
      id
      name
      bookingJourney
    }
    address
    rank
    rankWeight
    rankStar
    rankBlacksheep
    bookingType
    contractStage
    allVideos {
      id
      path
      transcodedStatus
      links {
        hls
        hqMp4
        lqMp4
        thumbnail
      }
      locales
      category
      position
      size
      unitTypeId
      videoHash
      fileName
      extension
      transcodeJobId
      transcodeJobStatus
      status
    }
    allImages {
      edges {
        node {
          id
          discriminator
          category
          height
          width
          size
          extension
          contentType
          hero
          path
          position
          source
          filename
          imageHash
          status
        }
      }
    }
    unitTypes {
      edges{
        node {
          id
          name
          category
          roomSize
          roomType
          viewType
          bedCount
          kitchenArrangement
          maxOccupancy
          dualOccupancy
          bathroomType
          floors
          bedSizeType
          unitTypeBedSizes{
            id
            type
            length
            width
            bedCount
          }
          facilities{
            slug
            label
            group
            checked
          }
          lastFurnished
          roomArrangement
          bedroomCountMin
          bedroomCountMax
          bedCount
          bathroomCount
          kitchenCount
          genderMix
          dietaryPreference
          smokingPreference
          genderMix
          smokingPreference
          dietaryPreference
          updatedAt
          allLinks {
            displayRegion
            id
            link
            status
            type
            unitTypeId
          }
          listings {
            id
            type
            priceMin
            priceMax
            tenancyLengthType
            tenancyLengthValue
            availability
            liveOn
            liveUntil
            autoPriceAllowed
            autoAvailAllowed
            discountType
            discountValue
            updatedAt
            moveIn
            moveInType
            moveOut
            moveOutType
          }
          allVideos {
            id
            path
            transcodedStatus
            links {
              hls
              hqMp4
              lqMp4
              thumbnail
            }
            category
            locales
            position
            size
            unitTypeId
            videoHash
            fileName
            extension
            transcodeJobId
            transcodeJobStatus
            status
          }
          allImages {
            edges {
              node {
                id
                discriminator
                height
                width
                size
                extension
                contentType
                hero
                path
                position
                source
                filename
                imageHash
                status
              }
            }
          }
        }
      }
    }
    }
  }
  `,
});

export const getPropertyChangeLogs = variables => ({
  operationName: 'CMS_PropertyChangeLogs',
  variables,
  query: `
  query CMS_PropertyChangeLogs(
    $slug: String,
    $changeBys: [String!],
    $createdAtAfter: Date,
    $createdAtBefore: Date,
    $entryTypes: [EntryType!],
    $modelIds: [Int!],
    $models: [AuditPropertyModel!],
    $pageNumber: PositiveInteger,
    $pageSize: PositiveInteger,
    $sortBy: AuditPropertySortBy ,
    $sortDirection: SortDirection,
  ) {
    property(
      slug: $slug,
    ) {
      auditProperties (
        changeBys: $changeBys,
        createdAtAfter: $createdAtAfter,
        createdAtBefore: $createdAtBefore,
        entryTypes: $entryTypes,
        modelIds: $modelIds,
        models: $models,
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        sortBy: $sortBy ,
        sortDirection: $sortDirection
      ) {
        totalCount
        edges {
          node {
            changeByUser {
              firstName
              lastName
            }
            changes
            createdAt
            entryType
            id
            model
            modelId
          }
        }
      }
    }
  }`,
});

export const getPropertyComments = variables => ({
  operationName: 'CMS_PropertyComments',
  variables,
  query: `
  query CMS_PropertyComments(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
      drafts {
        edges {
          node {
            status
            comments {
              comment
              id
              section
            }
          }
        }
      }
    }
  }
  `,
});

// "input": {
//   "id": "eyJpZCI6IDEsICJ0eXBlIjogIlByb3BlcnR5In0=",
//   "name": "name",
//   "slug": "name_slug",
//   "totalBeds": 100,
//   "descriptionEn": "descriptionEn",
//   "description": "description",
//   "freeCancellationPeriod": "freeCancellationPeriod",
//   "cancellationProcess": "cancellationProcess",
//   "address": "address",
//   "addressLine_2": "addressLine_2",
//   "postalCode": "postalCode",
//   "areaId": 1,
//   "latitude": 1.1,
//   "longitude": 1.2,
//   "url": "www.baidu.com",
//   "landlordPhotograpyUrl": "www.baidu.com",
//   "roomMatrixUrl": "www.baidu.com",
//   "rank": 10,
//   "rankWeight": 10,
//   "rankType": "STAR",
//   "links": [
//     {
//       "link": "www.student.com",
//       "type": "vr",
//       "displayRegion": "ALL",
//       "enabled": true
//     }
//   ],
//   "contacts": [
//       {
//       "contactName": "contact_name_2",
//       "contactPhone": "contact_phone",
//       "contactEmail": "contact_email"
//     }
//   ],
//   "facilities": [
//         {
//           "slug":"wifi"
//     },
//     {
//           "slug":"cooking_facilities"
//     }
//       ]
//    }
export const updateProperty = variables => ({
  operationName: 'CMS_UpdateProperty',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateProperty($input: UpdatePropertyInput!) {
      updateProperty (input:$input) {
        property {
          universities {
            name
            slug
            id
          }
          name
          slug
          id
          status
          currency
          billingCycle
          address
          addressLine2
          zipCode
          tenancyAgreement {
            calculateType
            field
            timeType
            unit
            value
            id
          }
          area{
            id,
            name
          }
          drafts {
            edges {
              node {
                id
                status
              }
            }
          }
          latitude
          longitude
          links {
            area
            displayRegion
            enabled
            id
            link
            type
            label
            propertyId
          }
          feedControlled
          description
          descriptionCn
          headline
          headlineCn
          minPrice
          facilities {
            label
            slug
            group
            checked
            rank
            tags
          }
          cancellationChecked
          cancellationProcess
          freeCancellationPeriod
          cancellationPeriod
          totalBeds
          landlord {
            name
          }
          address
          shippingCity
          url
          landlordPhotograpyUrl
          roomMatrixUrl
          rank
          rankWeight
          rankStar
          rankBlacksheep
          bookingType
          propertyContacts {
            id
            contactName
            contactPhone
            contactEmail
          }
          contentContactName
          videos {
            id
            path
            transcodedStatus
            links {
              hls
              hqMp4
              lqMp4
              thumbnail
            }
            category
            locales
            position
            size
            unitTypeId
            videoHash
            extension
            transcodeJobId
            transcodeJobStatus
          }
          images {
            edges {
              node {
                id
                discriminator
                category
                height
                width
                size
                extension
                contentType
                hero
                path
                position
                source
                filename
                imageHash
              }
            }
          }
          unitTypes {
            edges{
              node {
                id
                name
                category
                roomSize
                roomType
                viewType
                bedCount
                kitchenArrangement
                maxOccupancy
                dualOccupancy
                bathroomType
                floors
                bedSizeType
                unitTypeBedSizes{
                  id
                  type
                  length
                  width
                  bedCount
                }
                facilities{
                  slug
                  label
                  group
                  checked
                }
                lastFurnished
                roomArrangement
                bedroomCountMin
                bedroomCountMax
                bedCount
                bathroomCount
                kitchenCount
                genderMix
                dietaryPreference
                smokingPreference
                genderMix
                smokingPreference
                dietaryPreference
                updatedAt
                links {
                  displayRegion
                  enabled
                  id
                  link
                  type
                  unitTypeId
                }
                listings {
                  id
                  type
                  priceMin
                  priceMax
                  tenancyLengthType
                  tenancyLengthValue
                  availability
                  liveOn
                  liveUntil
                  autoPriceAllowed
                  autoAvailAllowed
                  discountType
                  discountValue
                  updatedAt
                  moveIn
                  moveInType
                  moveOut
                  moveOutType
                }
                videos {
                  id
                  path
                  transcodedStatus
                  links {
                    hls
                    hqMp4
                    lqMp4
                    thumbnail
                  }
                  category
                  locales
                  position
                  size
                  unitTypeId
                  videoHash
                  extension
                  transcodeJobId
                  transcodeJobStatus
                }
                images {
                  edges {
                    node {
                      id
                      discriminator
                      height
                      width
                      size
                      extension
                      contentType
                      hero
                      path
                      position
                      source
                      filename
                      imageHash
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
});

export const publishProperty = variables => ({
  operationName: 'CMS_PublishProperty',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_PublishProperty($input: PublishPropertyInput!) {
      publishProperty(input: $input) {
        status
        statusCode
        error
        description
      }
    }
  `,
});

export const getPropertyNote = variables => ({
  operationName: 'CMS_PropertyNote',
  variables,
  query: `
  query CMS_PropertyNote(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
    name
    slug
    id
    commissionTierCount(statuses: [INACTIVE, ACTIVE]) 
    city {
      slug
      country {
        slug
      }
    }
    notes {
      id
      propertyId
      updatedBy
      oldContractStage
      newContractStage
      updatedUser {
        firstName
        lastName 
      }
      title
      description
      createdAt
      updatedAt
    }
    contracts {
      files {
        contentType
        contractId
        createdAt
        id
        name
        source
        updatedAt
      }
    }
    status
    contractStage
    }
    }
  }
  `,
});

export const getPropertyDepositePayment = variables => ({
  operationName: 'CMS_PropertyDetail',
  variables,
  query: `
  query CMS_PropertyDetail(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
    name
    slug
    id
    city {
      slug
      country {
        slug
      }
    }
    acceptsDepositPayment
    paymentsEnabled
    paymentProcess
    status
    landlord {
      bookingJourney
    }
    paymentDepositRules {
      edges{
        node{
          firstInstalment
          id
          name
          paymentProcessingFee
          type
          value
          updatedAt
        }
      }
    }
    }
  }
  `,
});

export const getPropertyCommissionTiers = variables => ({
  operationName: 'CMS_PropertyCommissionTiers',
  variables,
  query: `
  query CMS_PropertyCommissionTiers(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
    name
    slug
    id
    currency
    landlord {
      slug
    }
    city {
      slug
      country {
        slug
      }
    }
    commissionTiers {
      id
      category
      name
      value
      status
      bonus
      bookingCountFrom
      bookingCountTo
      capType
      capValue
      checkInDateFrom
      checkInDateTo
      convertedCalculationValue
      description
      effectiveFrom
      effectiveTo
      fullyCalculatable
      percentageForReport
      retrospectiveCommission
      tenancyLengthFrom
      tenancyLengthTo
      tenancyUnit
      type
      updatedAt
    }
    status
    }
  }
  `,
});

export const queryCity = variables => ({
  operationName: 'CMS_QueryCity',
  variables,
  query: `
  query CMS_QueryCity($slug: String){
    city(slug: $slug){
      id
      name
      slug
    }
  }`,
});

export const queryCountry = variables => ({
  operationName: 'CMS_QueryCountry',
  variables,
  query: `
  query CMS_QueryCountry($slug: String){
    country(slug: $slug){
      id
      name
      slug
    }
  }`,
});
export const queryLandlord = variables => ({
  operationName: 'CMS_QueryLandlord',
  variables,
  query: `
  query CMS_QueryLandlord($slug: String){
    landlord(slug: $slug){
      id
      name
      slug
    }
  }`,
});

/**
 * {
 *  "pageNumber": 1,
 *   "pageSize": 20,
 *   "sortBy": "slug",
 *   "sortDirection": "ASCENDING",
 *   "countrySlugs": ['ta'],
 *   "billingCycle": [WEEKLY],
 *  }
 * @param variables
 */

export const countries = variables => ({
  operationName: 'CMS_CountriesView',
  variables,
  query: `
    query CMS_CountriesView(
      $pageNumber: Int!,
      $pageSize: Int!,
      $countrySlugs: [String!],
      $billingCycle: [BillingCycle!],
      $sortBy: CountrySortBy,
      $sortDirection: SortDirection,
    ) {
      countries(
      pageNumber: $pageNumber,
      pageSize: $pageSize,
      countrySlugs: $countrySlugs,
      billingCycle: $billingCycle,
      sortBy: $sortBy,
      sortDirection: $sortDirection,
      publishedStatus: ALL
    ) {
      pageInfo {
        numPages
      }
      totalCount
      edges {
        node {
          billingCycle
          countryCode
          currencyCode
          id
          name
          originalName
          slug
          properties
          publishedProperties
        }
      }
    }
  }`,
});

export const noPropertiescountries = variables => ({
  operationName: 'CMS_NoPropertiesCountriesView',
  variables,
  query: `
    query CMS_NoPropertiesCountriesView(
      $pageNumber: Int!,
      $pageSize: Int!,
      $sortBy: CountrySortBy,
      $sortDirection: SortDirection,
    ) {
      countries(
      pageNumber: $pageNumber,
      pageSize: $pageSize,
      sortBy: $sortBy,
      sortDirection: $sortDirection,
    ) {
      pageInfo {
        numPages
      }
      totalCount
      edges {
        node {
          id
          name
          originalName
          slug
        }
      }
    }
  }`,
});

/**
 * {
 *   "slug": "slug",
 *  }
 * @param variables
 */

export const city = variables => ({
  operationName: 'CMS_CityView',
  variables,
  query: `
    query CMS_CityView(
      $slug: String,
    ) {
      city(
      slug: $slug,
    ) {
      id
      name
      areas(pageNumber: 1,pageSize: 10){
        totalCount
      }
      universities(pageNumber: 1,pageSize: 10){
        totalCount
      }
      properties
      country {
        name
        slug
      }
      areas(pageNumber: 1,pageSize: 10){
        totalCount
      }
      universities(pageNumber: 1,pageSize: 10){
        totalCount
      }
      slug
      published
      latitude
      longitude
      headline
      summary
      rank
      publishedProperties
      heroImage {
        id
        filename
        extension
        imageHash
        source
      }
      smallHeroImage {
        id
        filename
        extension
        imageHash
        source
      }
      seoTemplate {
        metaDescription
        metaKeywords
        metaTitle
        srpIntroHeadline
        srpIntroParagraph
      }
      srpIntroHeadline
      srpIntroHeadlineEnabled
      srpIntroParagraph
      srpIntroParagraphEnabled
      metaDescription
      metaDescriptionEnabled
      metaKeywords
      metaKeywordsEnabled
      metaTitle
      metaTitleEnabled
    }
  }`,
});

/**
 * {
 *   pageNumber: Int = 1
 *   pageSize: Int = 10
 *   sortBy: $sortBy,
 *   sortDirection: $sortDirection,
 *   slugs: ['london'],,
 *   countrySlugs: ['ta'],,
 *  }
 * @param variables
 */

export const cities = variables => ({
  operationName: 'CMS_CitiesView',
  variables,
  query: `
    query CMS_CitiesView(
      $pageNumber: Int,
      $pageSize: Int,
      $countrySlugs: [String!],
      $slugs: [String],
      $sortBy:  PropertySortBy,
      $sortDirection: SortDirection,
    ) {
      cities(
      pageNumber: $pageNumber,
      pageSize: $pageSize,
      countrySlugs: $countrySlugs,
      slugs: $slugs,
      sortBy: $sortBy,
      sortDirection: $sortDirection,
      publishedStatus: ALL
    ) {
      pageInfo {
        numPages
      }
      totalCount
      edges {
        node {
          slug
          id
          name
          originalName
          published
          properties
          publishedProperties
          country {
            id
            name
            slug
            originalName
          }
          latitude
          longitude
          headline
          summary
          rank
          heroImage {
            id
            filename
            extension
            imageHash
            source
          }
          smallHeroImage {
            id
            filename
            extension
            imageHash
            source
          }
          seoTemplate {
            metaDescription
            metaKeywords
            metaTitle
            srpIntroHeadline
            srpIntroParagraph
          }
          srpIntroHeadline
          srpIntroHeadlineEnabled
          srpIntroParagraph
          srpIntroParagraphEnabled
          metaDescription
          metaDescriptionEnabled
          metaKeywords
          metaKeywordsEnabled
          metaTitle
          metaTitleEnabled
        }
      }
    }
  }`,
});

/**
 * {
 *   pageNumber: Int = 1
 *   pageSize: Int = 10
 *   publishedStatus: NodePublishedFilter = All
 *   query: String
 *  }
 * @param variables
 */

export const universities = variables => ({
  operationName: 'CMS_UniversitiesView',
  variables,
  query: `
    query CMS_UniversitiesView(
      $pageNumber: Int,
      $pageSize: Int,
      $citySlugs: [String!],
      $slugs: [String!],
      $sortBy:  PropertySortBy,
      $sortDirection: SortDirection,
    ) {
      universities(
      pageNumber: $pageNumber,
      pageSize: $pageSize,
      citySlugs: $citySlugs,
      slugs: $slugs,
      sortBy: $sortBy,
      sortDirection: $sortDirection,
      publishedStatus: ALL
    ) {
      pageInfo {
        numPages
      }
      totalCount
      edges {
        node {
          slug
          id
          name
          originalName
          published
          commonNames
          commonNamesCount
          city {
            id
            name
            slug
            originalName
          }
          headline
          heroImage {
            id
            filename
            extension
            imageHash
            source
          }
          metaDescription
          metaDescriptionEnabled
          metaKeywords
          metaKeywordsEnabled
          metaTitle
          metaTitleEnabled
          rank
          seoTemplate {
            metaDescription
            metaKeywords
            metaTitle
            srpIntroHeadline
            srpIntroParagraph
          }
          smallHeroImage {
            id
            filename
            extension
            imageHash
            source
          }
          srpIntroHeadline
          srpIntroHeadlineEnabled
          srpIntroParagraph
          srpIntroParagraphEnabled
          summary
          address
          latitude
          longitude
          zipCode
        }
      }
    }
  }
    `,
});

/**
 * {
 *   "slug": "slug",
 *  }
 * @param variables
 */
export const university = variables => ({
  operationName: 'CMS_UniversityView',
  variables,
  query: `
    query CMS_UniversityView(
      $slug: String,
    ) {
      university(
      slug: $slug,
    ) {
      id
      name
      country {
        name
        slug
      }
      city {
        name
        slug
      }
      slug
      published
      latitude
      longitude
      headline
      summary
      rank
      zipCode
      address
      commonNames
      heroImage {
        id
        filename
        extension
        imageHash
        source
      }
      smallHeroImage {
        id
        filename
        extension
        imageHash
        source
      }
      seoTemplate {
        metaDescription
        metaKeywords
        metaTitle
        srpIntroHeadline
        srpIntroParagraph
      }
      srpIntroHeadline
      srpIntroHeadlineEnabled
      srpIntroParagraph
      srpIntroParagraphEnabled
      metaDescription
      metaDescriptionEnabled
      metaKeywords
      metaKeywordsEnabled
      metaTitle
      metaTitleEnabled
      address
    }
  }`,
});

/**
 * {
 *  slug: 'london',
 *  name: 'London',
 *  latitude: 1.1237623,
 *  longitude: 2.27336,
 *  countryId: Int,
 *  published : true,
 * }
 *
 * @param variables
 */
export const createCity = variables => ({
  operationName: 'CMS_CreateCity',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateCity($input: createCityInput!) {
      createCity(input: $input) {
        city {
          id
          name
          slug
          latitude
          longitude
          published
        }
      }
    }`,
});

/**
 * {
 *  id: 126335,
 *  published: true
 * }
 *
 * @param variables
 */
export const updateCity = variables => ({
  operationName: 'CMS_UpdateCity',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateCity($input: updateCityInput!) {
      updateCity(input: $input) {
        city {
          id
          name
          areas(pageNumber: 1,pageSize: 10){
            totalCount
          }
          universities(pageNumber: 1,pageSize: 10){
            totalCount
          }
          properties
          country {
            name
            slug
          }
          slug
          published
          latitude
          longitude
          headline
          summary
          rank
          heroImage {
            id
            filename
            extension
            imageHash
            source
          }
          smallHeroImage {
            id
            filename
            extension
            imageHash
            source
          }
          seoTemplate {
            metaDescription
            metaKeywords
            metaTitle
            srpIntroHeadline
            srpIntroParagraph
          }
          srpIntroHeadline
          srpIntroHeadlineEnabled
          srpIntroParagraph
          srpIntroParagraphEnabled
          metaDescription
          metaDescriptionEnabled
          metaKeywords
          metaKeywordsEnabled
          metaTitle
          metaTitleEnabled
        }
      }
    }`,
});

/**
 * {
 *   pageNumber: Int = 1
 *   pageSize: Int = 10
 *   sortBy: $sortBy,
 *   sortDirection: $sortDirection,
 *   slugs: ['london'],,
 *   citySlugs: ['london'],,
 *  }
 * @param variables
 */

export const areas = variables => ({
  operationName: 'CMS_areasView',
  variables,
  query: `
    query CMS_areasView(
      $pageNumber: Int!,
      $pageSize: Int!,
      $slugs: [String!],
      $citySlugs: [String!],
      $sortBy: PropertySortBy,
      $sortDirection: SortDirection,
    ) {
      areas(
      pageNumber: $pageNumber,
      pageSize: $pageSize,
      slugs: $slugs,
      citySlugs: $citySlugs,
      sortBy: $sortBy,
      sortDirection: $sortDirection,
      publishedStatus: ALL
    ) {
      pageInfo {
        numPages
      }
      totalCount
      edges {
        node {
          id
          name
          originalName
          slug
          properties
          publishedProperties
          published
          city {
            id
            name
            slug
            originalName
          }
          metaOther
          metaTitle
          metaTitleEnabled
          rank
          seoTemplate {
            metaDescription
            metaKeywords
            metaTitle
            srpIntroHeadline
            srpIntroParagraph
          }
          smallHeroImage {
            id
            filename
            extension
            imageHash
            source
          }
          srpIntroHeadline
          srpIntroHeadlineEnabled
          srpIntroParagraph
          srpIntroParagraphEnabled
          summary
          headline
          heroImage {
            id
            filename
            extension
            imageHash
            source
          }
          metaDescription
          metaDescriptionEnabled
          metaKeywords
          metaKeywordsEnabled
        }
      }
    }
  }`,
});

export const createUniversity = variables => ({
  operationName: 'CMS_CreateUniversity',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateUniversity($input: createUniversityInput!) {
      createUniversity(input: $input) {
        university {
          published
          address
          latitude
          longitude
          name         
          slug
          zipCode
        }
      }
    }`,
});

export const updateUniversity = variables => ({
  operationName: 'CMS_UpdateUniversity',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateUniversity($input: updateUniversityInput!) {
      updateUniversity(input: $input) {
        university {
          id
          name
          country {
            name
            slug
          }
          city {
            name
            slug
          }
          slug
          published
          latitude
          longitude
          headline
          summary
          rank
          zipCode
          address
          commonNames
          heroImage {
            id
            filename
            extension
            imageHash
            source
          }
          smallHeroImage {
            id
            filename
            extension
            imageHash
            source
          }
          seoTemplate {
            metaDescription
            metaKeywords
            metaTitle
            srpIntroHeadline
            srpIntroParagraph
          }
          srpIntroHeadline
          srpIntroHeadlineEnabled
          srpIntroParagraph
          srpIntroParagraphEnabled
          metaDescription
          metaDescriptionEnabled
          metaKeywords
          metaKeywordsEnabled
          metaTitle
          metaTitleEnabled
          address
        }
      }
    }`,
});

export const createArea = variables => ({
  operationName: 'CMS_CreateArea',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateArea($input: CreateAreaInput!) {
      createArea(input: $input) {
        area {
          id
          name
          slug
        }
      }
    }`,
});

export const updateArea = variables => ({
  operationName: 'CMS_UpdateArea',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateArea($input: UpdateAreaInput!) {
      updateArea(input: $input) {
        area {
          id
          name
          city {
            name
            slug
          }
          slug
          published
          headline
          summary
          properties
          rank
          heroImage {
            id
            filename
            extension
            imageHash
            source
          }
          smallHeroImage {
            id
            filename
            extension
            imageHash
            source
          }
          seoTemplate {
            metaDescription
            metaKeywords
            metaTitle
            srpIntroHeadline
            srpIntroParagraph
          }
          srpIntroHeadline
          srpIntroHeadlineEnabled
          srpIntroParagraph
          srpIntroParagraphEnabled
          metaDescription
          metaDescriptionEnabled
          metaKeywords
          metaKeywordsEnabled
          metaTitle
          metaTitleEnabled
        }
      }
    }`,
});

/**
 * {
 *   "slug": "slug",
 *  }
 * @param variables
 */
export const area = variables => ({
  operationName: 'CMS_AreaView',
  variables,
  query: `
    query CMS_AreaView(
      $slug: String,
    ) {
      area(
      slug: $slug,
    ) {
      id
      name
      city {
        name
        slug
      }
      slug
      published
      headline
      summary
      properties
      rank
      heroImage {
        id
        filename
        extension
        imageHash
        source
      }
      smallHeroImage {
        id
        filename
        extension
        imageHash
        source
      }
      seoTemplate {
        metaDescription
        metaKeywords
        metaTitle
        srpIntroHeadline
        srpIntroParagraph
      }
      srpIntroHeadline
      srpIntroHeadlineEnabled
      srpIntroParagraph
      srpIntroParagraphEnabled
      metaDescription
      metaDescriptionEnabled
      metaKeywords
      metaKeywordsEnabled
      metaTitle
      metaTitleEnabled
    }
  }`,
});

export const updateLocationImage = variables => ({
  operationName: 'CMS_UpdateLocationImage',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateLocationImage($input: updateLocationImageInput!) {
      updateLocationImage(input: $input) {
        image {
          id
        }
      }
    }`,
});

export const createLocationImage = variables => ({
  operationName: 'CMS_CreateLocationImage',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateLocationImage($input: LocationImageInput!) {
      createLocationImage(input: $input) {
        image {
          id
        }
      }
    }`,
});

export const deletedLocationImage = variables => ({
  operationName: 'CMS_DeleteLocationImage',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeleteLocationImage($input: deleteLocationImageInput!) {
      deleteLocationImage(input: $input) {
        image {
          id
        }
      }
    }`,
});

export const getUploadVideoToken = () => ({
  operationName: 'CMS_getUploadVideoToken',
  query: `
  mutation CMS_getUploadVideoToken {
    getUploadVideoToken {
      sessionToken
      accessKeyId
      secretAccessKey
      region
      bucket
      expiration
    }
  }`,
});

export const checkVideoUploaded = variables => ({
  operationName: 'CMS_videoIsUploaded',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_videoIsUploaded($input: videoIsUploadedInput!) {
    videoIsUploaded(input: $input)
  }`,
});

export const createVideo = variables => ({
  operationName: 'CMS_createVideo',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_createVideo(
    $input: createVideoInput!
  ) {
    createVideo(
      input: $input
    ) {
      video {
        active
        alternateText
        extension
        id
        locales
        path
        position
        size
        thumbnailCount
        transcodedStatus
        transcodeJobId
        transcodeJobStatus
        unitTypeId
        videoHash
        fileName
        category
        links {
          hls
          hqMp4
          lqMp4
          thumbnail
        }
      }
    }
  }`,
});


export const createProperty = variables => ({
  operationName: 'CMS_createProperty',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_createProperty(
    $input: CreatePropertyInput!
  ) {
    createProperty(
      input: $input
    ) {
      property {
        id
        slug
        name
      }
    }
  }`,
});

export const createCommission = variables => ({
  operationName: 'CMS_CreateCommission',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateCommission($input: CreateCommissionTierInput!) {
      createCommissionTier(input: $input) {
        commissionTier {
          id
          category
          name
          value
          status
          bonus
          bookingCountFrom
          bookingCountTo
          capType
          capValue
          checkInDateFrom
          checkInDateTo
          convertedCalculationValue
          description
          effectiveFrom
          effectiveTo
          fullyCalculatable
          percentageForReport
          retrospectiveCommission
          tenancyLengthFrom
          tenancyLengthTo
          tenancyUnit
          type
        }
      }
    }`,
});

export const deleteCommission = variables => ({
  operationName: 'CMS_DeleteCommission',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_DeleteCommission($input: DeleteCommissionTierInput!) {
    deleteCommissionTier(input: $input) {
      deletedCommissionTierId
    }
  }`,
});

export const updateCommission = variables => ({
  operationName: 'CMS_UpdateCommission',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateCommission($input: UpdateCommissionTierInput!) {
      updateCommissionTier(input: $input) {
        commissionTier {
          id
          category
          name
          value
          status
          bonus
          bookingCountFrom
          bookingCountTo
          capType
          capValue
          checkInDateFrom
          checkInDateTo
          convertedCalculationValue
          description
          effectiveFrom
          effectiveTo
          fullyCalculatable
          percentageForReport
          retrospectiveCommission
          tenancyLengthFrom
          tenancyLengthTo
          tenancyUnit
          type
        }
      }
    }`,
});

export const updatePropertyContractNote = variables => ({
  operationName: 'CMS_UpdatePropertyContractNote',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdatePropertyContractNote($input: UpdatePropertyContractNoteInput!) {
      updatePropertyContractNote(input: $input) {
        propertyContractNote {
          createdAt
          description
          id
          newContractStage
          oldContractStage
          title
          updatedAt
          updatedBy
        }
      }
    }`,
});

export const deletePropertyContractNote = variables => ({
  operationName: 'CMS_DeletePropertyContractNote',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_DeletePropertyContractNote($input: DeletePropertyContractNoteInput!) {
    deletePropertyContractNote(input: $input) {
      propertyContractNote {
        createdAt
        description
        id
        newContractStage
        oldContractStage
        propertyId
        title
        updatedAt
        updatedBy
      }
    }
  }`,
});


export const deleteContract = variables => ({
  operationName: 'CMS_DeleteContract',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_DeleteContract($input: DeleteContractInput!) {
    deleteContract(input: $input) {
      contract {
        id
      }
    }
  }`,
});

export const createDeposit = variables => ({
  operationName: 'CMS_CreateDeposit',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateDeposit($input: CreatePaymentDepositRuleInput!) {
      createPaymentDepositRule(input: $input) {
        paymentDepositRule {
          id
          name
          value
        }
      }
    }`,
});

export const updateDeposit = variables => ({
  operationName: 'CMS_UpdateDeposit',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateDeposit($input: UpdatePaymentDepositRuleInput!) {
      updatePaymentDepositRule(input: $input) {
        paymentDepositRule {
          id
          name
          value
        }
      }
    }`,
});

export const deletedDeposit = variables => ({
  operationName: 'CMS_DeletedDeposit',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeletedDeposit($input: DeletePaymentDepositRuleInput!) {
      deletePaymentDepositRule(input: $input) {
        deletedPaymentDepositRuleId
      }
    }`,
});

export const updatePropertyEnablePayment = variables => ({
  operationName: 'CMS_UpdateProperty',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateProperty($input: UpdatePropertyInput!) {
      updateProperty (input:$input) {
        property {
          id
          paymentsEnabled
        }
      }
    }
  `,
});

export const enableBookNow = variables => ({
  operationName: 'CMS_EnableBookNow',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_EnableBookNow($input: EnableBookNowInput!) {
      enableBookNow (input:$input) {
        paymentProperty {
          id
          paymentsEnabled
        }
      }
    }
  `,
});


export const searchLandlordList = variables => ({
  operationName: 'search',
  variables,
  query: `query search($query:String, $pageNumber: Int, $pageSize: Int  ) {
  search(query: $query, pageSize: $pageSize, pageNumber: $pageNumber, publishedStatus: PUBLISHED) {
    totalCount
    edges {
      node {
        ... on Landlord {
          type: __typename
          slug
          name
          id
        }
      }
    }
  }
}`,
});

export const landlordProperties = variables => ({
  operationName: 'CMS_PropertiesView',
  variables,
  query: `
    query CMS_PropertiesView(
      $slug: String,
    ) {
      properties(
      landlordSlug: $slug,
      pageSize: 9999
    ) {
        edges {
          node {
            name
            slug
            id
            commissionTierCount(statuses: [INACTIVE, ACTIVE])
          }
        }
    }
  }`,
});

export const createContract = variables => ({
  operationName: 'CMS_CreateContract',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_CreateContract($input: CreateContractInput!) {
    createContract(input: $input) {
      contract {
        effectiveFrom
        effectiveTo
        landlord {
          name
          id
          slug
        }
        signedDate
      }
    }
  }`,
});


export const updateContract = variables => ({
  operationName: 'CMS_UpdateContract',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_UpdateContract($input: UpdateContractInput!) {
    updateContract(input: $input) {
      contract {
        effectiveFrom
        effectiveTo
        landlord {
          name
          id
          slug
        }
        signedDate
      }
    }
  }`,
});

export const getContractList = variables => ({
  operationName: 'CMS_ContractView',
  variables,
  query: `
    query CMS_ContractView(
      $pageNumber: PositiveInteger,
      $pageSize: PositiveInteger,
      $signedDateStart: Date,
      $signedDateEnd: Date,
      $landlordSlugs: [String!],
      $statuses: [ContractStatus!]
      $sortBy: ContractSortBy
      $sortDirection: SortDirection
    ) {
      contracts(
        pageSize: $pageSize,
        pageNumber: $pageNumber,
        signedDateStart: $signedDateStart,
        signedDateEnd: $signedDateEnd,
        landlordSlugs: $landlordSlugs,
        statuses: $statuses
        sortBy: $sortBy
        sortDirection: $sortDirection
    ) {
      pageInfo {
        numPages
      }
      totalCount
      edges {
        node {
          id
          createdAt
          effectiveFrom
          effectiveTo
          landlord {
            name
            id
            slug
          }
          updatedAt
          signedDate
          files {
            id
            name
            source
            updatedAt
            contentType
            contractId
            createdAt
          }
          properties {
            id
            name
          }
        }
      }
    }
  }`,
});

export const bulkDuallySigned = variables => ({
  operationName: 'CMS_DuallySigned',
  variables,
  query: `
  mutation CMS_DuallySigned($propertyIds: [ID!]) {
    bulkUpdatePropertyStage(propertyIds: $propertyIds) {
      description
      status
    }
  }`,
});

export const getCmsUser = variables => ({
  operationName: 'CMS_GetCmsUser',
  variables,
  query: `
  query CMS_GetCmsUser($userUuid: String) {
    cmsUser(userUuid: $userUuid) {
      email
      enabled
      firstName
      lastName
      id
      userRoles {
        name
        slug
      }
    }
  }`,
});

export const createAccount = variables => ({
  operationName: 'CMS_createAccount',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_createAccount(
    $input: createCmsUserInput!
  ) {
    createCmsUser(
      input: $input
    ) {
      cmsUser {
        id
      }
    }
  }`,
});

export const updateAccount = variables => ({
  operationName: 'CMS_updateAccount',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_updateAccount(
    $input: updateCmsUserInput!
  ) {
    updateCmsUser(
      input: $input
    ) {
      cmsUser {
        id
      }
    }
  }`,
});

export const createLandlordContact = variables => ({
  operationName: 'CMS_CreateLandlordContact',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_CreateLandlordContact(
    $input: CreateLandlordContactInput!
  ) {
    createLandlordContact(
      input: $input
    ) {
      landlordContact {
        id
        properties(pageSize: 9999, pageNumber:1) {
          edges {
            node {
              id
              name
              slug
            }
          }
        }
      }
    }
  }`,
});

export const updateLandlordContact = variables => ({
  operationName: 'CMS_UpdateLandlordContact',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_UpdateLandlordContact(
    $input: UpdateLandlordContactInput!
  ) {
    updateLandlordContact(
      input: $input
    ) {
      landlordContact {
        id
      }
    }
  }`,
});

export const cmsUsers = variables => ({
  operationName: 'CMS_CMSUsersView',
  variables,
  query: `
    query CMS_CMSUsersView(
      $pageNumber: Int,
      $pageSize: Int,
      $sortBy:  CmsUsersSortBy,
      $landlordSlugs: [NonEmptyString],
      $sortDirection: SortDirection,
      $email: NonEmptyString,
    ) {
      cmsUsers(
        pageSize: $pageSize,
        pageNumber: $pageNumber,
        landlordSlugs: $landlordSlugs,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        email: $email,
    ) {
      totalCount
      edges {
        node {
          enabled
          email
          firstName
          id
          lastName
          updatedAt
          userRoles {
            name
            slug
          }
          userUuid
        }
      }
    }
  }`,
});

export const getAccoutOwners = variables => ({
  operationName: 'CMS_GetAccountOwners',
  variables,
  query: `
    query CMS_GetAccountOwners(
      $pageNumber: Int,
      $pageSize: Int,
      $sortBy:  CmsUsersSortBy,
      $landlordSlugs: [NonEmptyString],
      $sortDirection: SortDirection,
      $email: NonEmptyString,
      $includeRoleSlugs: [NonEmptyString],
    ) {
      cmsUsers(
        pageSize: $pageSize,
        pageNumber: $pageNumber,
        landlordSlugs: $landlordSlugs,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        email: $email,
        includeRoleSlugs: $includeRoleSlugs,
    ) {
      edges {
        node {
          email
          id
        }
      }
    }
  }`,
});

export const getLandlordContacts = variables => ({
  operationName: 'CMS_LandlordContactsView',
  variables,
  query: `
    query CMS_LandlordContactsView(
      $pageNumber: Int,
      $pageSize: Int,
      $sortBy: LandlordContactSortBy,
      $landlordSlugs: [NonEmptyString],
      $sortDirection: SortDirection,
      $email: NonEmptyString,
      $searchContent: NonEmptyString,
      $searchFields: [LandlordContactSearchField],
    ) {
      landlordContacts(
        pageSize: $pageSize,
        pageNumber: $pageNumber,
        landlordSlugs: $landlordSlugs,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        email: $email,
        searchContent: $searchContent,
        searchFields: $searchFields,
    ) {
      totalCount
      edges {
        node {
          enabled
          firstName
          id
          email
          updatedAt
          company {
            id
            name
            slug
          }
          landlordId
          lastName
          phone
        }
      }
    }
  }`,
});

export const getLandlordContactProperty = variables => ({
  operationName: 'CMS_LandlordContactPropertyView',
  variables,
  query: `
    query CMS_LandlordContactPropertyView(
      $pageNumber: Int,
      $pageSize: Int,
      $email: NonEmptyString,
    ) {
      landlordContacts(
        pageSize: $pageSize,
        pageNumber: $pageNumber,
        email: $email,
    ) {
      totalCount
      edges {
        node {
          accountLevel
          properties(pageSize: 9999, pageNumber:1) {
            edges {
              node {
                id
                name
                slug
              }
            }
          }
        }
      }
    }
  }`,
});

export const checkUserExist = variables => ({
  operationName: 'CMS_CheckUserExist',
  variables,
  query: `
    query CMS_CheckUserExist(
      $type:  CreateCmsUserType!,
      $value: String!,
    ) {
      checkCmsUserExist(
        type: $type,
        value: $value,
    ) {
      exist
      enabled
    }
  }`,
});

export const getReferenceAndContact = variables => ({
  operationName: 'CMS_ReferenceAndContact',
  variables,
  query: `
    query CMS_ReferenceAndContact($slug: String) {
      property(slug: $slug) {
        id
        name
        slug
        status
        city {
          slug
          country {
            slug
          }
        }
        url
        landlordPhotograpyUrl
        roomMatrixUrl
        accountManager
        propertyContacts {
          id
          contactName
          contactPhone
          contactEmail
          occupation
        }
        bookingTeamContacts {
          contactEmail
          contactName
          contactPhone
          id
          occupation
        }
      }
    }
  `,
});

/**
 *
 * @param {object} variables
 *  {
 *    email: "",
 *    password: "",
 *  }
 */
export const login = variables => ({
  operationName: 'CMS_Login',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_Login($input: CmsUserLoginInput) {
      cmsUserLogin(input: $input) {
        authToken
      }
    }
  `,
});


/**
 *
 * @param {object} variables
 *  {
 *    statuses: ***,
 *  }
 */
export const getPendingApprovalList = variables => ({
  operationName: 'CMS_DraftsView',
  variables: {
    statuses: variables.statuses,
  },
  query: `
    query CMS_DraftsView($statuses: [PropertyDraftStatus!]) {
      pendingApproveList(
        statuses: $statuses
      ) {
        drafts {
          updatedAt
          propertyPublished
          propertyName
          propertyId
          propertySlug
          draftsCategory
          landlord {
            name
            id
          }
          city {
            name
            country {
              name
            }
          }

        }
      }
    }`,
});

export const getPendingApprovalDetails = variables => ({
  operationName: 'CMS_DraftView',
  variables,
  query: `
    query CMS_DraftView(
      $id: ID!,
    ) {
      draft(
        id: $id,
    ) {
      approvedBy
      changes
      createdAt
      createdBy
      expiredBy
      id
      property {
        id
        name
        city {
          slug
          name
          country {
            slug
            name
          }
        }
      }
      propertyId
      status
      updatedAt
    }
  }`,
});

export const pendingApprovePropertyDraft = variables => ({
  operationName: 'CMS_pendingApprovePropertyDraft',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_pendingApprovePropertyDraft($input: CreatePropertyDraftInput!) {
      pendingApprovePropertyDraft(input: $input) {
        propertyDraft {
          approvedBy
          changes
          createdAt
          createdBy
          expiredBy
          id
          status
          updatedAt
        }
      }
    }`,
});

export const cancelPropertyDraft = variables => ({
  operationName: 'CMS_CancelPropertyDraft',
  variables,
  query: `
    mutation CMS_CancelPropertyDraft($id: ID!) {
      cancelPropertyDraft(id: $id) {
        propertyDraft {
          id
          status
          updatedAt
          property {
            id
            name
            slug
            city {
              slug
              name
              country {
                slug
                name
              }
            }
          }
        }
      }
    }`,
});

export const savePropertyDraft = variables => ({
  operationName: 'CMS_SavePropertyDraft',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_SavePropertyDraft($input: CreatePropertyDraftInput!) {
      savePropertyDraft(input: $input) {
        propertyDraft {
          approvedBy
          changes
          createdAt
          createdBy
          expiredBy
          id
          status
          updatedAt
          version
        }
      }
    }
  `,
});

export const processPropertyDraft = variables => ({
  operationName: 'CMS_ProcessPropertyDraft',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_ProcessPropertyDraft($input: [processPropertyDraftInput!]!) {
      processPropertyDraft(input: $input) {
        propertyDraft {
          approvedBy
          changes
          createdAt
          createdBy
          expiredBy
          id
          status
          updatedAt
          version
        }
      }
    }
  `,
});

export const approvalPropertyDraft = variables => ({
  operationName: 'CMS_ApprovalPropertyDraft',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_ApprovalPropertyDraft(
      $input: [approvalPropertyDraftInput!]!
    ) {
      approvalPropertyDraft(
        input: $input,
      ) {
        propertyDraft {
          approvedBy
          changes
          createdAt
          createdBy
          expiredBy
          id
          status
          updatedAt
          version
        }
      }
    }
  `,
});

export const rejectPropertyDraft = variables => ({
  operationName: 'CMS_RejectPropertyDraft',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_RejectPropertyDraft(
      $input: rejectPropertyDraftInput!
    ) {
      rejectPropertyDraft(
        input: $input,
      ) {
        propertyDraft {
          approvedBy
          changes
          createdAt
          createdBy
          expiredBy
          id
          status
          updatedAt
          version
        }
      }
    }
  `,
});

export const getUserAuth = () => ({
  operationName: 'CMS_GetUserAuth',
  query: `
  query CMS_GetUserAuth {
    identity {
      id
      identity {
        frontendScopes {
          role
          scopes {
            object
            permission
          }
        }
      }
    }
  }`,
});

export const getPropertyPreview = variables => ({
  operationName: 'CMS_PropertyPreview',
  variables,
  query: `
  query CMS_PropertyPreview(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
      id
      name
      slug
      currency
      acceptsDepositPayment
      waitinglistEnabled
      allVideos(statuses: [INTERNAL_NEW, APPROVED]) {
        unitTypeId
        category
        position
        locales
        id
        links {
          hls
          hqMp4
          lqMp4
          thumbnail
        }
      }
      price{
        isFrom
        minPrice
        discountedMinPrice
      }
      city{
        id
        slug
        name
        originalName
        country{
          name
          slug
        }
      }
      allLinks(statuses: [INTERNAL_NEW, APPROVED]) {
        area
        propertyId
        link
        type
        displayRegion
        enabled
        id
        label
      }
      status
      billingCycle
      bookingType
      externalId
      address
      addressLine2
      zipCode
      specialOffers {
        edges {
          node {
            id
            createdAt
            title      
            description
            termsAndConditions
          }
        }
      }
      minPrice
      facilities{
        tags
        label
        slug
        rank
        group
        checked
        name
      }
      allImages(statuses: [INTERNAL_NEW, APPROVED]) {
        edges{
          node{
            category
            hero
            source
            alternateText
            unitTypeId
            position
          }
        }
      }
      description
      totalBeds
      cancellationChecked
      cancellationProcess
      freeCancellationPeriod
      cancellationPeriod
      url
      landlordPhotograpyUrl
      roomMatrixUrl
      rank
      rankWeight
      rankStar
      rankBlacksheep
      latitude
      longitude
      state
      contentContactName
      reviews(pageSize: 10) {
        edges {
          node {
            headline
            content
            createdAt
            university
            location
            nickname
            rating
          }
        }
      }
      reviewsSummary {
        count
        averageRating
        averageRatingFacility
        averageRatingLocation
        averageRatingTransport
        averageRatingSafety
        averageRatingStaff
        averageRatingValue
      }
      wishlistCount
      acceptsDepositPayment
      bookNumber
      headline
      area {
        id
        slug
        name
        originalName         
      }
      unitTypes{
        edges {
          node {
            id
            name
            category
            floors
            roomSize
            roomType
            bathroomType
            roomArrangement
            viewType
            kitchenArrangement
            bedCount
            bedroomCountMin
            bedroomCountMax
            specialOffers {
              edges {
                node {
                  title
                  internalTitle
                  termsAndConditions
                  description
                }
              }
            }
            lastFurnished
            facilities {
              group
              checked
              label
              slug
            }
            genderMix
            smokingPreference
            dietaryPreference
            unitTypeBedSizes {
              type
              length
              width
              bedCount
            }
            listings {
              id
              type
              moveInType
              moveOutType
              moveIn
              moveOut
              tenancyLengthType
              tenancyLengthValue
              availability
              state
              priceMin
              priceMax
              discountValue
              discountType
            }
            price {
              isFrom
              minPrice
              discountedMinPrice
            }
            allImages(statuses: [INTERNAL_NEW, APPROVED]) {
              edges {
                node {
                  id
                  propertyId
                  unitTypeId
                  discriminator
                  category
                  height
                  width
                  size
                  lastModifiedHash
                  extension
                  contentType
                  hero
                  thumbnail
                  path
                  position
                  source
                  filename
                  imageHash
                  alternateText
                }
              }
            }
            allLinks(statuses: [INTERNAL_NEW, APPROVED]) {
              displayRegion
              enabled
              id
              link
              type
              unitTypeId
            }
            allVideos(statuses: [INTERNAL_NEW, APPROVED]) {
              links {
                hls
                hqMp4
                lqMp4
                thumbnail
              }
              locales
              position
            }
          }
        }
      }
    }
  }
  `,
});

export const getReviews = variables => ({
  operationName: 'CMS_Reviews',
  variables,
  query: `
    query CMS_Reviews(
      $content: NonEmptyString,
      $pageNumber: PositiveInteger,
      $pageSize: PositiveInteger,
      $propertySlugs: [NonEmptyString!],
      $ratingMax: NonNegative,
      $ratingMin: NonNegative,
      $statuses: [ReviewStatus!],
      $updatedAtMax: Datetime,
      $updatedAtMin: Datetime,
      $sortBy: ReviewSortBy,
      $sortDirection: SortDirection,
    ) {
      reviews(
        content: $content,
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        propertySlugs: $propertySlugs,
        ratingMax: $ratingMax,
        ratingMin: $ratingMin,
        statuses: $statuses,
        updatedAtMax: $updatedAtMax,
        updatedAtMin: $updatedAtMin,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
    ) {
      edges {
        node {
          content
          createdAt
          headline
          id
          location
          nickname
          property {
            name
            slug
          }
          propertyImages {
            height
            id
            imageHash
            path
            status
            width
            filename
            source
          }
          unitTypeImages {
            height
            id
            imageHash
            path
            status
            width
            filename
            source
          }
          rating
          ratingFacility
          ratingLocation
          ratingSafety
          ratingStaff
          ratingTransport
          ratingValue
          status
          tags {
            id
            key
            rating
          }
          university
          updatedAt
        }
      }
      totalCount
      approvedStatusCount
      newStatusCount
      rejectedStatusCount
    }
  }`,
});

export const deleteReview = variables => ({
  operationName: 'CMS_DeleteReview',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeleteReview($input: DeleteReviewInput) {
      deleteReview(input: $input) {
        result {
          id
        }
      }
    }`,
});

export const approvalReview = variables => ({
  operationName: 'CMS_ApprovalReview',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_ApprovalReview($input: ApproveReviewInput) {
      approveReview(input: $input) {
        result {
          id
        }
      }
    }`,
});

export const rejectReview = variables => ({
  operationName: 'CMS_RejectReview',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_RejectReview($input: RejectReviewInput) {
      rejectReview(input: $input) {
        result {
          id
        }
      }
    }`,
});

export const searchProperty = variables => ({
  operationName: 'CMS_Search',
  variables,
  query: `
    query CMS_Search($query: String, $pageNumber: Int, $pageSize: Int) {
      search(query: $query, pageNumber: $pageNumber, pageSize: $pageSize, publishedStatus: ALL) {
        totalCount
        edges {
          node {
            ... on Property{
              id
              name
              slug
            }
          }
        }
      }
    }`,
}
);

/**
 * @param {object} variables
 *
 *  commissionTiers: [],
 */
export const bulkCreateCommissionTiers = variables => ({
  operationName: 'CMS_BulkCreateCommissionTiers',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_BulkCreateCommissionTiers($input: BulkCreateCommissionTiersInput!) {
      bulkCreateCommissionTiers(input: $input) {
        commissionTiers {
          id
          category
          name
          value
          status
          bonus
          bookingCountFrom
          bookingCountTo
          capType
          capValue
          checkInDateFrom
          checkInDateTo
          convertedCalculationValue
          description
          effectiveFrom
          effectiveTo
          fullyCalculatable
          percentageForReport
          retrospectiveCommission
          tenancyLengthFrom
          tenancyLengthTo
          tenancyUnit
          type
        }
      }
    }`,
});

/**
 * @param {string} variables
 *
 *  'xx@xx.com'
 */
export const forgotPassword = variables => ({
  operationName: 'forgotPassword',
  variables: {
    email: variables,
    portal: 'CMS',
  },
  query: `
    mutation forgotPassword($email: String!, $portal: Portal) {
      forgotPassword(email: $email, portal: $portal) {
        success
      }
    }
  `,
});

/**
 * @param {object} variables
 *
 * {
 *  newPassword: '11111111',
 *  token: 'asdfadf',
 * }
 */
export const resetPassword = variables => ({
  operationName: 'resetPassword',
  variables: {
    newPassword: variables.newPassword,
    portal: 'CMS',
    token: variables.token,
  },
  query: `
    mutation resetPassword($newPassword: String!, $portal: Portal, $token: String!) {
      resetPassword(newPassword: $newPassword, portal: $portal, token: $token) {
        authToken
      }
    }
  `,
});

export const getLandlords = variables => ({
  operationName: 'CMS_Landlords',
  variables,
  query: `
    query CMS_Landlords(
      $billingCity: [NonEmptyString],
      $billingCountry: [NonEmptyString],
      $slugs: [NonEmptyString],
      $pageNumber: PositiveInteger,
      $pageSize: PositiveInteger,
      $sortBy: LandlordSortBy,
      $sortDirection: SortDirection,
    ) {
      landlords(
        billingCity: $billingCity,
        billingCountry: $billingCountry,
        slugs: $slugs,
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
      ) {
        totalCount
        pageInfo {
          hasNextPage
          hasPreviousPage
          numPages
        }
        edges {
          node {
            apCategory
            bookingJourney
            billingAddress
            billingCity
            billingCountry
            billingPostalCode
            contractAttachedStatus
            id
            invoicingFrequency
            isLongtail
            name
            propertiesCount
            slug
            createdAt
            updatedAt
            reconciliationPreference
            systemProvider
            systemProviderComment
            purchaseOrderRequired
            slug
            properties(pageNumber: 1, pageSize: 10) {
              totalCount
              edges {
                node {
                  id
                  name
                  status
                  paymentsEnabled
                  city {
                    name
                    country {
                      name
                    }
                  }
                }
              }
            }
          }
        }
      }
    }`,
});

export const getPropertyName = variables => ({
  operationName: 'CMS_PropertyName',
  variables,
  query: `
  query CMS_PropertyName(
    $slug: String,
  ) {
    property(
      slug: $slug,
    ) {
    name
    slug
    id
    }
  }
  `,
});

export const getLandlord = variables => ({
  operationName: 'CMS_Landlord',
  variables: {
    slug: variables,
  },
  query: `
    query CMS_Landlord(
      $slug: String,
    ) {
      landlord(
        slug: $slug,
      ) {
        accountManager
        apCategory
        bookingJourney
        billingAddress
        billingCity
        billingCountry
        billingPostalCode
        contractAttachedStatus
        id
        invoicingFrequency
        isLongtail
        name
        propertiesCount
        createdAt
        updatedAt
        systemProvider
        systemProviderComment
        purchaseOrderRequired
        slug
        bookingAutoConfirm
        reconciliationPreference
        reconciliationOption
        reconciliationFrequency
        landlordLinkMen {
          contactEmail
          contactName
          contactPhone
          id
          occupation
        }

        properties(
          pageNumber: 1, pageSize: 99999,
          sortBy: NAME, sortDirection: ASCENDING,
        ) {
          totalCount
          edges {
            node {
              id
              name
              status
              autoConfirmSettings {
                bookingAutoConfirm
                countdownDays
              }
              paymentsEnabled
              city {
                name
                country {
                  name
                }
              }
            }
          }
        }
      }
    }`,
});

export const createLandlordLinkMan = variables => ({
  operationName: 'CMS_CreateLandlordLinkMan',
  variables: {
    input: variables,
  },
  query: `mutation CMS_CreateLandlordLinkMan($input: CreateLandlordLinkManInput!) {
    createLandlordLinkMan(input: $input) {
      landlordLinkMan {
        id
        contactName
        contactEmail
        contactPhone
        occupation
      }
    }
  }`,
});

export const updateLandlordLinkMan = variables => ({
  operationName: 'CMS_UpdateLandlordLinkMan',
  variables: {
    input: variables,
  },
  query: `mutation CMS_UpdateLandlordLinkMan($input: UpdateLandlordLinkManInput) {
    updateLandlordLinkMan(input: $input) {
      landlordLinkMan {
        id
        contactName
        contactEmail
        contactPhone
        occupation
      }
    }
  }`,
});

export const deleteLandlordLinkMan = variables => ({
  operationName: 'CMS_DeleteLandlordLinkMan',
  variables: {
    input: variables,
  },
  query: `mutation CMS_DeleteLandlordLinkMan($input: DeleteLandlordLinkManInput) {
    deleteLandlordLinkMan(input: $input) {
      landlordLinkMan {
        id
        contactName
        contactEmail
        contactPhone
        occupation
      }
    }
  }`,
});

export const createLandlord = variables => ({
  operationName: 'CMS_CreateLandlord',
  variables: {
    input: variables,
  },
  query: `mutation CMS_CreateLandlord($input: CreateLandlordInput!) {
    createLandlord(input: $input) {
      landlord {
        id
        slug
        name
      }
    }
  }`,
});

export const updateLandlord = variables => ({
  operationName: 'CMS_UpdateLandlord',
  variables: {
    input: variables,
  },
  query: `mutation CMS_UpdateLandlord($input: UpdateLandlordInput!) {
    updateLandlord(input: $input) {
      landlord {
        apCategory
        bookingJourney
        billingAddress
        billingCity
        billingCountry
        billingPostalCode
        contractAttachedStatus
        id
        invoicingFrequency
        isLongtail
        name
        propertiesCount
        createdAt
        updatedAt
        bookingAutoConfirm
        reconciliationPreference
        reconciliationOption
        reconciliationFrequency
        systemProvider
        systemProviderComment
        purchaseOrderRequired
        slug
        properties(
          pageNumber: 1, pageSize: 99999, sortBy: NAME, sortDirection: ASCENDING,
        ) {
          totalCount
          edges {
            node {
              id
              name
              status
              autoConfirmSettings {
                bookingAutoConfirm
                countdownDays
              }
              paymentsEnabled
              city {
                name
                country {
                  name
                }
              }
            }
          }
        }
        accountManager
      }
    }
  }`,
});

export const getPropertiesByLandlordSlug = variables => ({
  operationName: 'CMS_LandlordProperties',
  variables,
  query: `
    query CMS_LandlordProperties(
      $pageNumber: Int!,
      $pageSize: Int!,
      $citySlug: String,
      $countrySlug: String,
      $landlordSlug: String,
      $statuses: [PropertyStatus!],
      $slugs: [NonEmptyString!],
      $bookNowEnable: Boolean,
      $countrySlugs: [NonEmptyString!],
    ) {
    properties(
      pageNumber: $pageNumber,
      pageSize: $pageSize,
      citySlug: $citySlug,
      countrySlug: $countrySlug,
      landlordSlug: $landlordSlug,
      statuses: $statuses
      slugs: $slugs,
      bookNowEnable: $bookNowEnable,
      countrySlugs: $countrySlugs,
    ) {
      totalCount
      edges {
        node {
          id
          name
          status
          paymentsEnabled
          city {
            name
            country {
              name
            }
          }
        }
      }
    }
  }`,
});

export const searchPropertyNameList = variables => ({
  operationName: 'CMS_SearchPropertyList',
  variables,
  query: `
    query CMS_SearchPropertyList(
      $landlordSlug: String,
    ) {
    properties(
      pageNumber: 1,
      pageSize: 999,
      landlordSlug: $landlordSlug,
    ) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }`,
});

export const getDisplayCountryList = variables => ({
  operationName: 'CMS_GetDisplayCountryList',
  variables,
  query: `
    query CMS_GetDisplayCountryList {
    countries(
      pageNumber: 1,
      pageSize: 9999,
    ) {
      edges {
        node {
          id
          name
          slug
        }
      }
    }
  }`,
});

export const updatePropertyDetails = variables => ({
  operationName: 'CMS_UpdatePropertyDetails',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdatePropertyDetails($input: UpdatePropertyDetailsInput!) {
      updatePropertyDetails(input: $input) {
        property {
          id
          slug
          drafts(sortBy: UPDATED_AT, pageSize: 9999) {
            edges {
              node {
                id
                status
                updatedAt
                changes
                category
                createdUser {
                  firstName
                  lastName
                  email
                }
                comments {
                  comment
                  id
                  section
                }
                image {
                  id
                  discriminator
                  category
                  size
                  extension
                  contentType
                  hero
                  path
                  position
                  source
                  filename
                  imageHash
                  status
                  unitTypeId
                  width
                  height
                }
                video {
                  id
                  path
                  transcodedStatus
                  links {
                    hls
                    hqMp4
                    lqMp4
                    thumbnail
                  }
                  locales
                  category
                  position
                  size
                  unitTypeId
                  videoHash
                  fileName
                  extension
                  transcodeJobId
                  transcodeJobStatus
                  status
                }
                propertyLink {
                  area
                  displayRegion
                  id
                  link
                  type
                  propertyId
                  status
                }
                unitTypeLink {
                  displayRegion
                  id
                  link
                  type
                  status
                  unitTypeId
                }
              }
            }
          }
        }
      }
    }
  `,
});

export const updatePropertyInternalFields = variables => ({
  operationName: 'CMS_UpdatePropertyInternalFields',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdatePropertyInternalFields($input: UpdatePropertyInternalFieldsInput!) {
      updatePropertyInternalFields(input: $input) {
        property {
          id
          slug
          drafts(sortBy: UPDATED_AT, pageSize: 9999) {
            edges {
              node {
                id
                status
                updatedAt
                changes
                category
                createdUser {
                  firstName
                  lastName
                  email
                }
                comments {
                  comment
                  id
                  section
                }
                image {
                  id
                  discriminator
                  category
                  size
                  extension
                  contentType
                  hero
                  path
                  position
                  source
                  filename
                  imageHash
                  status
                  unitTypeId
                  width
                  height
                }
                video {
                  id
                  path
                  transcodedStatus
                  links {
                    hls
                    hqMp4
                    lqMp4
                    thumbnail
                  }
                  locales
                  category
                  position
                  size
                  unitTypeId
                  videoHash
                  fileName
                  extension
                  transcodeJobId
                  transcodeJobStatus
                  status
                }
                propertyLink {
                  area
                  displayRegion
                  id
                  link
                  type
                  propertyId
                  status
                }
                unitTypeLink {
                  displayRegion
                  id
                  link
                  type
                  status
                  unitTypeId
                }
              }
            }
          }
        }
      }
    }
  `,
});

export const bindPropertyFacilities = variables => ({
  operationName: 'CMS_BindPropertyFacilities',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_BindPropertyFacilities($input: BindPropertyFacilitiesInput!) {
      bindPropertyFacilities(
        input: $input,
      ) {
        result
      }
    }`,
});

export const bindPropertyUniversities = variables => ({
  operationName: 'CMS_BindPropertyUniversities',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_BindPropertyUniversities($input: BindPropertyUniversitiesInput!) {
      bindPropertyUniversities(
        input: $input,
      ) {
        result
      }
    }`,
});

export const updatePropertyAddress = variables => ({
  operationName: 'CMS_UpdatePropertyAddress',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdatePropertyAddress($input: UpdatePropertyAddressInput!) {
      updatePropertyAddress(
        input: $input,
      ) {
        property{
          id
          address
          latitude
          longitude
        }
      }
    }`,
});

export const updatePropertyTenancyAgreement = variables => ({
  operationName: 'CMS_UpdatePropertyTenancyAgreement',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdatePropertyTenancyAgreement($input: UpdatePropertyTenancyAgreementInput!) {
      updatePropertyTenancyAgreement(
        input: $input,
      ) {
        tenancyAgreement{
          id
        }
      }
    }`,
});

export const createPropertyTenancyAgreement = variables => ({
  operationName: 'CMS_CreatePropertyTenancyAgreement',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreatePropertyTenancyAgreement($input: CreatePropertyTenancyAgreementInput!) {
      createPropertyTenancyAgreement(
        input: $input,
      ) {
        tenancyAgreement{
          id
        }
      }
    }`,
});

export const deleteRoom = variables => ({
  operationName: 'CMS_DeleteRoom',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeleteRoom($input: DeleteRoomInput!) {
      deleteRoom(
        input: $input,
      ) {
        unitType {
          id
        }
     }
    }`,
});

export const createRoom = variables => ({
  operationName: 'CMS_CreateRoom',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateRoom($input: CreateRoomInput!) {
      createRoom(
        input: $input,
      ) {
        unitType {
          id
          name
          category
          roomSize
          roomType
          viewType
          bedCount
          kitchenArrangement
          maxOccupancy
          dualOccupancy
          bathroomType
          floors
          bedSizeType
          unitTypeBedSizes{
            id
            type
            length
            width
            bedCount
          }
          facilities{
            slug
            label
            group
            checked
          }
          lastFurnished
          roomArrangement
          bedroomCountMin
          bedroomCountMax
          bedCount
          bathroomCount
          kitchenCount
          genderMix
          dietaryPreference
          smokingPreference
          genderMix
          smokingPreference
          dietaryPreference
          updatedAt
          allLinks {
            displayRegion
            id
            link
            type
            unitTypeId
            status
          }
          listings {
            id
            type
            priceMin
            priceMax
            tenancyLengthType
            tenancyLengthValue
            availability
            liveOn
            liveUntil
            autoPriceAllowed
            autoAvailAllowed
            discountType
            discountValue
            updatedAt
            moveIn
            moveInType
            moveOut
            moveOutType
          }
          allVideos {
            id
            path
            transcodedStatus
            links {
              hls
              hqMp4
              lqMp4
              thumbnail
            }
            category
            locales
            position
            size
            unitTypeId
            videoHash
            fileName
            extension
            transcodeJobId
            transcodeJobStatus
            status
          }
          allImages {
            edges {
              node {
                id
                discriminator
                height
                width
                size
                extension
                contentType
                hero
                path
                position
                source
                filename
                imageHash
                status
              }
            }
          }
        }
     }
    }`,
});

export const updateRoom = variables => ({
  operationName: 'CMS_UpdateRoom',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateRoom($input: UpdateRoomInput!) {
      updateRoom(
        input: $input,
      ) {
        unitType {
          id
          name
          category
          roomSize
          roomType
          viewType
          bedCount
          kitchenArrangement
          maxOccupancy
          dualOccupancy
          bathroomType
          floors
          bedSizeType
          unitTypeBedSizes{
            id
            type
            length
            width
            bedCount
          }
          facilities{
            slug
            label
            group
            checked
          }
          lastFurnished
          roomArrangement
          bedroomCountMin
          bedroomCountMax
          bedCount
          bathroomCount
          kitchenCount
          genderMix
          dietaryPreference
          smokingPreference
          genderMix
          smokingPreference
          dietaryPreference
          updatedAt
          links {
            displayRegion
            enabled
            id
            link
            type
            unitTypeId
          }
          listings {
            id
            type
            priceMin
            priceMax
            tenancyLengthType
            tenancyLengthValue
            availability
            liveOn
            liveUntil
            autoPriceAllowed
            autoAvailAllowed
            discountType
            discountValue
            updatedAt
            moveIn
            moveInType
            moveOut
            moveOutType
          }
          videos {
            id
            path
            transcodedStatus
            links {
              hls
              hqMp4
              lqMp4
              thumbnail
            }
            category
            locales
            position
            size
            unitTypeId
            videoHash
            fileName
            extension
            transcodeJobId
            transcodeJobStatus
          }
          images {
            edges {
              node {
                id
                discriminator
                height
                width
                size
                extension
                contentType
                hero
                path
                position
                source
                filename
                imageHash
              }
            }
          }
        }
     }
    }`,
});

export const deleteListing = variables => ({
  operationName: 'CMS_DeleteListing',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_DeleteListing($input: DeleteListingInput!) {
      deleteListing(
        input: $input,
      ) {
        deletedListingId
     }
    }`,
});

export const createListing = variables => ({
  operationName: 'CMS_CreateListing',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_CreateListing($input: CreateListingInput!) {
      createListing(
        input: $input,
      ) {
        listing {
          autoAvailAllowed
          autoPriceAllowed
          availability
          discountType
          discountValue
          id
          liveOn
          liveUntil
          minPrice
          moveIn
          moveInType
          moveOut
          moveOutType
          priceMax
          priceMin
          state
          tenancyLengthType
          tenancyLengthValue
          type
          updatedAt
        }
     }
    }`,
});

export const updateListing = variables => ({
  operationName: 'CMS_UpdateListing',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateListing($input: UpdateListingInput!) {
      updateListing(
        input: $input,
      ) {
        listing {
          autoAvailAllowed
          autoPriceAllowed
          availability
          discountType
          discountValue
          id
          liveOn
          liveUntil
          minPrice
          moveIn
          moveInType
          moveOut
          moveOutType
          priceMax
          priceMin
          state
          tenancyLengthType
          tenancyLengthValue
          type
          updatedAt
        }
     }
    }`,
});

export const bulkUpdateListings = variables => ({
  operationName: 'CMS_BulkUpdateListings',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_BulkUpdateListings($input: BulkUpdateListingsInput!) {
      bulkUpdateListings(
        input: $input,
      ) {
        listings {
          autoAvailAllowed
          autoPriceAllowed
          availability
          discountType
          discountValue
          id
          liveOn
          liveUntil
          minPrice
          moveIn
          moveInType
          moveOut
          moveOutType
          priceMax
          priceMin
          state
          tenancyLengthType
          tenancyLengthValue
          type
          updatedAt
        }
     }
    }`,
});

export const updateGallery = variables => ({
  operationName: 'CMS_UpdateGallery',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_UpdateGallery($input: UpdateGalleryInput!) {
      updateGallery(
        input: $input,
      ) {
        gallery {
          allImages {
            edges {
              node {
                active
                alternateText
                category
                contentType
                discriminator
                extension
                filename
                height
                hero
                id
                imageHash
                lastModifiedHash
                path
                position
                propertyId
                size
                source
                thumbnail
                unitTypeId
                width
                status
              }
            }
          }
          allVideos {
            active
            alternateText
            category
            extension
            fileName
            id
            links {
              hls
              hqMp4
              lqMp4
              thumbnail
            }
            locales
            path
            position
            size
            thumbnailCount
            transcodedStatus
            transcodeJobId
            transcodeJobStatus
            unitTypeId
            videoHash
            status
          }
          allLinks {
            area
            displayRegion
            id
            link
            propertyId
            status
            type
          }
          propertyId
          unitTypeGallerys {
            allImages {
              edges {
                node {
                  active
                  alternateText
                  category
                  contentType
                  discriminator
                  extension
                  filename
                  height
                  hero
                  id
                  imageHash
                  lastModifiedHash
                  path
                  position
                  propertyId
                  size
                  source
                  thumbnail
                  unitTypeId
                  width
                  status
                }
              }
            }
            allVideos {
              active
              alternateText
              category
              extension
              fileName
              id
              links {
                hls
                hqMp4
                lqMp4
                thumbnail
              }
              locales
              path
              position
              size
              thumbnailCount
              transcodedStatus
              transcodeJobId
              transcodeJobStatus
              unitTypeId
              videoHash
              status
            }
            allLinks {
              displayRegion
              id
              link
              status
              type
              unitTypeId
            }
            unitTypeId
          }
        }
      }
    }`,
});

export const expirePropertyDraft = variables => ({
  operationName: 'CMS_ExpirePropertyDraft',
  variables: {
    ids: variables,
  },
  query: `
    mutation CMS_ExpirePropertyDraft($ids: [ID!]!) {
      expirePropertyDraft(
        ids: $ids,
      ) {
        propertyDraft {
          id
        }
      }
    }`,
});

export const bindPropertyContacts = variables => ({
  operationName: 'CMS_BindPropertyContacts',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_BindPropertyContacts($input: BindPropertyContactsInput!) {
      bindPropertyContacts(
        input: $input,
      ) {
        propertyContacts {
          contactEmail
          contactName
          contactPhone
          id
          occupation
        }
      }
    }`,
});

export const bindBookingTeamContacts = variables => ({
  operationName: 'CMS_BindBookingTeamContacts',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_BindBookingTeamContacts($input: BindBookingTeamContactsInput!) {
      bindBookingTeamContacts(
        input: $input,
      ) {
        bookingTeamContacts {
          contactEmail
          contactName
          contactPhone
          id
          occupation
        }
      }
    }`,
});

export const listOrderTransfers = variables => ({
  operationName: 'CMS_ListOrderTransfers',
  variables,
  query: `
    query CMS_ListOrderTransfers(
      $ActualTransferDatetimeEnd: Datetime,
      $ActualTransferDatetimeStart: Datetime,
      $landlordSlug: NonEmptyString,
      $orderReferenceId: NonEmptyString,
      $pageNumber: PositiveInteger,
      $pageSize: PositiveInteger,
      $PlanningTransferDatetimeEnd: Datetime,
      $PlanningTransferDatetimeStart: Datetime,
      $propertySlug: NonEmptyString,
      $referenceId: NonEmptyString,
      $sortBy: SortBy,
      $sortDirection: SortDirection,
      $status: OrderTransferStatus,
      $transferType: OrderTransferType,
    ) {
      listOrderTransfers(
        ActualTransferDatetimeEnd: $ActualTransferDatetimeEnd,
        ActualTransferDatetimeStart: $ActualTransferDatetimeStart,
        landlordSlug: $landlordSlug,
        orderReferenceId: $orderReferenceId,
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        PlanningTransferDatetimeEnd: $PlanningTransferDatetimeEnd,
        PlanningTransferDatetimeStart: $PlanningTransferDatetimeStart,
        propertySlug: $propertySlug,
        referenceId: $referenceId,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        status: $status,
        transferType: $transferType,
      ) {
        edges {
          node {
            actualTransferDatetime
            amount
            createdAt
            currency
            id
            landlord {
              id
              slug
              name
            }
            order {
              id
              referenceId
              property {
                id
                slug
                name
              }
            }
            planningTransferDatetime
            referenceId
            status
            transferType
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          numPages
        }
        totalCount
      }
    }`,
});

export const orderTransferDetail = variables => ({
  operationName: 'CMS_OrderTransferDetail',
  variables,
  query: `
    query CMS_OrderTransferDetail(
      $referenceId: NonEmptyString,
    ) {
      listOrderTransfers(
        referenceId: $referenceId,
      ) {
        edges {
          node {
            actualTransferDatetime
            actualTransferMethod
            actualTransferDetails
            amount
            createdAt
            currency
            id
            landlord {
              id
              slug
              name
            }
            order {
              id
              referenceId
              property {
                id
                slug
                name
              }
            }
            orderPayment {
              id
              name
            }
            planningTransferDatetime
            transactionNo
            receivePaymentMethod {
              bankTransfers {
                data
              }
              stripes {
                stripeId
              }
              transferMethod
              virtualCreditCards {
                email
              }
            }
            referenceId
            status
            transferType
            updatedAt
          }
        }
      }
    }`,
});

export const pendingTransfers = () => ({
  operationName: 'CMS_PendingTransfers',
  query: `
    query CMS_PendingTransfers {
      listOrderTransfers(
        pageSize: 99999,
        status: PENDING_TRANSFER,
      ) {
        totalCount
      }
    }`,
});

export const pendingReceivables = variables => ({
  operationName: 'CMS_PendingReceivables',
  variables: {
    status: variables,
  },
  query: `
    query CMS_PendingReceivables($status: OrderReceivableStatus) {
      listOrderReceivables(
        status: $status,
        pageSize: 9999,
      ) {
        totalCount
      }
    }`,
});

export const updateOrderTransferStatus = variables => ({
  operationName: 'LP_UpdateOrderTransferStatus',
  variables: {
    input: variables,
  },
  query: `
    mutation LP_UpdateOrderTransferStatus(
      $input: UpdateOrderTransferStatusInput
    ) {
      updateOrderTransferStatus(
        input: $input,
      ) {
        orderTransfer {
          id
        }
      }
    }
  `,
});

export const updateOrderReceivable = variables => ({
  operationName: 'LP_UpdateOrderReceivable',
  variables: {
    input: variables,
  },
  query: `
    mutation LP_UpdateOrderReceivable(
      $input: UpdateOrderReceivableInput
    ) {
      updateOrderReceivable(
        input: $input,
      ) {
        orderReceivable {
          id
        }
      }
    }
  `,
});

export const listOrderReceivables = variables => ({
  operationName: 'CMS_ListOrderReceivables',
  variables,
  query: `
    query CMS_ListOrderReceivables(
      $invoicedAtEnd: Datetime,
      $invoicedAtStart: Datetime,
      $invoiceNumber: NonEmptyString,
      $landlordSlug: NonEmptyString,
      $propertySlug: NonEmptyString,
      $orderReferenceId: NonEmptyString,
      $referenceId: NonEmptyString,
      $pageNumber: PositiveInteger,
      $pageSize: PositiveInteger,
      $paidAtEnd: Datetime,
      $paidAtStart: Datetime,
      $sortBy: SortBy,
      $sortDirection: SortDirection,
      $status: OrderReceivableStatus,
      $receivableMethod: OrderReceivableMethod,
    ) {
      listOrderReceivables(
        invoicedAtEnd: $invoicedAtEnd,
        invoicedAtStart: $invoicedAtStart,
        invoiceNumber: $invoiceNumber,
        landlordSlug: $landlordSlug,
        propertySlug: $propertySlug,
        orderReferenceId: $orderReferenceId,
        referenceId: $referenceId,
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        paidAtEnd: $paidAtEnd,
        paidAtStart: $paidAtStart,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        status: $status,
        receivableMethod: $receivableMethod,
      ) {
        edges {
          node {
            amount
            currency
            createdAt
            id
            invoicedAt
            invoiceNumber 
            landlord {
              id
              slug
              name
            }
            order {
              id
              referenceId
              property {
                id
                slug
                name
              }
            }
            paidAt
            receivableType
            receivableMethod
            referenceId
            status
            updatedAt
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          numPages
        }
        totalCount
      }
    }`,
});

export const orderReceiveDetail = variables => ({
  operationName: 'CMS_OrderReceiveDetail',
  variables,
  query: `
    query CMS_OrderReceiveDetail(
      $referenceId: NonEmptyString,
    ) {
      listOrderReceivables(
        referenceId: $referenceId,
      ) {
        edges {
          node {
            amount
            currency
            id
            invoicedAt
            invoiceNumber
            landlord {
              id
              slug
              name
            }
            commission {
              basePrice
              bonusCommissionTierType
              bonusCommissionTierValue
              bonusPrice
              commissionTierType
              commissionTierValue
              createdAt
              currency
              id
              orderId
              referenceId
              status
              totalPrice
              updatedAt
            }
            order {
              id
              referenceId
              property {
                id
                slug
                name
                shippingCity
                address
                addressLine2
                city {
                  name
                  country {
                    name
                  }
                }
              }
            }
            paidAt
            receivableMethod
            receivableType
            referenceId
            status
          }
        }
      }
    }`,
});

export const updatePropertyContractStage = variables => ({
  operationName: 'CMS_updatePropertyContracStage',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_updatePropertyContracStage($input: UpdatePropertyContractStageInput!) {
      updatePropertyContractStage (input:$input) {
        property {
          universities {
            name
            slug
            id
          }
          name
          slug
          id
          status
          currency
          billingCycle
          address
          addressLine2
          zipCode
          area{
            id,
            name
          }
          drafts {
            edges {
              node {
                id
                status
              }
            }
          }
          latitude
          longitude
          links {
            area
            displayRegion
            enabled
            id
            link
            type
            label
            propertyId
          }
          feedControlled
          description
          descriptionCn
          headline
          headlineCn
          minPrice
          facilities {
            label
            slug
            group
            checked
            rank
            tags
          }
          cancellationChecked
          cancellationProcess
          freeCancellationPeriod
          cancellationPeriod
          totalBeds
          landlord {
            name
          }
          address
          shippingCity
          url
          landlordPhotograpyUrl
          roomMatrixUrl
          rank
          rankWeight
          rankStar
          rankBlacksheep
          bookingType
          propertyContacts {
            id
            contactName
            contactPhone
            contactEmail
          }
          contentContactName
          videos {
            id
            path
            transcodedStatus
            links {
              hls
              hqMp4
              lqMp4
              thumbnail
            }
            category
            locales
            position
            size
            unitTypeId
            videoHash
            extension
            transcodeJobId
            transcodeJobStatus
          }
          images {
            edges {
              node {
                id
                discriminator
                category
                height
                width
                size
                extension
                contentType
                hero
                path
                position
                source
                filename
                imageHash
              }
            }
          }
          unitTypes {
            edges{
              node {
                id
                name
                category
                roomSize
                roomType
                viewType
                bedCount
                kitchenArrangement
                maxOccupancy
                dualOccupancy
                bathroomType
                floors
                bedSizeType
                unitTypeBedSizes{
                  id
                  type
                  length
                  width
                  bedCount
                }
                facilities{
                  slug
                  label
                  group
                  checked
                }
                lastFurnished
                roomArrangement
                bedroomCountMin
                bedroomCountMax
                bedCount
                bathroomCount
                kitchenCount
                genderMix
                dietaryPreference
                smokingPreference
                genderMix
                smokingPreference
                dietaryPreference
                updatedAt
                links {
                  displayRegion
                  enabled
                  id
                  link
                  type
                  unitTypeId
                }
                listings {
                  id
                  type
                  priceMin
                  priceMax
                  tenancyLengthType
                  tenancyLengthValue
                  availability
                  liveOn
                  liveUntil
                  autoPriceAllowed
                  autoAvailAllowed
                  discountType
                  discountValue
                  updatedAt
                  moveIn
                  moveInType
                  moveOut
                  moveOutType
                }
                videos {
                  id
                  path
                  transcodedStatus
                  links {
                    hls
                    hqMp4
                    lqMp4
                    thumbnail
                  }
                  category
                  locales
                  position
                  size
                  unitTypeId
                  videoHash
                  extension
                  transcodeJobId
                  transcodeJobStatus
                }
                images {
                  edges {
                    node {
                      id
                      discriminator
                      height
                      width
                      size
                      extension
                      contentType
                      hero
                      path
                      position
                      source
                      filename
                      imageHash
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `,
});

export const listOrderRefunds = variables => ({
  operationName: 'CMS_ListOrderRefunds',
  variables,
  query: `
    query CMS_ListOrderRefunds(
      $landlordSlug: NonEmptyString,
      $orderReferenceId: NonEmptyString,
      $pageNumber: PositiveInteger,
      $pageSize: PositiveInteger,
      $propertySlug: NonEmptyString,
      $referenceId: NonEmptyString,
      $refundedAtEnd: Datetime,
      $refundedAtStart: Datetime,
      $refundFrom: RefundFrom,
      $refundTo: RefundTo,
      $refundType: OrderRefundType,
      $sortBy: SortBy,
      $sortDirection: SortDirection,
      $status: OrderRefundStatus,
    ) {
      listOrderRefunds(
        landlordSlug: $landlordSlug,
        orderReferenceId: $orderReferenceId,
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        sortBy: $sortBy,
        sortDirection: $sortDirection,
        status: $status,
        refundedAtEnd: $refundedAtEnd
        refundedAtStart: $refundedAtStart
        refundFrom: $refundFrom
        refundTo: $refundTo
        refundType: $refundType
        referenceId: $referenceId,
        propertySlug: $propertySlug,
      ) {
        edges {
          node {
            amount
            currency
            id
            referenceId
            refundType
            refundMethod
            refundMethodDetails
            refundedAt
            refundFrom
            refundTo
            status
            landlord {
              id
              slug
              name
            }
            transactionNo
            order {
              id
              referenceId
              property {
                id
                slug
                name
              }
            }
            orderPayment {
              amount
              currency
              id
              price
            }
          }
        }
        pageInfo {
          hasNextPage
          hasPreviousPage
          numPages
        }
        totalCount
      }
    }`,
});

export const orderRefundDetail = variables => ({
  operationName: 'CMS_OrderRefundDetail',
  variables,
  query: `
    query CMS_OrderRefundDetail(
      $referenceId: NonEmptyString,
    ) {
      listOrderRefunds(
        referenceId: $referenceId,
      ) {
        edges {
          node {
            amount
            currency
            id
            referenceId
            refundType
            refundMethodDetails
            refundedAt
            refundFrom
            transactionNo
            refundTo
            status
            refundMethod
            orderPayment {
              amount
              currency
              id
              price
            }
            landlord {
              id
              slug
              name
            }
            order {
              id
              referenceId
              property {
                id
                slug
                name
              }
            }
          }
        }
      }
    }`,
});

export const pendingRefunds = variables => ({
  operationName: 'CMS_PendingRefunds',
  variables: {
    status: variables,
  },
  query: `
    query CMS_PendingRefunds(
      $status: OrderRefundStatus,
    ) {
      listOrderRefunds(
        status: $status,
      ) {
        totalCount
      }
    }`,
});


export const financialRefund = variables => ({
  operationName: 'CMS_FinancialRefund',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_FinancialRefund(
      $input: UpdateOrderRefundStatusInput
    ) {
      financialRefund(
        input: $input,
      ) {
        orderRefund {
          id
        }
      }
    }
  `,
});

export const refundConfirm = variables => ({
  operationName: 'CMS_FefundConfirm',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_FefundConfirm(
      $input: UpdateOrderRefundStatusInput
    ) {
      refundConfirm(
        input: $input,
      ) {
        orderRefund {
          id
        }
      }
    }
  `,
});

export const bindAutoConfirmSettings = variables => ({
  operationName: 'CMS_BindAutoConfirmSettings',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_BindAutoConfirmSettings(
      $input: BindAutoConfirmSettingsInput!
    ) {
      bindAutoConfirmSettings(
        input: $input,
      ) {
        result
      }
    }
  `,
});

export const listReconciliationLandlords = variables => ({
  operationName: 'CMS_ListReconciliationLandlords',
  variables,
  query: `
    query CMS_ListReconciliationLandlords(
      $completedAtEnd: Datetime,
      $completedAtStart: Datetime,
      $landlordIds: [ID],
      $pageNumber: PositiveInteger,
      $pageSize: PositiveInteger, 
      $reconciliationOption: ReconciliationOption,
      $billingCountry: [NonEmptyString],
    ) {
      listReconciliationLandlords(
        completedAtEnd: $completedAtEnd,
        completedAtStart: $completedAtStart,
        landlordIds: $landlordIds,
        pageNumber: $pageNumber,
        pageSize: $pageSize, 
        reconciliationOption: $reconciliationOption,
        billingCountry: $billingCountry,
      ) {
        edges {
          approvedBookingNumber
          totalBookingNumber
          landlord {
            slug
            billingCity
            billingCountry
            name
            id
            reconciliationOption
          }
        }
        totalCount
      }
    }`,
});

export const getPropertyTerms = variables => ({
  operationName: 'CMS_GetPropertyTerms',
  variables,
  query: `
    query CMS_GetPropertyTerms(
      $propertySlug: String!
      $sortBy: paymentTermsAndConditionsSortBy
      $sortDirection: SortDirection
    ) {
      property(slug: $propertySlug) {
        id
        slug
        name
        status
        city {
          slug
          country {
            slug
          }
        }
        paymentTermsAndConditions(
          statuses: [ACTIVE, INACTIVE, EXPIRED]
          sortBy: $sortBy
          sortDirection: $sortDirection
        ) {
          edges {
            node {
              id
              status
              title
              url
              fileName
              validFrom
              validTill
              createdAt
              updatedAt
            }
          }
        }
      }
    }`,
});

export const createPropertyTerms = variables => ({
  operationName: 'CMS_createPaymentsTermsAndConditions',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_createPaymentsTermsAndConditions($input: CreatePaymentsTermsAndConditionsInput!) {
      createPaymentsTermsAndConditions(input: $input) {
        termsAndConditions {
          id
        }
      }
    }
  `,
});

export const updatePropertyTerms = variables => ({
  operationName: 'CMS_updatePaymentsTermsAndConditions',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_updatePaymentsTermsAndConditions($input: UpdatePaymentsTermsAndConditionsInput!) {
      updatePaymentsTermsAndConditions(input: $input) {
        termsAndConditions {
          id
        }
      }
    }
  `,
});

export const deletePropertyTerms = variables => ({
  operationName: 'CMS_deletePaymentsTermsAndConditions',
  variables: {
    input: variables,
  },
  query: `
    mutation CMS_deletePaymentsTermsAndConditions($input: DeletePaymentsTermsAndConditionsInput!) {
      deletePaymentsTermsAndConditions(input: $input) {
        deletedPaymentsTermsAndConditionsId
      }
    }
  `,
});

export const uploadPaymentsTermsAndConditionsFile = `
  mutation CMS_uploadPaymentsTermsAndConditions($file: Upload) {
    uploadPaymentsTermsAndConditions(file: $file) {
      filename
      url
      contentType
    }
  }
`;
