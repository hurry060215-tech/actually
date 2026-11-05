# Actual 简体中文版

基于 [Actual Budget v26.11.0](https://github.com/actualbudget/actual/releases/tag/v26.11.0) 的简体中文本地化版本。上游基线：`1766241e3f4b3c578e424c4fa15f1eb83c0da17d`。

本项目只完善中文体验，保留原有记账、预算、计算、同步、导入导出和数据格式。不是 Actual 官方发行版。

## Windows 使用

安装包名称为 `Actual-zh-CN-26.11.0-windows-x64.exe`，适用于 Windows x64。使用独立构建的安装包，不会通过微软商店分发。本版本没有代码签名证书，Windows 可能显示未知发布者提示；请核对发布页提供的 SHA-256。

首次运行默认使用简体中文。如果已有设置明确选择了其他语言，请在 **Settings → Language → 简体中文** 切换。桌面原生菜单使用简体中文，按 `Alt` 可显示菜单栏。已有账本的名称、分类、商户和备注属于用户数据，不会被批量翻译或重命名。新建空白账本使用中文默认名称和分类；演示账本保留上游的示例数据。

安装前可在原应用的“设置 → 导出数据”中导出 ZIP 备份。此版本保持上游应用标识和账本格式；不要同时运行官方版与此版本操作同一账本。若之后安装官方更新，将恢复官方的中文覆盖情况。

## 汉化内容

- 内置完整的简体中文应用词条，无需额外下载语言包，也不受上游翻译完成度筛选影响。
- 主页面、预算、交易、报表、计划交易、规则、设置、新手导览、错误和恢复提示。
- Windows 原生菜单、启动等待页面、简体中文安装器。
- 中文语言标识与日期库映射；中文默认启动及可用的语言选择器。
- 动态主题选项、筛选条件和其他原先未接入翻译的界面文字。
- 修复动态插值的翻译键，保留金额、网址、变量和富文本标签。
- 统一交易对象、分类、分组、计划交易等术语。

品牌、文件格式、公式标识符、技术错误码、用户输入及第三方/远程发布的正文保留原文。外部官网、银行授权页及官方在线文档不属于应用内本地化资源。

## 从源码构建

在仓库根目录运行。使用 Node.js 22.18 或以上版本及仓库锁定的 Yarn 4.17.1，无需全局修改 Yarn 配置。

```powershell
node .yarn/releases/yarn-4.17.1.cjs install --immutable
node scripts/build-zh-cn.mjs
```

输出位于 `packages/desktop-electron/dist/`。构建脚本复用上游构建步骤，只增加跨平台的文件复制和中文安装器设置。当前脚本针对 Windows x64。原生模块使用锁定依赖自带的 Node-API 二进制，并在同版本 Electron 中进行数据库读写及密码哈希验证；验证失败时构建立即停止。SQLite 二进制会放入上游安装配置保留的 `build/Release` 路径，不改变依赖版本或财务逻辑。

中文资源位于 `packages/desktop-client/src/locales/zh-Hans.json`。上游其他语言仍可按原方式放入 `packages/desktop-client/locale/`；本项目的简体中文资源始终优先。

## 验证

```powershell
# 从当前源码提取英文基线，检查完整度、变量和富文本标签
node .yarn/releases/yarn-4.17.1.cjs generate:i18n
node scripts/check-zh-cn.mjs

# 类型与静态检查
node .yarn/releases/yarn-4.17.1.cjs typecheck
node .yarn/releases/yarn-4.17.1.cjs exec oxlint --type-aware --quiet

# 语言解析、主题和中文日期
node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/web test src/i18n.test.ts src/components/settings/Themes.test.tsx
node .yarn/releases/yarn-4.17.1.cjs workspace @actual-app/core exec vitest --run src/shared/locale.test.ts

# 桌面流程及成品验证（先完成构建）
node .yarn/releases/yarn-4.17.1.cjs workspace desktop-electron exec playwright test simplified-chinese.test.ts --workers=1
node scripts/smoke-packaged-zh-cn.cjs
```

测试使用独立的数据和浏览器配置目录，不访问日常账本。上游组件测试显式使用英文作为断言语言，中文体验由独立桌面流程测试验证。

## 上游与许可证

保留 [MIT 许可证](LICENSE.txt) 和上游版权声明。原简体中文翻译来自 [actualbudget/translations](https://github.com/actualbudget/translations)，本项目补齐并修订。向官方贡献翻译应通过 [Weblate](https://hosted.weblate.org/projects/actualbudget/)；本仓库用于维护可直接构建的中文版本。
