import { NextResponse } from "next/server";

const PROVINCE_API_URL = "https://provinces.open-api.vn/api/p/";

const FALLBACK_PROVINCES = [
  "Hà Nội",
  "Hà Giang",
  "Cao Bằng",
  "Bắc Kạn",
  "Tuyên Quang",
  "Lào Cai",
  "Điện Biên",
  "Lai Châu",
  "Sơn La",
  "Yên Bái",
  "Hòa Bình",
  "Thái Nguyên",
  "Lạng Sơn",
  "Quảng Ninh",
  "Bắc Giang",
  "Phú Thọ",
  "Vĩnh Phúc",
  "Bắc Ninh",
  "Hải Dương",
  "Hải Phòng",
  "Hưng Yên",
  "Thái Bình",
  "Hà Nam",
  "Nam Định",
  "Ninh Bình",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Bình",
  "Quảng Trị",
  "Huế",
  "Đà Nẵng",
  "Quảng Nam",
  "Quảng Ngãi",
  "Bình Định",
  "Phú Yên",
  "Khánh Hòa",
  "Ninh Thuận",
  "Bình Thuận",
  "Kon Tum",
  "Gia Lai",
  "Đắk Lắk",
  "Đắk Nông",
  "Lâm Đồng",
  "Bình Phước",
  "Tây Ninh",
  "Bình Dương",
  "Đồng Nai",
  "Bà Rịa - Vũng Tàu",
  "TP Hồ Chí Minh",
  "Long An",
  "Tiền Giang",
  "Bến Tre",
  "Trà Vinh",
  "Vĩnh Long",
  "Đồng Tháp",
  "An Giang",
  "Kiên Giang",
  "Cần Thơ",
  "Hậu Giang",
  "Sóc Trăng",
  "Bạc Liêu",
  "Cà Mau",
];

function normalizeProvinceName(name: string) {
  return name
    .replace(/^Tỉnh\s+/i, "")
    .replace(/^Thành phố\s+/i, "")
    .trim();
}

export async function GET() {
  try {
    const res = await fetch(PROVINCE_API_URL, { next: { revalidate: 86_400 } });
    if (!res.ok) {
      return NextResponse.json({ locations: FALLBACK_PROVINCES }, { status: 200 });
    }

    const data = (await res.json()) as Array<{ name?: string }>;
    const locations = Array.from(
      new Set(
        (Array.isArray(data) ? data : [])
          .map((item) => (item?.name ? normalizeProvinceName(item.name) : ""))
          .filter(Boolean)
      )
    );

    if (locations.length === 0) {
      return NextResponse.json({ locations: FALLBACK_PROVINCES }, { status: 200 });
    }

    return NextResponse.json({ locations }, { status: 200 });
  } catch {
    return NextResponse.json({ locations: FALLBACK_PROVINCES }, { status: 200 });
  }
}
