import data from "../data/cambodia.json" with { type: "json" };

export interface LocalizedName {
  km: string;
  en: string;
}

export interface Village {
  code: string;
  name: LocalizedName;
}

export interface Commune {
  code: string;
  name: LocalizedName;
  villages: Village[];
}

export interface District {
  code: string;
  name: LocalizedName;
  communes: Commune[];
}

export interface Province {
  code: string;
  name: LocalizedName;
  districts: District[];
}

/** District with its parent province */
export interface DistrictResult {
  district: District;
  province: Province;
}

/** Commune with its parent district and province */
export interface CommuneResult {
  commune: Commune;
  district: District;
  province: Province;
}

/** Village with full parent chain */
export interface VillageResult {
  village: Village;
  commune: Commune;
  district: District;
  province: Province;
}

/** Full ancestry chain for any code at any level */
export interface AddressPath {
  province: Province;
  district: District | undefined;
  commune: Commune | undefined;
  village: Village | undefined;
}

export type SearchResultType = "province" | "district" | "commune" | "village";

export type SearchResult =
  | { type: "province"; data: Province }
  | { type: "district"; data: District; province: Province }
  | { type: "commune"; data: Commune; district: District; province: Province }
  | {
      type: "village";
      data: Village;
      commune: Commune;
      district: District;
      province: Province;
    };

export interface SearchOptions {
  /** Max number of results to return. Defaults to 20. */
  limit?: number;
  /** Filter to only a specific admin level. */
  type?: SearchResultType;
}

export interface FormatAddressInput {
  provinceCode?: string;
  districtCode?: string;
  communeCode?: string;
  villageCode?: string;
}

export interface FormatAddressOptions {
  /** Language to use for names. Defaults to "en". */
  lang?: "en" | "km";
  /** Separator between parts. Defaults to ", ". */
  separator?: string;
  /** Order of address parts. Defaults to village, commune, district, province. */
  order?: Array<"village" | "commune" | "district" | "province">;
}

type FlatEntry =
  | {
      type: "province";
      data: Province;
      normKm: string;
      normEn: string;
      looseKm: string;
      looseEn: string;
    }
  | {
      type: "district";
      data: District;
      province: Province;
      normKm: string;
      normEn: string;
      looseKm: string;
      looseEn: string;
    }
  | {
      type: "commune";
      data: Commune;
      district: District;
      province: Province;
      normKm: string;
      normEn: string;
      looseKm: string;
      looseEn: string;
    }
  | {
      type: "village";
      data: Village;
      commune: Commune;
      district: District;
      province: Province;
      normKm: string;
      normEn: string;
      looseKm: string;
      looseEn: string;
    };

const provinces = data as Province[];

const provinceMap = new Map<string, Province>();
const districtMap = new Map<string, DistrictResult>();
const communeMap = new Map<string, CommuneResult>();
const villageMap = new Map<string, VillageResult>();
const flatIndex: FlatEntry[] = [];
const searchCache = new Map<string, SearchResult[]>();

function norm(value: string): string {
  return value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
}

function looseNorm(value: string): string {
  return norm(value).replace(/h/g, "");
}

function normalizeLimit(limit: number | undefined): number {
  if (limit === undefined) return 20;
  if (!Number.isFinite(limit)) return 20;
  return Math.max(0, Math.floor(limit));
}

function getCodeLength(code: string): number {
  if (
    code.length === 2 ||
    code.length === 4 ||
    code.length === 6 ||
    code.length === 8
  ) {
    return code.length;
  }

  let digits = 0;
  for (let index = 0; index < code.length; index++) {
    const charCode = code.charCodeAt(index);
    if (charCode >= 48 && charCode <= 57) digits++;
  }
  return digits;
}

function searchableName(name: LocalizedName): {
  normKm: string;
  normEn: string;
  looseKm: string;
  looseEn: string;
} {
  const normKm = norm(name.km);
  const normEn = norm(name.en);

  return {
    normKm,
    normEn,
    looseKm: normKm.replace(/h/g, ""),
    looseEn: normEn.replace(/h/g, ""),
  };
}

for (const province of provinces) {
  provinceMap.set(province.code, province);
  flatIndex.push({
    type: "province",
    data: province,
    ...searchableName(province.name),
  });

  for (const district of province.districts) {
    districtMap.set(district.code, { district, province });
    flatIndex.push({
      type: "district",
      data: district,
      province,
      ...searchableName(district.name),
    });

    for (const commune of district.communes) {
      communeMap.set(commune.code, { commune, district, province });
      flatIndex.push({
        type: "commune",
        data: commune,
        district,
        province,
        ...searchableName(commune.name),
      });

      for (const village of commune.villages) {
        villageMap.set(village.code, { village, commune, district, province });
        flatIndex.push({
          type: "village",
          data: village,
          commune,
          district,
          province,
          ...searchableName(village.name),
        });
      }
    }
  }
}

const cachedStats = Object.freeze({
  provinces: provinces.length,
  districts: districtMap.size,
  communes: communeMap.size,
  villages: villageMap.size,
});

/** Get all provinces */
export function getProvinces(): Province[] {
  return provinces;
}

/** Get a single province by code */
export function getProvince(code: string): Province | undefined {
  return provinceMap.get(code);
}

/** Get all districts of a province by province code */
export function getDistricts(provinceCode: string): District[] {
  return getProvince(provinceCode)?.districts ?? [];
}

/** Get a single district by its 4-digit code */
export function getDistrict(districtCode: string): District | undefined {
  const entry = districtMap.get(districtCode);
  return entry && entry.district;
}

/** Get a district with its parent province */
export function getDistrictWithParent(
  districtCode: string
): DistrictResult | undefined {
  return districtMap.get(districtCode);
}

/** Get all communes of a district by district code */
export function getCommunes(districtCode: string): Commune[] {
  return getDistrict(districtCode)?.communes ?? [];
}

/** Get a single commune by its 6-digit code */
export function getCommune(communeCode: string): Commune | undefined {
  const entry = communeMap.get(communeCode);
  return entry && entry.commune;
}

/** Get a commune with its parent district and province */
export function getCommuneWithParent(
  communeCode: string
): CommuneResult | undefined {
  return communeMap.get(communeCode);
}

/** Get all villages of a commune by commune code */
export function getVillages(communeCode: string): Village[] {
  return getCommune(communeCode)?.villages ?? [];
}

/** Get a single village by its 8-digit code */
export function getVillage(villageCode: string): Village | undefined {
  const entry = villageMap.get(villageCode);
  return entry && entry.village;
}

/** Get a village with its full parent chain */
export function getVillageWithParent(
  villageCode: string
): VillageResult | undefined {
  return villageMap.get(villageCode);
}

/**
 * Auto-detect level by code length and return the matching entry.
 * - 2 digits: province
 * - 4 digits: district
 * - 6 digits: commune
 * - 8 digits: village
 */
export function getByCode(
  code: string
): Province | District | Commune | Village | undefined {
  const len = getCodeLength(code);
  if (len <= 2) return provinceMap.get(code);
  if (len <= 4) return getDistrict(code);
  if (len <= 6) return getCommune(code);
  return getVillage(code);
}

/**
 * Given any code at any level, return the full ancestry chain.
 * Works for province, district, commune, and village codes.
 */
export function getPath(code: string): AddressPath | undefined {
  const len = getCodeLength(code);

  if (len <= 2) {
    const province = provinceMap.get(code);
    if (!province) return undefined;
    return {
      province,
      district: undefined,
      commune: undefined,
      village: undefined,
    };
  }

  if (len <= 4) {
    const entry = districtMap.get(code);
    if (!entry) return undefined;
    return {
      province: entry.province,
      district: entry.district,
      commune: undefined,
      village: undefined,
    };
  }

  if (len <= 6) {
    const entry = communeMap.get(code);
    if (!entry) return undefined;
    return {
      province: entry.province,
      district: entry.district,
      commune: entry.commune,
      village: undefined,
    };
  }

  const entry = villageMap.get(code);
  if (!entry) return undefined;
  return {
    province: entry.province,
    district: entry.district,
    commune: entry.commune,
    village: entry.village,
  };
}

/**
 * Search across all levels by Khmer or English name.
 * Supports diacritic-insensitive matching and a loose romanized match.
 */
export function search(
  query: string,
  options: SearchOptions = {}
): SearchResult[] {
  const q = norm(query.trim());
  if (!q) return [];

  const looseQuery = looseNorm(query.trim());
  const { type } = options;
  const maxResults = normalizeLimit(options.limit);
  if (maxResults === 0) return [];

  const cacheKey = `${q}\u0000${looseQuery}\u0000${type ?? ""}\u0000${maxResults}`;
  const cached = searchCache.get(cacheKey);
  if (cached) return cached.slice();

  const results: SearchResult[] = [];

  for (const entry of flatIndex) {
    if (type && entry.type !== type) continue;

    const isMatch =
      entry.normKm.includes(q) ||
      entry.normEn.includes(q) ||
      entry.looseKm.includes(looseQuery) ||
      entry.looseEn.includes(looseQuery);

    if (isMatch) {
      const { normKm, normEn, looseKm, looseEn, ...result } = entry;
      results.push(result as SearchResult);
      if (results.length >= maxResults) break;
    }
  }

  searchCache.set(cacheKey, results);
  return results.slice();
}

/**
 * Compose a human-readable address string from address codes.
 * Resolves each code independently, so any combination can be passed.
 */
export function formatAddress(
  input: FormatAddressInput,
  options: FormatAddressOptions = {}
): string {
  const {
    lang = "en",
    separator = ", ",
    order = ["village", "commune", "district", "province"],
  } = options;

  const parts: Partial<
    Record<"village" | "commune" | "district" | "province", string>
  > = {};

  if (input.villageCode) {
    const entry = villageMap.get(input.villageCode);
    if (entry) {
      parts.village = entry.village.name[lang];
      parts.commune = parts.commune ?? entry.commune.name[lang];
      parts.district = parts.district ?? entry.district.name[lang];
      parts.province = parts.province ?? entry.province.name[lang];
    }
  }

  if (input.communeCode && !parts.commune) {
    const entry = communeMap.get(input.communeCode);
    if (entry) {
      parts.commune = entry.commune.name[lang];
      parts.district = parts.district ?? entry.district.name[lang];
      parts.province = parts.province ?? entry.province.name[lang];
    }
  }

  if (input.districtCode && !parts.district) {
    const entry = districtMap.get(input.districtCode);
    if (entry) {
      parts.district = entry.district.name[lang];
      parts.province = parts.province ?? entry.province.name[lang];
    }
  }

  if (input.provinceCode && !parts.province) {
    const province = provinceMap.get(input.provinceCode);
    if (province) parts.province = province.name[lang];
  }

  return order
    .map((part) => parts[part])
    .filter((part): part is string => Boolean(part))
    .join(separator);
}

/** Returns a cached summary count of all data */
export function getStats(): {
  provinces: number;
  districts: number;
  communes: number;
  villages: number;
} {
  return cachedStats;
}
