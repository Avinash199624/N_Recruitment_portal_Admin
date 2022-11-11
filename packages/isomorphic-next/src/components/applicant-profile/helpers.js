export const mapAddressGetData = (local, permanent, father) => ({
  local_address1: local.address1,
  local_address2: local.address2,
  local_address3: local.address3,
  local_city: local.city,
  local_state: local.state,
  local_country: 'India',
  local_postcode: local.postcode,
  local_telephone_no: local.telephone_no,
  local_isEmpty: local.isEmpty || 'false',

  permanent_address1: permanent.address1,
  permanent_address2: permanent.address2,
  permanent_address3: permanent.address3,
  permanent_city: permanent.city,
  permanent_state: permanent.state,
  permanent_country: 'India',
  permanent_postcode: permanent.postcode,
  permanent_telephone_no: permanent.telephone_no,
  permanent_isEmpty: permanent.isEmpty || 'false',

  father_address1: father.address1,
  father_address2: father.address2,
  father_address3: father.address3,
  father_city: father.city,
  father_state: father.state,
  father_country: 'India',
  father_postcode: father.postcode,
  father_telephone_no: father.telephone_no,
  father_isEmpty: father.isEmpty || 'false',

  is_permenant_address_same_as_local: local.is_permenant_address_same_as_local,
  is_father_address_same_as_local: local.is_father_address_same_as_local,
});

export const mapLocalAddressPostData = (value, user_id) => ({
  user_id: user_id,
  address1: value.local_address1,
  address2: value.local_address2,
  address3: value.local_address3,
  city: value.local_city,
  state: value.local_state,
  country: value.local_country,
  postcode: value.local_postcode,
  telephone_no: value.local_telephone_no,
});

export const mapPermanentAddressPostData = (value, user_id) => ({
  user_id: user_id,
  address1: value.permanent_address1,
  address2: value.permanent_address2,
  address3: value.permanent_address3,
  city: value.permanent_city,
  state: value.permanent_state,
  country: value.permanent_country,
  postcode: value.permanent_postcode,
  telephone_no: value.permanent_telephone_no,
});

export const mapFatherAddressPostData = (value, user_id) => ({
  user_id: user_id,
  address1: value.father_address1,
  address2: value.father_address2,
  address3: value.father_address3,
  city: value.father_city,
  state: value.father_state,
  country: value.father_country,
  postcode: value.father_postcode,
  telephone_no: value.father_telephone_no,
});

export const SCREENS = {
  personal: 0,
  address: 1,
  qualification: 2,
  experience: 3,
  others: 4,
  documents: 5,
  preview: 6,
};
