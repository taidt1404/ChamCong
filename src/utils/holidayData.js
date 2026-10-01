/**
 * Danh mục các ngày lễ và kỷ niệm tại Việt Nam
 * Định dạng key: MM-DD (Tháng 2 chữ số - Ngày 2 chữ số)
 */

// Các ngày lễ chính thức theo Luật Lao động (nghỉ hưởng lương) - Dương lịch (MM-DD)
export const OFFICIAL_SOLAR_HOLIDAYS = {
  '01-01': { name: 'Tết Dương Lịch', icon: '🎆' },
  '04-30': { name: '30/4 Giải Phóng', icon: '⭐' },
  '05-01': { name: '1/5 Quốc Tế LĐ', icon: '👷' },
  '09-02': { name: '2/9 Quốc Khánh', icon: '🇻🇳' }
};

// Các ngày lễ chính thức theo Luật Lao động - Âm lịch (MM-DD)
export const OFFICIAL_LUNAR_HOLIDAYS = {
  '03-10': { name: 'Giỗ Tổ Hùng Vương', icon: '🏛️' },
  '12-29': { name: 'Tết Nguyên Đán (29 Tết)', icon: '🧧' },
  '12-30': { name: 'Giao Thừa Tết', icon: '🧧' },
  '01-01': { name: 'Mùng 1 Tết Nguyên Đán', icon: '🧧' },
  '01-02': { name: 'Mùng 2 Tết Nguyên Đán', icon: '🧧' },
  '01-03': { name: 'Mùng 3 Tết Nguyên Đán', icon: '🧧' },
  '01-04': { name: 'Mùng 4 Tết Nguyên Đán', icon: '🧧' },
  '01-05': { name: 'Mùng 5 Tết Nguyên Đán', icon: '🧧' }
};

// Các ngày lễ truyền thống / kỷ niệm phổ biến - Dương lịch (MM-DD)
export const COMMEMORATIVE_SOLAR_HOLIDAYS = {
  '02-14': { name: 'Valentine (Tình nhân)', icon: '❤️' },
  '02-27': { name: 'Thầy Thuốc VN', icon: '🩺' },
  '03-08': { name: '8/3 Phụ Nữ Q.Tế', icon: '💐' },
  '06-01': { name: 'Quốc Tế Thiếu Nhi', icon: '🎈' },
  '06-28': { name: 'Gia Đình VN', icon: '👨‍👩‍👧' },
  '07-27': { name: 'Thương Binh Liệt Sĩ', icon: '🕯️' },
  '10-20': { name: '20/10 Phụ Nữ VN', icon: '💐' },
  '11-20': { name: '20/11 Nhà Giáo VN', icon: '📚' },
  '12-22': { name: 'Quân Đội NDVN', icon: '🎖️' },
  '12-25': { name: 'Giáng Sinh (Noel)', icon: '🎄' }
};

// Các ngày lễ truyền thống / kỷ niệm phổ biến - Âm lịch (MM-DD)
export const COMMEMORATIVE_LUNAR_HOLIDAYS = {
  '01-15': { name: 'Rằm Tháng Giêng', icon: '🏮' },
  '03-03': { name: 'Tết Hàn Thực', icon: '🥣' },
  '04-15': { name: 'Lễ Phật Đản', icon: '🪷' },
  '05-05': { name: 'Tết Đoan Ngọ', icon: '🌾' },
  '07-15': { name: 'Vu Lan Báo Hiếu', icon: '🏮' },
  '08-15': { name: 'Tết Trung Thu', icon: '🥮' },
  '12-23': { name: 'Ông Công Ông Táo', icon: '🐟' }
};

/**
 * Tra cứu ngày lễ theo ngày Dương lịch và ngày Âm lịch
 * @param {string} solarDateStr - YYYY-MM-DD
 * @param {{ lunarDay: number, lunarMonth: number }} lunarObj
 * @returns {{ name: string, type: 'official' | 'commemorative', icon: string } | null}
 */
export function getHoliday(solarDateStr, lunarObj) {
  if (!solarDateStr) return null;

  const parts = solarDateStr.split('-');
  if (parts.length < 3) return null;
  const solarKey = `${parts[1]}-${parts[2]}`;

  // 1. Kiểm tra ngày lễ chính thức Dương lịch
  if (OFFICIAL_SOLAR_HOLIDAYS[solarKey]) {
    return {
      ...OFFICIAL_SOLAR_HOLIDAYS[solarKey],
      type: 'official'
    };
  }

  // 2. Kiểm tra ngày lễ chính thức Âm lịch (nếu có lunarObj)
  if (lunarObj) {
    const lunarKey = `${String(lunarObj.lunarMonth).padStart(2, '0')}-${String(
      lunarObj.lunarDay
    ).padStart(2, '0')}`;

    if (OFFICIAL_LUNAR_HOLIDAYS[lunarKey]) {
      return {
        ...OFFICIAL_LUNAR_HOLIDAYS[lunarKey],
        type: 'official'
      };
    }
  }

  // 3. Kiểm tra ngày lễ kỷ niệm Dương lịch
  if (COMMEMORATIVE_SOLAR_HOLIDAYS[solarKey]) {
    return {
      ...COMMEMORATIVE_SOLAR_HOLIDAYS[solarKey],
      type: 'commemorative'
    };
  }

  // 4. Kiểm tra ngày lễ kỷ niệm Âm lịch
  if (lunarObj) {
    const lunarKey = `${String(lunarObj.lunarMonth).padStart(2, '0')}-${String(
      lunarObj.lunarDay
    ).padStart(2, '0')}`;

    if (COMMEMORATIVE_LUNAR_HOLIDAYS[lunarKey]) {
      return {
        ...COMMEMORATIVE_LUNAR_HOLIDAYS[lunarKey],
        type: 'commemorative'
      };
    }
  }

  return null;
}
