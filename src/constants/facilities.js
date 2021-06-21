const facilitiesList = {
  features: {
    furnished_group: {
      list: ['fully_furnished', 'unfurnished', 'furnished_additional_fee'],
      type: 'radio',
    },
    wifi: {
      list: ['wifi'],
      type: 'tick',
    },
    cinema_room: {
      list: ['cinema_room'],
      type: 'tick',
    },
    gym: {
      list: ['gym'],
      type: 'tick',
    },
    elevators: {
      list: ['elevators'],
      type: 'tick',
    },
    laundry_facilities_group: {
      list: ['communal_laundry_coin', 'communal_laundry_free', 'laundry_facilities_in_apartment'],
      type: 'radio',
    },
    refrigrator: {
      list: ['refrigrator'],
      type: 'tick',
    },
    personal_contents_insurance_included: {
      list: ['personal_contents_insurance_included'],
      type: 'tick',
    },
    bike_storage: {
      list: ['bike_storage'],
      type: 'tick',
    },
    reception: {
      list: ['reception'],
      type: 'tick',
    },
    onsite_manager: {
      list: ['onsite_manager'],
      type: 'tick',
    },
    entertainment_area_or_room: {
      list: ['entertainment_area_or_room'],
      type: 'tick',
    },
    library_or_study_area: {
      list: ['library_or_study_area'],
      type: 'tick',
    },
    shuttle_bus_to_university: {
      list: ['shuttle_bus_to_university'],
      type: 'tick',
    },
    communal_kitchen: {
      list: ['communal_kitchen'],
      type: 'tick',
    },
  },
  bills: {
    wifi_group: {
      list: ['free', 'free_within_usage_capacity', 'charge_seperately'],
      type: 'radio',
    },
    electricity_group: {
      list: ['free', 'free_within_usage_capacity', 'charge_seperately'],
      type: 'radio',
    },
    gas_group: {
      list: ['free', 'free_within_usage_capacity', 'charge_seperately'],
      type: 'radio',
    },
    heating_group: {
      list: ['free', 'free_within_usage_capacity', 'charge_seperately'],
      type: 'radio',
    },
    water_group: {
      list: ['free', 'free_within_usage_capacity', 'charge_seperately'],
      type: 'radio',
    },
    cleaning_service_group: {
      list: ['free', 'free_within_usage_capacity', 'charge_seperately'],
      type: 'radio',
    },
    contents_insurance: {
      list: ['contents_insurance'],
      type: 'tick',
    },
    meals_included_group: {
      list: ['all_meals', 'flexi_meals', 'half_board'],
      type: 'radio',
    },
  },
  security_and_safety: {
    cctv_or_surveillance_cameras: {
      list: ['cctv_or_surveillance_cameras'],
      type: 'tick',
    },
    controlled_access_gate_group: {
      list: ['24_hour', 'swipe_key', 'fob_key', 'locked_gate'],
      type: 'radio',
    },
    maintenance_team_group: {
      list: ['24_hour_on_call', '24_hour_on_site', 'daytime_only'],
      type: 'radio',
    },
    security_alarm: {
      list: ['security_alarm'],
      type: 'tick',
    },
    security_officer_group: {
      list: ['24_hour_patrol', 'night_patrol'],
      type: 'radio',
    },
  },
  property_rules: {
    no_alcohol_in_communal_or_public_areas: {
      list: ['no_alcohol_in_communal_or_public_areas'],
      type: 'tick',
    },
    no_pets: {
      list: ['no_pets'],
      type: 'tick',
    },
    family_friendly: {
      list: ['family_friendly'],
      type: 'tick',
    },
    no_under_18: {
      list: ['no_under_18'],
      type: 'tick',
    },
  },
};

export default facilitiesList;
