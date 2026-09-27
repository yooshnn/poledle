// Places Google Street View covers in South Korea (the coverage GeoGuessr plays), grouped by
// province. `key` marks the places worth memorising first. Bounds are rough boxes around each
// city or county, good enough for the pole number ranges the lesson table derives from them.
export type Bounds = { south: number; north: number; west: number; east: number };

export type Region = {
  province: string;
  name: string;
  bounds: Bounds;
  key?: true;
  note?: string;
};

export const REGIONS: readonly Region[] = [
  {
    province: "서울",
    name: "서울",
    bounds: { south: 37.43, north: 37.7, west: 126.76, east: 127.18 },
    key: true,
  },
  {
    province: "부산",
    name: "부산",
    bounds: { south: 35.0, north: 35.39, west: 128.8, east: 129.3 },
    key: true,
  },
  {
    province: "대구",
    name: "대구",
    bounds: { south: 35.6, north: 36.02, west: 128.35, east: 128.77 },
    key: true,
  },
  {
    province: "인천",
    name: "인천",
    bounds: { south: 37.35, north: 37.6, west: 126.6, east: 126.8 },
    key: true,
  },
  {
    province: "전남광주",
    name: "광주",
    bounds: { south: 35.1, north: 35.25, west: 126.75, east: 127.02 },
    key: true,
    note: "북구 일부, 무등산",
  },
  {
    province: "전남광주",
    name: "목포",
    bounds: { south: 34.76, north: 34.83, west: 126.35, east: 126.44 },
  },
  {
    province: "전남광주",
    name: "무안",
    bounds: { south: 34.85, north: 35.15, west: 126.3, east: 126.55 },
  },
  {
    province: "전남광주",
    name: "영암",
    bounds: { south: 34.7, north: 34.9, west: 126.45, east: 126.8 },
  },
  {
    province: "전남광주",
    name: "나주",
    bounds: { south: 34.9, north: 35.1, west: 126.6, east: 126.85 },
  },
  {
    province: "전남광주",
    name: "함평",
    bounds: { south: 35.0, north: 35.2, west: 126.4, east: 126.6 },
  },
  {
    province: "전남광주",
    name: "신안",
    bounds: { south: 34.6, north: 35.0, west: 125.95, east: 126.3 },
    note: "연륙도서",
  },
  {
    province: "전남광주",
    name: "완도",
    bounds: { south: 34.25, north: 34.4, west: 126.6, east: 126.8 },
    note: "일부",
  },
  {
    province: "전남광주",
    name: "순천",
    bounds: { south: 34.9, north: 35.05, west: 127.3, east: 127.55 },
    note: "일부",
  },
  {
    province: "전남광주",
    name: "광양",
    bounds: { south: 34.9, north: 35.1, west: 127.55, east: 127.8 },
  },
  {
    province: "전남광주",
    name: "여수",
    bounds: { south: 34.7, north: 34.8, west: 127.65, east: 127.8 },
    note: "동부",
  },
  {
    province: "전남광주",
    name: "구례",
    bounds: { south: 35.15, north: 35.3, west: 127.4, east: 127.6 },
  },
  {
    province: "대전",
    name: "대전",
    bounds: { south: 36.2, north: 36.5, west: 127.25, east: 127.55 },
    key: true,
  },
  {
    province: "울산",
    name: "울산",
    bounds: { south: 35.4, north: 35.7, west: 129.05, east: 129.45 },
    key: true,
    note: "일부",
  },
  {
    province: "경기",
    name: "경기",
    bounds: { south: 37.15, north: 38.25, west: 126.7, east: 127.5 },
    key: true,
    note: "평택·안성·이천·여주·양평·화성 북동부 제외",
  },
  {
    province: "강원",
    name: "원주",
    bounds: { south: 37.25, north: 37.45, west: 127.8, east: 127.99 },
  },
  {
    province: "강원",
    name: "횡성",
    bounds: { south: 37.4, north: 37.6, west: 127.9, east: 128.2 },
  },
  {
    province: "강원",
    name: "평창",
    bounds: { south: 37.35, north: 37.75, west: 128.2, east: 128.7 },
  },
  {
    province: "강원",
    name: "영월",
    bounds: { south: 37.1, north: 37.3, west: 128.3, east: 128.65 },
  },
  {
    province: "강원",
    name: "강릉",
    bounds: { south: 37.55, north: 37.9, west: 128.75, east: 129.05 },
    key: true,
  },
  {
    province: "강원",
    name: "동해",
    bounds: { south: 37.52, north: 37.58, west: 129.05, east: 129.13 },
    note: "북부",
  },
  {
    province: "강원",
    name: "양양",
    bounds: { south: 37.95, north: 38.15, west: 128.5, east: 128.75 },
  },
  {
    province: "강원",
    name: "속초",
    bounds: { south: 38.15, north: 38.23, west: 128.5, east: 128.62 },
    key: true,
  },
  {
    province: "강원",
    name: "고성",
    bounds: { south: 38.25, north: 38.5, west: 128.35, east: 128.6 },
  },
  {
    province: "강원",
    name: "태백산",
    bounds: { south: 37.08, north: 37.15, west: 128.88, east: 128.98 },
    note: "국립공원",
  },
  {
    province: "충북",
    name: "청주",
    bounds: { south: 36.5, north: 36.75, west: 127.35, east: 127.6 },
    note: "일부",
  },
  {
    province: "충북",
    name: "음성",
    bounds: { south: 36.85, north: 37.05, west: 127.5, east: 127.75 },
    note: "일부",
  },
  {
    province: "충북",
    name: "충주",
    bounds: { south: 36.9, north: 37.1, west: 127.8, east: 127.99 },
    note: "일부",
  },
  {
    province: "충남",
    name: "아산",
    bounds: { south: 36.72, north: 36.9, west: 126.9, east: 127.1 },
  },
  {
    province: "충남",
    name: "계룡",
    bounds: { south: 36.25, north: 36.32, west: 127.2, east: 127.28 },
  },
  {
    province: "충남",
    name: "태안",
    bounds: { south: 36.7, north: 36.9, west: 126.15, east: 126.35 },
    note: "솔향기길 일부",
  },
  {
    province: "전북",
    name: "전주",
    bounds: { south: 35.78, north: 35.88, west: 127.05, east: 127.18 },
    key: true,
  },
  {
    province: "전북",
    name: "완주",
    bounds: { south: 35.8, north: 36.1, west: 127.1, east: 127.4 },
  },
  {
    province: "전북",
    name: "김제",
    bounds: { south: 35.7, north: 35.9, west: 126.75, east: 127.0 },
  },
  {
    province: "전북",
    name: "고창",
    bounds: { south: 35.35, north: 35.55, west: 126.5, east: 126.8 },
  },
  {
    province: "전북",
    name: "무주",
    bounds: { south: 35.9, north: 36.05, west: 127.6, east: 127.7 },
    note: "서부 일부",
  },
  {
    province: "지리산",
    name: "지리산",
    bounds: { south: 35.25, north: 35.4, west: 127.5, east: 127.8 },
    note: "등산로",
  },
  {
    province: "경북",
    name: "포항",
    bounds: { south: 35.85, north: 36.3, west: 129.15, east: 129.6 },
    key: true,
  },
  {
    province: "경북",
    name: "경주",
    bounds: { south: 35.65, north: 36.05, west: 128.95, east: 129.45 },
    key: true,
  },
  {
    province: "경북",
    name: "경산",
    bounds: { south: 35.75, north: 35.9, west: 128.7, east: 128.9 },
  },
  {
    province: "경북",
    name: "청도",
    bounds: { south: 35.55, north: 35.75, west: 128.55, east: 128.9 },
  },
  {
    province: "경북",
    name: "고령",
    bounds: { south: 35.65, north: 35.8, west: 128.2, east: 128.45 },
  },
  {
    province: "경북",
    name: "성주",
    bounds: { south: 35.8, north: 36.0, west: 128.1, east: 128.4 },
  },
  {
    province: "경북",
    name: "칠곡",
    bounds: { south: 35.9, north: 36.1, west: 128.35, east: 128.6 },
  },
  {
    province: "경북",
    name: "구미",
    bounds: { south: 36.05, north: 36.3, west: 128.2, east: 128.45 },
  },
  {
    province: "경북",
    name: "의성",
    bounds: { south: 36.2, north: 36.5, west: 128.45, east: 128.85 },
    note: "일부",
  },
  {
    province: "경북",
    name: "상주",
    bounds: { south: 36.25, north: 36.6, west: 127.85, east: 128.3 },
  },
  {
    province: "경북",
    name: "문경",
    bounds: { south: 36.55, north: 36.85, west: 127.95, east: 128.3 },
  },
  {
    province: "경북",
    name: "예천",
    bounds: { south: 36.55, north: 36.75, west: 128.25, east: 128.55 },
  },
  {
    province: "경북",
    name: "청송",
    bounds: { south: 36.2, north: 36.55, west: 128.95, east: 129.2 },
  },
  {
    province: "경북",
    name: "영양",
    bounds: { south: 36.55, north: 36.8, west: 129.0, east: 129.25 },
  },
  {
    province: "경북",
    name: "영덕",
    bounds: { south: 36.3, north: 36.65, west: 129.25, east: 129.43 },
  },
  {
    province: "경북",
    name: "울진",
    bounds: { south: 36.65, north: 37.1, west: 129.2, east: 129.45 },
  },
  {
    province: "경남",
    name: "김해",
    bounds: { south: 35.15, north: 35.35, west: 128.7, east: 128.95 },
    note: "일부",
  },
  {
    province: "경남",
    name: "양산",
    bounds: { south: 35.25, north: 35.5, west: 128.95, east: 129.2 },
  },
  {
    province: "경남",
    name: "밀양",
    bounds: { south: 35.35, north: 35.65, west: 128.6, east: 129.0 },
  },
  {
    province: "경남",
    name: "창녕",
    bounds: { south: 35.4, north: 35.65, west: 128.35, east: 128.65 },
  },
  {
    province: "경남",
    name: "하동",
    bounds: { south: 34.95, north: 35.3, west: 127.65, east: 127.95 },
  },
  {
    province: "제주",
    name: "제주",
    bounds: { south: 33.2, north: 33.56, west: 126.15, east: 126.95 },
    key: true,
  },
];
