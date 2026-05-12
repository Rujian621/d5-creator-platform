// 多游戏平台配置
// 通过域名自动识别当前游戏，同一套代码部署到不同域名即可自动切换

// 域名 → 游戏映射（可在 Cloudflare Pages 自定义域名时对应）
const DOMAIN_MAP = {
  // 第五人格
  'd5-creator-platform.pages.dev': 'd5',
  // 洛克王国
  'lk-creator-platform.pages.dev': 'lk',
  // 超自然行动组
  'czr-creator-platform.pages.dev': 'czr',
  // 鹅鸭杀
  'gag-creator-platform.pages.dev': 'gag',
};

// 也支持 URL 参数 ?game=xxx 用于本地测试
function getGameKey() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('game') && ['d5','lk','czr','gag'].includes(params.get('game'))) {
    return params.get('game');
  }
  const host = window.location.hostname;
  for (const [domain, key] of Object.entries(DOMAIN_MAP)) {
    if (host.includes(domain) || host === domain) return key;
  }
  return 'd5'; // 默认第五人格
}

const GAMES = {
  d5: {
    name: '第五人格',
    emoji: '🎭',
    themeColor: '#6c3eb8',
    themeHover: '#5a2ea0',
    themeLight: 'from-purple-50 via-white to-pink-50',
    accentText: 'text-purple-600',
  },
  lk: {
    name: '洛克王国',
    emoji: '🔮',
    themeColor: '#2563eb',
    themeHover: '#1d4ed8',
    themeLight: 'from-blue-50 via-white to-cyan-50',
    accentText: 'text-blue-600',
  },
  czr: {
    name: '超自然行动组',
    emoji: '👻',
    themeColor: '#dc2626',
    themeHover: '#b91c1c',
    themeLight: 'from-red-50 via-white to-orange-50',
    accentText: 'text-red-600',
  },
  gag: {
    name: '鹅鸭杀',
    emoji: '🦆',
    themeColor: '#059669',
    themeHover: '#047857',
    themeLight: 'from-green-50 via-white to-emerald-50',
    accentText: 'text-green-600',
  },
};

const GAME_KEY = getGameKey();
const GAME_CONFIG = GAMES[GAME_KEY] || GAMES.d5;
GAME_CONFIG.key = GAME_KEY;
GAME_CONFIG.adminPwd = 'xhsrj2026';
GAME_CONFIG.authToken = 'd5-creator-2026';
