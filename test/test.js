const {
  getProvinces,
  getProvince,
  getDistricts,
  getDistrict,
  getDistrictWithParent,
  getCommunes,
  getCommune,
  getCommuneWithParent,
  getVillages,
  getVillage,
  getVillageWithParent,
  getPath,
  search,
  formatAddress,
  getByCode,
  getStats,
} = require("../dist/index.js");

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  pass  ${name}`);
    passed++;
  } catch (error) {
    console.log(`  fail  ${name}`);
    console.log(`        ${error.message}`);
    failed++;
  }
}

function expect(value) {
  return {
    toBe: (expected) => {
      if (value !== expected) {
        throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(value)}`);
      }
    },
    toBeGreaterThan: (expected) => {
      if (value <= expected) {
        throw new Error(`Expected ${value} > ${expected}`);
      }
    },
    toBeLessThanOrEqual: (expected) => {
      if (value > expected) {
        throw new Error(`Expected ${value} <= ${expected}`);
      }
    },
    toBeDefined: () => {
      if (value === undefined || value === null) {
        throw new Error(`Expected value to be defined, got ${value}`);
      }
    },
    toHaveLength: (expected) => {
      if (!Array.isArray(value) || value.length !== expected) {
        throw new Error(`Expected length ${expected}, got ${Array.isArray(value) ? value.length : "non-array"}`);
      }
    },
  };
}

console.log("\nkh-address test suite\n" + "-".repeat(35));

test("getProvinces() returns all provinces", () => {
  const result = getProvinces();
  expect(Array.isArray(result)).toBe(true);
  expect(result).toHaveLength(25);
});

test("getProvince() finds by code", () => {
  const result = getProvince("12");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Phnom Penh");
});

test("getProvince() returns undefined for unknown code", () => {
  const result = getProvince("99");
  expect(result).toBe(undefined);
});

test("getProvince() includes Kampong Chhnang", () => {
  const result = getProvince("04");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Kampong Chhnang");
});

test("getProvince() includes Kampong Thom", () => {
  const result = getProvince("06");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Kampong Thom");
});

test("getDistricts() returns districts of a province", () => {
  const result = getDistricts("12");
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});

test("getDistrict() finds district by code", () => {
  const result = getDistrict("1201");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Chamkar Mon");
});

test("getDistrictWithParent() returns district with province", () => {
  const result = getDistrictWithParent("0102");
  expect(result).toBeDefined();
  expect(result.district.name.en).toBe("Mongkol Borei");
  expect(result.province.name.en).toBe("Banteay Meanchey");
});

test("getCommunes() returns communes of a district", () => {
  const result = getCommunes("1201");
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});

test("getCommune() finds commune by code", () => {
  const result = getCommune("010201");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Banteay Neang");
});

test("getCommuneWithParent() returns commune with district and province", () => {
  const result = getCommuneWithParent("010201");
  expect(result).toBeDefined();
  expect(result.commune.name.en).toBe("Banteay Neang");
  expect(result.district.name.en).toBe("Mongkol Borei");
  expect(result.province.name.en).toBe("Banteay Meanchey");
});

test("getVillages() returns villages of a commune", () => {
  const result = getVillages("120101");
  expect(Array.isArray(result)).toBe(true);
  expect(result.length).toBeGreaterThan(0);
});

test("getVillage() finds village by code", () => {
  const result = getVillage("01020101");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Ou Thum");
});

test("getVillageWithParent() returns village with full parent chain", () => {
  const result = getVillageWithParent("01020101");
  expect(result).toBeDefined();
  expect(result.village.name.en).toBe("Ou Thum");
  expect(result.commune.name.en).toBe("Banteay Neang");
  expect(result.district.name.en).toBe("Mongkol Borei");
  expect(result.province.name.en).toBe("Banteay Meanchey");
});

test("search() finds by English name", () => {
  const result = search("Phnom Penh");
  expect(result.length).toBeGreaterThan(0);
  expect(result[0].type).toBe("province");
});

test("search() finds by Khmer name", () => {
  const result = search(getProvince("12").name.km);
  expect(result.length).toBeGreaterThan(0);
});

test("search() returns empty for no match", () => {
  const result = search("zzznomatch");
  expect(result.length).toBe(0);
});

test("search() defaults to a safe limit", () => {
  const result = search("a");
  expect(result.length).toBeLessThanOrEqual(20);
});

test("search() respects limit", () => {
  const result = search("phnom", { limit: 5 });
  expect(result.length).toBeLessThanOrEqual(5);
});

test("search() respects type filter", () => {
  const result = search("Chamkar", { type: "district" });
  expect(result.length).toBeGreaterThan(0);
  expect(result.every((item) => item.type === "district")).toBe(true);
});

test("search() supports loose romanized matching", () => {
  const result = search("Pnom");
  expect(result.some((item) => item.data.name.en === "Phnom Penh")).toBe(true);
});

test("getPath() returns full path for a village code", () => {
  const result = getPath("01020101");
  expect(result).toBeDefined();
  expect(result.village.name.en).toBe("Ou Thum");
  expect(result.commune.name.en).toBe("Banteay Neang");
  expect(result.district.name.en).toBe("Mongkol Borei");
  expect(result.province.name.en).toBe("Banteay Meanchey");
});

test("getPath() returns partial path for a district code", () => {
  const result = getPath("0102");
  expect(result).toBeDefined();
  expect(result.district.name.en).toBe("Mongkol Borei");
  expect(result.commune).toBe(undefined);
  expect(result.village).toBe(undefined);
});

test("formatAddress() formats from village code", () => {
  const result = formatAddress({ villageCode: "01020101" });
  expect(result).toBe("Ou Thum, Banteay Neang, Mongkol Borei, Banteay Meanchey");
});

test("formatAddress() supports Khmer names", () => {
  const result = formatAddress(
    { provinceCode: "01", districtCode: "0102" },
    { lang: "km" }
  );
  expect(result).toBe(`${getDistrict("0102").name.km}, ${getProvince("01").name.km}`);
});

test("formatAddress() supports custom separator and order", () => {
  const result = formatAddress(
    { villageCode: "01020101" },
    { separator: " > ", order: ["province", "district", "commune", "village"] }
  );
  expect(result).toBe("Banteay Meanchey > Mongkol Borei > Banteay Neang > Ou Thum");
});

test("getByCode() detects province from 2-digit code", () => {
  const result = getByCode("12");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Phnom Penh");
});

test("getByCode() detects district from 4-digit code", () => {
  const result = getByCode("1201");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Chamkar Mon");
});

test("getByCode() detects commune from 6-digit code", () => {
  const result = getByCode("010201");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Banteay Neang");
});

test("getByCode() detects village from 8-digit code", () => {
  const result = getByCode("01020101");
  expect(result).toBeDefined();
  expect(result.name.en).toBe("Ou Thum");
});

test("getStats() returns counts", () => {
  const stats = getStats();
  expect(stats.provinces).toBe(25);
  expect(stats.districts).toBe(210);
  expect(stats.communes).toBe(1652);
  expect(stats.villages).toBe(14578);
});

console.log("\n" + "-".repeat(35));
console.log(`  Total: ${passed + failed} | ${passed} passed | ${failed} failed\n`);

if (failed > 0) process.exit(1);
