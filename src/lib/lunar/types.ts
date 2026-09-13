export interface SolarDate {
  day: number;
  month: number;
  year: number;
}

export interface LunarDate {
  day: number;
  month: number;
  year: number;
  isLeap: boolean;
  leapMonth?: number;
}

export interface CanChiInfo {
  yearCanChi: string;
  monthCanChi: string;
  dayCanChi: string;
  hourCanChi: string;
}

export interface DayFengShui {
  hoangDaoHours: string[];
  hacDaoHours: string[];
  tietKhi: string;
  truc: string;
  sao: string;
  saoStatus: 'Cát' | 'Hung' | 'Bình';
  huongXuatHanh: {
    hyThan: string;
    taiThan: string;
  };
}

export interface FullDayInfo {
  solar: SolarDate;
  lunar: LunarDate;
  canChi: CanChiInfo;
  fengShui: DayFengShui;
  isToday: boolean;
  dayOfWeek: number; // 0: CN, 1: T2, ..., 6: T7
  dayOfWeekName: string;
}
