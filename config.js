/**
 * 第五人格创作者约稿平台 — 配置文件
 * 修改此处即可定制平台名称、密码、API 等核心参数
 */
const PLATFORM_CONFIG = {
  // 平台展示
  name: '第五人格创作者约稿平台',
  shortName: '第五人格 · 创作者约稿',

  // 运营后台密码
  adminPassword: 'xhsrj2026',

  // 认证 Token（需与 functions/api/db.js 中的 AUTH_TOKEN 一致）
  authToken: 'd5-creator-2026',

  // API 地址（Cloudflare Pages 部署后替换为实际域名）
  // 留空则使用 localStorage 本地模式
  apiUrl: '',

  // 本地存储 Key
  storageKey: 'd5_creator_platform_v1',

  // 创作者类型选项
  creatorTypes: ['博主', '主播'],
};
