# kh-address

Cambodian address data with Khmer and English names.

`kh-address` provides province, district, commune, and village data for Cambodia. It is built for user location inputs, address dropdowns, autocomplete, validation, and full address labels in JavaScript or TypeScript apps.

## Features

- 25 provinces, 210 districts, 1,652 communes, and 14,578 villages
- Khmer and English names for every record
- ESM and CommonJS support
- TypeScript declarations included
- Fast code lookups by province, district, commune, or village code
- Parent-chain helpers for full address display
- Search with result limit and level filtering
- Address formatting with language, separator, and order options
- No runtime dependencies

## Installation

```bash
npm install kh-address
```

## Basic Usage

```ts
import {
  getProvince,
  getDistrict,
  getVillage,
  getVillageWithParent,
  getPath,
  search,
  formatAddress,
  getStats,
} from "kh-address";

const province = getProvince("12");
const district = getDistrict("1201");
const village = getVillage("01020101");
const fullVillage = getVillageWithParent("01020101");
const path = getPath("01020101");
const results = search("phnom", { limit: 5 });
const label = formatAddress({ villageCode: "01020101" });
const stats = getStats();
```

Example values:

```ts
province?.name;
{ km: "រាជធានីភ្នំពេញ", en: "Phnom Penh" }

district?.name;
{ km: "ចំការមន", en: "Chamkar Mon" }

village?.name;
{ km: "អូរធំ", en: "Ou Thum" }

label;
"Ou Thum, Banteay Neang, Mongkol Borei, Banteay Meanchey"

stats;
{ provinces: 25, districts: 210, communes: 1652, villages: 14578 }
```

## Location Input Example

Use these helpers to build province, district, commune, and village dropdowns.

```ts
import {
  getProvinces,
  getDistricts,
  getCommunes,
  getVillages,
  formatAddress,
} from "kh-address";

const provinces = getProvinces();

const selectedProvinceCode = "01";
const districts = getDistricts(selectedProvinceCode);

const selectedDistrictCode = "0102";
const communes = getCommunes(selectedDistrictCode);

const selectedCommuneCode = "010201";
const villages = getVillages(selectedCommuneCode);

const selectedVillageCode = "01020101";
const addressLabel = formatAddress({
  provinceCode: selectedProvinceCode,
  districtCode: selectedDistrictCode,
  communeCode: selectedCommuneCode,
  villageCode: selectedVillageCode,
});
```

Values:

```ts
addressLabel;
"Ou Thum, Banteay Neang, Mongkol Borei, Banteay Meanchey"

formatAddress({ villageCode: selectedVillageCode }, { lang: "km" });
"អូរធំ, បន្ទាយនាង, មង្គលបូរី, បន្ទាយមានជ័យ"
```

CommonJS:

```js
const { getProvince, search, formatAddress } = require("kh-address");
```

## Code Format

| Level | Code length | Example |
| --- | ---: | --- |
| Province | 2 digits | `01` |
| District | 4 digits | `0102` |
| Commune | 6 digits | `010201` |
| Village | 8 digits | `01020101` |

## API

### Basic Lookups

```ts
getProvinces(): Province[]
getProvince(code: string): Province | undefined
getDistricts(provinceCode: string): District[]
getDistrict(districtCode: string): District | undefined
getCommunes(districtCode: string): Commune[]
getCommune(communeCode: string): Commune | undefined
getVillages(communeCode: string): Village[]
getVillage(villageCode: string): Village | undefined
```

### Parent Lookups

```ts
getDistrictWithParent(districtCode: string): DistrictResult | undefined
getCommuneWithParent(communeCode: string): CommuneResult | undefined
getVillageWithParent(villageCode: string): VillageResult | undefined
```

```ts
const result = getCommuneWithParent("010201");

if (result) {
  const communeName = result.commune.name.en;
  const districtName = result.district.name.en;
  const provinceName = result.province.name.en;
}
```

Values:

```ts
communeName;
"Banteay Neang"

districtName;
"Mongkol Borei"

provinceName;
"Banteay Meanchey"
```

### Full Path

```ts
getPath(code: string): AddressPath | undefined
```

```ts
getPath("0102");
{
  province: { code: "01", name: { km: "បន្ទាយមានជ័យ", en: "Banteay Meanchey" } },
  district: { code: "0102", name: { km: "មង្គលបូរី", en: "Mongkol Borei" } },
  commune: undefined,
  village: undefined
}
```

### Auto Lookup

```ts
getByCode(code: string): Province | District | Commune | Village | undefined
```

```ts
getByCode("01")
getByCode("0102")
getByCode("010201")
getByCode("01020101")
```

## Search

```ts
search(query: string, options?: SearchOptions): SearchResult[]
```

```ts
search("phnom")
search("phnom", { limit: 5 })
search("phnom", { type: "district" })
search("phnom", { limit: 3, type: "commune" })
```

Options:

```ts
interface SearchOptions {
  limit?: number
  type?: "province" | "district" | "commune" | "village"
}
```

The default limit is `20`.

## Format Address

```ts
formatAddress(input: FormatAddressInput, options?: FormatAddressOptions): string
```

```ts
formatAddress({ villageCode: "01020101" })
"Ou Thum, Banteay Neang, Mongkol Borei, Banteay Meanchey"

formatAddress(
  { provinceCode: "01", districtCode: "0102" },
  { lang: "km" }
)
"មង្គលបូរី, បន្ទាយមានជ័យ"

formatAddress(
  { villageCode: "01020101" },
  {
    separator: " > ",
    order: ["province", "district", "commune", "village"],
  }
)
"Banteay Meanchey > Mongkol Borei > Banteay Neang > Ou Thum"
```

Options:

```ts
interface FormatAddressOptions {
  lang?: "en" | "km"
  separator?: string
  order?: Array<"village" | "commune" | "district" | "province">
}
```

Defaults:

```ts
{
  lang: "en",
  separator: ", ",
  order: ["village", "commune", "district", "province"]
}
```

## Stats

```ts
getStats()
{ provinces: 25, districts: 210, communes: 1652, villages: 14578 }
```

## TypeScript

All main data and result types are exported.

```ts
import type {
  LocalizedName,
  Province,
  District,
  Commune,
  Village,
  DistrictResult,
  CommuneResult,
  VillageResult,
  AddressPath,
  SearchResult,
  SearchResultType,
  SearchOptions,
  FormatAddressInput,
  FormatAddressOptions,
} from "kh-address";
```

Core shape:

```ts
interface LocalizedName {
  km: string
  en: string
}

interface Province {
  code: string
  name: LocalizedName
  districts: District[]
}

interface District {
  code: string
  name: LocalizedName
  communes: Commune[]
}

interface Commune {
  code: string
  name: LocalizedName
  villages: Village[]
}

interface Village {
  code: string
  name: LocalizedName
}
```

## Data Source

Address data is based on publicly available Cambodia administrative data from:

National Committee for Sub-National Democratic Development (NCDD)  
https://db.ncdd.gov.kh/

This package is not affiliated with or endorsed by NCDD.

## Disclaimer

All original data belongs to its respective source. This package only converts and provides the data in a developer-friendly JSON format.

## License

MIT
