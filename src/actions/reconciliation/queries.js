

// f放在这里是因为  那个queries 都 7k行代码了

export const listLandlordReconciliationOpportunities = variables => ({
  operationName: 'CMS_ListLandlordReconciliationOpportunities',
  variables,
  query: `
      query CMS_ListLandlordReconciliationOpportunities(
        $completedAtEnd: Datetime,
        $completedAtStart: Datetime,
        $finalMoveInDateEnd: VerifyDate,
        $finalMoveInDateStart: VerifyDate,
        $finalMoveOutDateEnd: VerifyDate,
        $finalMoveOutDateStart: VerifyDate,
        $landlordApplicationIds: [NonEmptyString]
        $landlordBookingStatus: LandlordBookingStatus,
        $landlordId: ID!,
        $opportunityStage: ReconciliationOppStage,
        $pageNumber: PositiveInteger,
        $pageSize: PositiveInteger,
        $propertyIds: [ID], 
        $secondaryLandlordBookingStatus: SecondaryLandlordBookingStatus,
        $xbookingReferenceIds: [NonEmptyString],
      ) {
        listLandlordReconciliationOpportunities(
            completedAtEnd: $completedAtEnd
            completedAtStart: $completedAtStart
            finalMoveInDateEnd: $finalMoveInDateEnd
            finalMoveInDateStart: $finalMoveInDateStart
            finalMoveOutDateEnd: $finalMoveOutDateEnd
            finalMoveOutDateStart: $finalMoveOutDateStart
            landlordApplicationIds: $landlordApplicationIds
            landlordBookingStatus: $landlordBookingStatus
            landlordId: $landlordId
            opportunityStage: $opportunityStage
            pageNumber: $pageNumber
            pageSize: $pageSize
            propertyIds: $propertyIds 
            secondaryLandlordBookingStatus: $secondaryLandlordBookingStatus
            xbookingReferenceIds: $xbookingReferenceIds
          ) {
            edges {
              node {
                completedAt
                completedXbooking {
                  billingCycle
                  commission {
                    bonusCalculationType
                    bonusCalculationValue
                    bonusValue
                    calculationType
                    calculationValue
                    currency
                    totalCommissionValue
                    value
                  }
                  landlordName
                  propertyName
                  referenceId
                  roomName
                }
                currency
                finalMoveInDate
                finalMoveOutDate
                finalPrice
                id
                landlordApplicationId
                landlordBookingStatus
                pendingNote
                repeatType
                secondaryLandlordBookingStatus
                stage
                student {
                  emailAddress
                  passportFirstName
                  passportLastName
                  passportMiddleName
                }
              }  
            }
          totalCount
        }
      }`,
});


export const getLandlordReconciliation = variables => ({
  operationName: 'CMS_GetLandlordReconciliation',
  variables,
  query: `
      query CMS_GetLandlordReconciliation(
        $landlordIds: [ID],
      ) {
        listReconciliationLandlords(
          landlordIds: $landlordIds,
        ) {
            edges{
                landlord {
                    reconciliationOption
                    billingCity
                    billingCountry
                    name
                    slug
                  }
                totalBookingNumber  
                approvedBookingNumber
            } 
        }
      }`,
});


export const listReconciliationComission = variables => ({
  operationName: 'CMS_ListReconciliationComission',
  variables,
  query: `
      query CMS_ListReconciliationComission(
        $completedAtEnd: Datetime,
        $completedAtStart: Datetime,
        $finalMoveInDateEnd: VerifyDate,
        $finalMoveInDateStart: VerifyDate,
        $finalMoveOutDateEnd: VerifyDate,
        $finalMoveOutDateStart: VerifyDate,
        $landlordApplicationIds: [NonEmptyString],
        $landlordBookingStatus: LandlordBookingStatus,
        $landlordId: ID!,
        $opportunityStage: ReconciliationOppStage,
        $propertyIds: [ID],
        $secondaryLandlordBookingStatus: SecondaryLandlordBookingStatus,
        $xbookingReferenceIds: [NonEmptyString],
      ) {
        landlordCommissionGroup(
          completedAtEnd: $completedAtEnd,
          completedAtStart: $completedAtStart,
          finalMoveInDateEnd: $finalMoveInDateEnd,
          finalMoveInDateStart: $finalMoveInDateStart,
          finalMoveOutDateEnd: $finalMoveOutDateEnd,
          finalMoveOutDateStart: $finalMoveOutDateStart,
          landlordApplicationIds: $landlordApplicationIds,
          landlordBookingStatus: $landlordBookingStatus,
          landlordId: $landlordId,
          opportunityStage: $opportunityStage,
          propertyIds: $propertyIds,
          secondaryLandlordBookingStatus: $secondaryLandlordBookingStatus,
          xbookingReferenceIds: $xbookingReferenceIds,
        ) {
            currencyGroup{
              currency
              totalCommission
            }
            propertyGroup{
              currency
              propertyName
              totalCommission
            } 
        }
      }
       `,
});

export const landlordProperties = variables => ({
  operationName: 'CMS_PropertiesView_RE',
  variables,
  query: `
      query CMS_PropertiesView_RE(
        $slug: String, 
        $statuses: [PropertyStatus!]
      ) {
        properties(
        landlordSlug: $slug,
        statuses: $statuses,
        pageSize: 9999
      ) {
          edges {
            node {
              name
              id 
            }
          }
      }
    }`,
});


// booking details

export const getReconciliationOpportunityDetails = variables => ({
  operationName: 'CMS_ReconciliationOpportunityDetails',
  variables,
  query: `
    query CMS_ReconciliationOpportunityDetails (
      $id: ID!
    ) {
      getReconciliationOpportunityDetails (
        id: $id,
      ) {
        reconciliationOpportunityDetails {
          completedAt
          completedBy
          completedXbooking {
            billingCycle
            commission {
              bonusValue
              currency
              totalCommissionValue
              value
            }
            landlordName
            listingMoveIn
            listingMoveInType
            listingMoveOut
            listingMoveOutType
            propertyName
            referenceId
            roomName
            unitPrice
          }
          currency
          finalMoveInDate
          finalMoveOutDate
          finalPrice
          id
          landlordBookingStatus
          opportunityStateChanges {
            currentLandlordBookingStatus
            currentSecondaryLandlordBookingStatus
            id
            opportunityPendingNote {
              description
              id
              opportunityCase {
                id
                ownByUser {
                  email
                  name
                }
                referenceId
                updatedAt
              }
              opportunityPendingNoteFiles {
                id
                name
                source
              }
              pendingNote
            }
            updatedAt
            updatedBy
          }
          pendingNote
          referenceId
          secondaryLandlordBookingStatus
          stage
          student {
            dateOfBirth
            destinationUniversity
            emailAddress
            gender
            nationality
            passportFirstName
            passportLastName
            passportMiddleName
            passportNumber
            phoneNumber
          }
        }
      }
    }`,
});

export const setLandlordBookingStatus = variables => ({
  operationName: 'CMS_setLandlordBookingStatus',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_setLandlordBookingStatus(
    $input: UpdateOpportunityLandlordBookingStatusInput,
  ) {
    updateOpportunityLandlordBookingStatus (
      input: $input,
    ) { 
        result 
    }
  }
`,
});

export const createOpportunityCase = variables => ({
  operationName: 'CMS_CreateOpportunityCase',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_CreateOpportunityCase(
    $input: CreateOpportunityCaseInput
  ){
    createOpportunityCase(
      input: $input
    ){
      opportunityCase {
        opportunityId
      }
    }
  }
  `,
});

export const checkActiveOpportunityCasesExist = variables => ({
  operationName: 'CMS_CheckActiveOpportunityCasesExist',
  variables: {
    input: variables,
  },
  query: `
  query CMS_CheckActiveOpportunityCasesExist(
      $input: CheckActiveOpportunityCasesExistInput,
    ) {
      checkActiveOpportunityCasesExist (
        input: $input,
      ) { 
        exist 
      }
    }
  `,
});


export const closeActiveOpportunityCases = variables => ({
  operationName: 'CMS_closeActiveOpportunityCases',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_closeActiveOpportunityCases(
      $input: CloseActiveOpportunityCasesInput,
    ) {
      closeActiveOpportunityCases (
        input: $input,
      ) { 
        opportunityCases {
          id
        }
      }
    }
  `,
});

export const reconciliationUpdateOpportunity = variables => ({
  operationName: 'CMS_ReconciliationUpdateOpportunity',
  variables: {
    input: variables,
  },
  query: `
  mutation CMS_ReconciliationUpdateOpportunity(
    $input: ReconciliationUpdateOpportunityInput
  ){
    reconciliationUpdateOpportunity(
      input: $input
    ){
      simpleOpportunity {
        finalMoveInDate
        finalMoveOutDate
        finalPrice
        id
      }
    }
  }
  `,
});

export const listOpportunityPendingNotes = variables => ({
  operationName: 'CMS_listOpportunityPendingNotes',
  variables: {
    input: {
      sortBy: 'UPDATED_AT',
      sortDirection: 'DESCENDING',
      ...variables,
    },
  },
  query: `
    query CMS_listOpportunityPendingNotes(
      $input: listOpportunityPendingNotesInput) {
        listOpportunityPendingNotes (input: $input) {
          totalCount
          edges {
            node {
              id
              description
              pendingNote
              opportunityCase {
                referenceId
                updatedBy
                updatedAt
                ownByUser {
                  id
                  email
                  name
                }
              }
              opportunityPendingNoteFiles {
                id
                name
                source
              }
              pendingNote
            }
          }
        }
    }
  `,
});

export const bulkUpdateOppLandlordBookingStatusByExcel = `
  mutation CMS_bulkUpdateOppLandlordBookingStatusByExcel($input: bulkUpdateOppLandlordBookingStatusByExcelInput) {
    bulkUpdateOppLandlordBookingStatusByExcel(input: $input) {
      filename
    }
  }
`;

export const listReconciliationBulkUpdateRecords = variables => ({
  operationName: 'CMS_ListReconciliationBulkUpdateRecords',
  variables: {
    input: variables,
  },
  query: `
    query CMS_ListReconciliationBulkUpdateRecords(
      $input: ListReconciliationBulkUpdateRecordInput!,
    ) {
      listReconciliationBulkUpdateRecords(
        input: $input
      ) {
        edges{
          node {
            completedAt
            failNum
            id
            originalFilename
            resultFilename
            status
            storageFilename
            successNum
            totalNum
            createdAt
            cmsUser {
              firstName
              lastName
            }
          }
        }
        totalCount
      }
    }`,
});

export const searchCmsUser = variables => ({
  operationName: 'CMS_SearchCmsUser',
  variables,
  query: `
    query CMS_SearchCmsUser(
      $pageNumber: Int,
      $pageSize: Int,
      $searchName: NonEmptyString,
    ) {
      cmsUsers(
        pageNumber: $pageNumber,
        pageSize: $pageSize,
        searchName: $searchName,
      ) {
        edges{
          node {
            firstName
            lastName
            id
            userUuid
          }
        }
      }
    }`,
});
