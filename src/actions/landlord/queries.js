const listSystemProviders = {
  query: `
      query getEnums{
        __type(name: "SystemProvider") {
          enumValues{
            name
          }
        }
      }
    `,
}

export const listReconciliationPreference = {
  query: `
      query getEnums{
        __type(name: "ReconciliationPreference") {
          enumValues{
            name
          }
        }
      }
    `,
}

export default listSystemProviders
