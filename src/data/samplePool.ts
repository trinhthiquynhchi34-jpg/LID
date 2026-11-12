import { FilmPhoto } from '../types/film';

// Curated high quality photos across different themes for batch roll generation
export const PHOTO_SAMPLE_BANK = [
  {
    title: 'Phố Cổ Nắng Xiên & Chiếc Xe Đạp Thồ',
    url: '/src/assets/images/film_vietnam_street_1794465058747.jpg',
    location: 'Hà Nội',
    year: '1988',
    camera: 'Leica M3',
    lens: 'Summicron 50mm',
    caption: 'Ánh chiều tà hắt qua những bức tường vàng rêu phong cổ kính.'
  },
  {
    title: 'Cơn Mưa Đêm Shinjuku & Hơi Khói Mì',
    url: '/src/assets/images/film_tokyo_night_1794465059322.jpg',
    location: 'Tokyo',
    year: '1986',
    camera: 'Leica M6',
    lens: 'Summilux 35mm',
    caption: 'Bảng hiệu neon phản chiếu trên mặt đường ướt sũng trong làn mưa bụi.'
  },
  {
    title: 'Bình Minh Trên Rừng Thông Ngút Ngàn',
    url: '/src/assets/images/film_nature_fog_1794465060351.jpg',
    location: 'Cascade Ridge',
    year: '1996',
    camera: 'Hasselblad 500C/M',
    lens: 'Planar 80mm',
    caption: 'Tia nắng rạng đông đâm xuyên qua màn sương bảng lảng sớm mai.'
  },
  {
    title: 'Họa Sĩ Bên Khung Cửa Sổ Mưa Rơi',
    url: '/src/assets/images/film_monochrome_portrait_1794465059932.jpg',
    location: 'Montmartre, Paris',
    year: '1964',
    camera: 'Leica M2',
    lens: 'Summaron 35mm',
    caption: 'Bóng người nghệ sĩ trầm tư bên giá vẽ trong ánh sáng Chiaroscuro.'
  },
  {
    title: 'Hoàng Hôn Trên Dòng Sông Hoài',
    url: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
    location: 'Hội An',
    year: '1992',
    camera: 'Canon AE-1',
    lens: 'FD 35mm',
    caption: 'Thuyền hoa đăng lấp lánh phản chiếu mặt nước tĩnh lặng chiều tà.'
  },
  {
    title: 'Ngã Tư Shibuya Dưới Dù Trong Suốt',
    url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1200&q=80',
    location: 'Shibuya, Tokyo',
    year: '1995',
    camera: 'Contax G2',
    lens: 'Planar 45mm',
    caption: 'Dòng người tấp nập dưới ánh đèn quảng cáo khổng lồ của đô thị không ngủ.'
  },
  {
    title: 'Đỉnh Núi Hùng Vĩ Tắm Nắng',
    url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    location: 'Alps Thụy Sĩ',
    year: '1994',
    camera: 'Mamiya 7 II',
    lens: 'Mamiya 65mm',
    caption: 'Tuyết vĩnh cửu lấp lánh phản chiếu vầng dương rực rỡ giữa nền trời xanh biếc.'
  },
  {
    title: 'Bậc Thang Đá Và Chiếc Áo Măng Tô',
    url: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=1200&q=80',
    location: 'Pont Neuf, Paris',
    year: '1966',
    camera: 'Rolleiflex 2.8F',
    lens: 'Planar 80mm',
    caption: 'Tương phản đen trắng mạnh mẽ gợi nhớ phim Làn Sóng Mới Pháp.'
  },
  {
    title: 'Góc Quán Cà Phê Vỉa Hè Buổi Sáng',
    url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=80',
    location: 'Phan Đình Phùng, Hà Nội',
    year: '1989',
    camera: 'Nikon FM2',
    lens: 'Nikkor 50mm',
    caption: 'Hương cà phê phin đậm đà nhỏ từng giọt dưới vòm cây xà cừ cổ thụ.'
  },
  {
    title: 'Hẻm Golden Gai Đèn Lồng Đỏ',
    url: 'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=1200&q=80',
    location: 'Shinjuku, Tokyo',
    year: '1990',
    camera: 'Nikon F3HP',
    lens: 'Nikkor 28mm',
    caption: 'Những quán bar tí hon chỉ đủ 5 chỗ ngồi giữ trọn tâm hồn Tokyo cổ.'
  },
  {
    title: 'Mùa Thu Vàng Rơi Lối Nhỏ',
    url: 'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=1200&q=80',
    location: 'Rừng Đen, Đức',
    year: '1998',
    camera: 'Canon F-1 New',
    lens: 'FD 85mm',
    caption: 'Thảm lá phong vàng óng êm ái trải dài theo con đường ngập hơi sương.'
  },
  {
    title: 'Quán Cafe De Flore Đêm Mù',
    url: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&q=80',
    location: 'Saint-Germain, Paris',
    year: '1968',
    camera: 'Leica M3',
    lens: 'Noctilux 50mm',
    caption: 'Khói thuốc mờ ảo quyện cùng tiếng cười nói của những nghệ sĩ thời đại.'
  },
  {
    title: 'Hồ Nước Ngọc Bích Đáy Mây',
    url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    location: 'Hồ Moraine, Canada',
    year: '1995',
    camera: 'Pentax 67',
    lens: 'Takumar 105mm',
    caption: 'Mặt nước phẳng lặng như tấm gương soi bóng vách đá hùng vĩ.'
  },
  {
    title: 'Màu Nắng Trong Ngõ Vàng Nhỏ',
    url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1200&q=80',
    location: 'Hội An',
    year: '1991',
    camera: 'Yashica Electro 35',
    lens: 'Yashinon 45mm',
    caption: 'Giàn hoa giấy tím rực rỡ thả bóng mát xuống sân gạch rêu phong.'
  },
  {
    title: 'Chuyến Tàu Yamanote Nửa Đêm',
    url: 'https://images.unsplash.com/photo-1542051841857-5f90071e7989?auto=format&fit=crop&w=1200&q=80',
    location: 'Tokyo',
    year: '1988',
    camera: 'Ricoh GR1',
    lens: 'GR Lens 28mm',
    caption: 'Ánh đèn huỳnh quang toa tàu vút nhanh qua màn đêm thành phố không ngủ.'
  },
  {
    title: 'Bàn Tay Chỉnh Ống Kính Máy Ảnh Cơ',
    url: 'https://images.unsplash.com/photo-1471341971476-ae15ff5dd4ea?auto=format&fit=crop&w=1200&q=80',
    location: 'Studio Belleville, Paris',
    year: '1962',
    camera: 'Hasselblad 500C',
    lens: 'Sonnar 150mm',
    caption: 'Cảm giác cơ học tinh xảo của vòng khẩu độ và tốc độ màn trập đồng thau.'
  },
  {
    title: 'Tàu Chợ Chiều Về Ga Hà Nội',
    url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80',
    location: 'Ga Hàng Cỏ',
    year: '1987',
    camera: 'Pentax K1000',
    lens: 'SMC Pentax 50mm',
    caption: 'Còi tàu ngân vang xé toạc không gian chiều muộn, khói bốc lên mờ ảo.'
  },
  {
    title: 'Khu Trò Chơi Điện Tử Akihabara',
    url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80',
    location: 'Akihabara, Tokyo',
    year: '1997',
    camera: 'Konica Hexar AF',
    lens: 'Hexar 35mm',
    caption: 'Âm thanh 8-bit và sắc màu rực rỡ từ những cỗ máy arcade thập niên 90.'
  }
];

export function generatePhotosForRoll(
  count: number,
  stockName: string,
  startFrameIndex: number = 0
): FilmPhoto[] {
  const result: FilmPhoto[] = [];
  const bankLen = PHOTO_SAMPLE_BANK.length;

  for (let i = 0; i < count; i++) {
    const sample = PHOTO_SAMPLE_BANK[(startFrameIndex + i) % bankLen];
    const frameNum = startFrameIndex + i + 1;
    result.push({
      id: `gen-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 4)}`,
      url: sample.url,
      title: `${sample.title} (${frameNum})`,
      location: sample.location,
      year: sample.year,
      filmStockName: stockName,
      camera: sample.camera,
      lens: sample.lens,
      iso: '400',
      frameNumber: `${String(frameNum).padStart(2, '0')}A`,
      caption: sample.caption,
    });
  }

  return result;
}
