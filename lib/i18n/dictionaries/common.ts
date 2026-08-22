export const footerCopy = {
  terms: { zh: "服務條款", en: "Terms of Service" },
  privacy: { zh: "隱私權政策", en: "Privacy Policy" },
  // Copyright + company registration folded into one sentence/line
  // (rather than two stacked <p> blocks) - four separate footer rows
  // read as too busy. Takes the year as an argument so this stays the
  // single source of the "© {year} ..." text instead of splicing a
  // separate `copyright` key in from the JSX side.
  copyrightLine: {
    zh: (year: number) =>
      `© ${year} The Vow Page 摯頁為 UX CIRCLES Ltd 旗下服務（公司註冊編號 15679514，於英格蘭與威爾斯註冊）。註冊地址：71-75 Shelton Street, Covent Garden, London, WC2H 9JQ`,
    en: (year: number) =>
      `© ${year} The Vow Page is a UX CIRCLES Ltd service (Company No. 15679514), registered in England & Wales. Registered office: 71-75 Shelton Street, Covent Garden, London, WC2H 9JQ`,
  },
};
