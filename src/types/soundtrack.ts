export interface SoundtrackTrack {
  id: string;
  name: string;
  artist: string;
  genre: string;
  description: string;
  isCustom?: boolean;
  audioUrl?: string;
}

export const PRESET_SOUNDTRACKS: SoundtrackTrack[] = [
  {
    id: 'thama-drawn',
    name: 'THAMA - Drawn (그려본다)',
    artist: 'THAMA · Stone Music Playlist (OST Part 3)',
    genre: 'Korean Drama OST / Soul Ballad',
    description: 'Bản tình ca da diết, ấm áp từ ca khúc THAMA - Drawn đồng hành cùng những thước phim kỷ niệm.',
    audioUrl: '/assets/aistudio/Lyric_Video_THAMA_Drawn_________OST_Part_3________Stone_Music_Playlist_dc2c84f8.mp3'
  },
  {
    id: 'cinema-nostalgia',
    name: 'Hoài Niệm Điện Ảnh 1975',
    artist: 'CinéRoll Ambient Studio',
    genre: 'Cinematic Piano & Warm Strings',
    description: 'Những nốt dương cầm trầm ấm, du dương gợi nhớ ký ức thời gian trôi.'
  },
  {
    id: 'tokyo-synth',
    name: 'Tokyo Neo-Noir Đêm Mưa',
    artist: 'Analog Reel Orchestra',
    genre: 'Ambient Synthwave',
    description: 'Giai điệu synthpad analog sâu lắng, huyền ảo hòa cùng ánh đèn neon.'
  },
  {
    id: 'vinyl-rain',
    name: 'Mưa Chiều & Đĩa Than Cũ',
    artist: 'Vintage Film Soundscape',
    genre: 'Lo-Fi Rain & Vinyl Crackle',
    description: 'Âm thanh tiếng mưa rơi tí tách quyện cùng tiếng hạt kim đĩa than mộc mạc.'
  },
  {
    id: 'cafe-acoustic',
    name: 'Góc Quán Cũ Chiều Thu',
    artist: 'Old Quarter Acoustic',
    genre: 'Warm Acoustic Guitar',
    description: 'Tiếng đàn guitar mộc mạc thư thái trên vỉa hè đầy lá vàng rơi.'
  }
];
