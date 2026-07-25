/**
 * Indian Geographical Locations, Administrative Divisions & Housing Types
 * Country is strictly fixed to INDIA.
 */

export interface HousingTypeOption {
  id: 'APARTMENT' | 'INDEPENDENT_HOUSE' | 'VILLA' | 'HOSTEL' | 'PG' | 'RENTAL';
  label: string;
  energyMultiplier: number;
  description: string;
}

export const HOUSING_TYPES: HousingTypeOption[] = [
  { id: 'APARTMENT', label: 'Apartment / Flat', energyMultiplier: 1.0, description: 'Multi-story residential apartment complex' },
  { id: 'INDEPENDENT_HOUSE', label: 'Independent House / Bungalow', energyMultiplier: 1.25, description: 'Standalone house with independent roof' },
  { id: 'VILLA', label: 'Gated Villa', energyMultiplier: 1.45, description: 'Large standalone villa in gated community' },
  { id: 'HOSTEL', label: 'Student Hostel', energyMultiplier: 0.60, description: 'Shared college or university hostel room' },
  { id: 'PG', label: 'Paying Guest (PG)', energyMultiplier: 0.70, description: 'Shared PG accommodation' },
  { id: 'RENTAL', label: 'Rental Unit', energyMultiplier: 0.90, description: 'Rented portion or floor' }
];

export interface StateLocationData {
  state: string;
  isUT: boolean;
  gridRegion: string;
  districts: string[];
  majorCities: string[];
}

export const INDIAN_STATES_AND_UTS: StateLocationData[] = [
  {
    state: 'Maharashtra',
    isUT: false,
    gridRegion: 'WEST',
    districts: ['Mumbai Suburban', 'Mumbai City', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Chhatrapati Sambhajinagar', 'Solapur', 'Kolhapur'],
    majorCities: ['Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Navi Mumbai', 'Chhatrapati Sambhajinagar']
  },
  {
    state: 'Karnataka',
    isUT: false,
    gridRegion: 'SOUTH',
    districts: ['Bengaluru Urban', 'Bengaluru Rural', 'Mysuru', 'Dakshina Kannada', 'Dharwad', 'Belagavi', 'Kalaburagi'],
    majorCities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi-Dharwad', 'Belagavi']
  },
  {
    state: 'Delhi',
    isUT: true,
    gridRegion: 'NORTH',
    districts: ['New Delhi', 'South Delhi', 'North Delhi', 'East Delhi', 'West Delhi', 'Central Delhi'],
    majorCities: ['New Delhi', 'Delhi NCR']
  },
  {
    state: 'Tamil Nadu',
    isUT: false,
    gridRegion: 'SOUTH',
    districts: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Vellore'],
    majorCities: ['Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem']
  },
  {
    state: 'Gujarat',
    isUT: false,
    gridRegion: 'WEST',
    districts: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Gandhinagar'],
    majorCities: ['Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Gandhinagar']
  },
  {
    state: 'Uttar Pradesh',
    isUT: false,
    gridRegion: 'NORTH',
    districts: ['Gautam Buddha Nagar (Noida)', 'Ghaziabad', 'Lucknow', 'Kanpur Nagar', 'Varanasi', 'Agra', 'Prayagraj'],
    majorCities: ['Noida', 'Ghaziabad', 'Lucknow', 'Kanpur', 'Varanasi', 'Agra', 'Prayagraj']
  },
  {
    state: 'West Bengal',
    isUT: false,
    gridRegion: 'EAST',
    districts: ['Kolkata', 'North 24 Parganas', 'South 24 Parganas', 'Howrah', 'Darjeeling', 'Hooghly', 'Paschim Bardhaman'],
    majorCities: ['Kolkata', 'Howrah', 'Siliguri', 'Durgapur', 'Asansol']
  },
  {
    state: 'Telangana',
    isUT: false,
    gridRegion: 'SOUTH',
    districts: ['Hyderabad', 'Medchal-Malkajgiri', 'Rangareddy', 'Warangal', 'Nizamabad', 'Karimnagar'],
    majorCities: ['Hyderabad', 'Warangal', 'Nizamabad', 'Karimnagar']
  },
  {
    state: 'Rajasthan',
    isUT: false,
    gridRegion: 'NORTH',
    districts: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer', 'Bikaner'],
    majorCities: ['Jaipur', 'Jodhpur', 'Udaipur', 'Kota', 'Ajmer']
  },
  {
    state: 'Kerala',
    isUT: false,
    gridRegion: 'SOUTH',
    districts: ['Ernakulam', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur', 'Kollam', 'Kannur'],
    majorCities: ['Kochi', 'Thiruvananthapuram', 'Kozhikode', 'Thrissur']
  },
  {
    state: 'Haryana',
    isUT: false,
    gridRegion: 'NORTH',
    districts: ['Gurugram', 'Faridabad', 'Panchkula', 'Ambala', 'Hisar', 'Karnal'],
    majorCities: ['Gurugram', 'Faridabad', 'Panchkula', 'Ambala']
  },
  {
    state: 'Punjab',
    isUT: false,
    gridRegion: 'NORTH',
    districts: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'SAS Nagar (Mohali)'],
    majorCities: ['Ludhiana', 'Amritsar', 'Jalandhar', 'Mohali', 'Patiala']
  },
  {
    state: 'Madhya Pradesh',
    isUT: false,
    gridRegion: 'WEST',
    districts: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain'],
    majorCities: ['Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain']
  },
  {
    state: 'Bihar',
    isUT: false,
    gridRegion: 'EAST',
    districts: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur', 'Darbhanga'],
    majorCities: ['Patna', 'Gaya', 'Muzaffarpur', 'Bhagalpur']
  },
  {
    state: 'Andhra Pradesh',
    isUT: false,
    gridRegion: 'SOUTH',
    districts: ['Visakhapatnam', 'NTR (Vijayawada)', 'Guntur', 'Tirupati', 'Kurnool'],
    majorCities: ['Visakhapatnam', 'Vijayawada', 'Guntur', 'Tirupati']
  },
  {
    state: 'Odisha',
    isUT: false,
    gridRegion: 'EAST',
    districts: ['Khordha (Bhubaneswar)', 'Cuttack', 'Ganjam', 'Sundargarh (Rourkela)', 'Puri'],
    majorCities: ['Bhubaneswar', 'Cuttack', 'Rourkela', 'Puri']
  },
  {
    state: 'Assam',
    isUT: false,
    gridRegion: 'NORTHEAST',
    districts: ['Kamrup Metropolitan (Guwahati)', 'Dibrugarh', 'Silchar', 'Jorhat'],
    majorCities: ['Guwahati', 'Dibrugarh', 'Silchar', 'Jorhat']
  },
  {
    state: 'Goa',
    isUT: false,
    gridRegion: 'WEST',
    districts: ['North Goa', 'South Goa'],
    majorCities: ['Panaji', 'Margao', 'Vasco da Gama']
  },
  {
    state: 'Chandigarh',
    isUT: true,
    gridRegion: 'NORTH',
    districts: ['Chandigarh'],
    majorCities: ['Chandigarh']
  },
  {
    state: 'Jammu and Kashmir',
    isUT: true,
    gridRegion: 'NORTH',
    districts: ['Srinagar', 'Jammu', 'Anantnag', 'Baramulla'],
    majorCities: ['Srinagar', 'Jammu']
  },
  {
    state: 'Ladakh',
    isUT: true,
    gridRegion: 'NORTH',
    districts: ['Leh', 'Kargil'],
    majorCities: ['Leh', 'Kargil']
  },
  {
    state: 'Puducherry',
    isUT: true,
    gridRegion: 'SOUTH',
    districts: ['Puducherry', 'Karaikal', 'Mahe', 'Yanam'],
    majorCities: ['Puducherry', 'Karaikal']
  },
  {
    state: 'Uttarakhand',
    isUT: false,
    gridRegion: 'NORTH',
    districts: ['Dehradun', 'Haridwar', 'Nainital', 'Udham Singh Nagar'],
    majorCities: ['Dehradun', 'Haridwar', 'Haldwani', 'Rishikesh']
  },
  {
    state: 'Himachal Pradesh',
    isUT: false,
    gridRegion: 'NORTH',
    districts: ['Shimla', 'Kangra (Dharamshala)', 'Mandi', 'Solan'],
    majorCities: ['Shimla', 'Dharamshala', 'Solan']
  },
  {
    state: 'Jharkhand',
    isUT: false,
    gridRegion: 'EAST',
    districts: ['Ranchi', 'East Singhbhum (Jamshedpur)', 'Dhanbad', 'Bokaro'],
    majorCities: ['Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro']
  },
  {
    state: 'Chhattisgarh',
    isUT: false,
    gridRegion: 'WEST',
    districts: ['Raipur', 'Durg (Bhilai)', 'Bilaspur', 'Korba'],
    majorCities: ['Raipur', 'Bhilai', 'Bilaspur']
  }
];
