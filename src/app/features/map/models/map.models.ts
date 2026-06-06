export interface AddressEntity {
  label: string;          // CITY | DISTRICT | WARD | STREET | HOUSE_NUMBER | PLACE_NAME
  text: string;
  score: number;
  source: string;         // bert | gazetteer-exact | gazetteer-fuzzy
}

export interface AddressLevel {
  key: string;            // city | district | ward | street | house_number | place_name | other
  label: string;          // NER label
  label_vi: string;       // Tỉnh / Thành phố, Quận / Huyện, ...
  entities: AddressEntity[];
}

export interface AddressExtractData {
  text: string;
  canonical: string;
  entities: AddressEntity[];
  levels: AddressLevel[];
  steps?: any;
}

export interface AddressExtractResponse {
  success: boolean;
  message: string;
  data: AddressExtractData | null;
}
