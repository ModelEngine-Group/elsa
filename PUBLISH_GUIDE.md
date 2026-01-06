# ELSA 模块发布指南

本指南将帮助您了解如何将 @fit-elsa/elsa 和 @fit-elsa/agent-flow 发布到 npm 仓库。

## 前置条件

在开始发布之前，请确保您已完成以下准备工作：

1. **安装 Node.js 和 npm**
   - 确保您的系统上已安装 Node.js 14.x 或更高版本
   - 确保您的系统上已安装 npm 6.x 或更高版本
   - 可以通过 `node --version` 和 `npm --version` 检查版本

2. **设置 PowerShell 执行策略**
   ```powershell
   Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned -Force
   ```

3. **npm 账号准备**
   - 拥有 npm 账号
   - 该账号已加入 @fit-elsa 组织并具有发布权限
   - 已登录 npm 账号（可以通过 `npm login` 命令登录）

## 发布前检查清单

在发布前，请确保已完成以下检查：

- [ ] 确认代码已经过充分测试
- [ ] 确认版本号已正确设置（遵循语义化版本规范）
- [ ] 确认 README.md 文档已更新并包含所有必要信息
- [ ] 确认 package.json 中的依赖关系正确
- [ ] 确认构建配置正确

## 发布流程

1. **发布 @fit-elsa/elsa**（核心框架模块）

## 使用发布脚本

### 直接发布 @fit-elsa/elsa

1. 打开命令行终端
2. 导航到 elsa 目录
3. 执行以下命令：
   ```bash
   # 安装依赖
   npm install
   
   # 构建项目
   npm run build
   
   # 发布到 npm（确保已登录且有发布权限）
   npm publish --access public
   ```

### 脚本流程

运行每个模块的发布脚本后，它将执行以下操作：

1. 检查 npm 和 Node.js 版本
2. 确认您已登录 npm 账号（如果未登录，将提示您登录）
3. 询问您是否要发布 alpha 版本
4. 如果选择发布 alpha 版本，自动更新当前模块的版本号为 alpha 版本
5. 安装依赖
6. 构建当前模块
7. 验证构建结果
8. 发布到 npm 仓库


## 版本管理

我们建议遵循 [语义化版本规范](https://semver.org/lang/zh-CN/) 来管理版本号：

- **主版本号（Major）**：当你做了不兼容的 API 修改
- **次版本号（Minor）**：当你添加了向下兼容的新功能
- **修订号（Patch）**：当你做了向下兼容的问题修正


## 常见问题及解决方案

### 1. 发布权限问题

**症状**：`npm ERR! 403 Forbidden - You do not have permission to publish "@fit-elsa/elsa".`

**解决方案**：
- 确保您的 npm 账号已加入 @fit-elsa 组织
- 确保您在组织中具有发布权限
- 确认您已正确登录 npm 账号（可以通过 `npm whoami` 检查）

### 2. 版本冲突问题

**症状**：`npm ERR! 403 Forbidden - You cannot publish over the previously published versions.`

**解决方案**：
- 升级版本号（参考上面的版本管理部分）
- 确保您使用的版本号尚未发布

### 3. 构建失败问题

**症状**：构建过程中出现错误，导致无法生成构建文件

**解决方案**：
- 检查错误信息，确定具体的失败原因
- 确保所有依赖都已正确安装
- 检查构建配置是否正确

## 最佳实践

- 考虑先发布 alpha/beta 版本进行测试
- 发布后检查 npm 仓库中的包是否正确
- 及时更新文档，确保文档与代码同步
- 遵循语义化版本规范管理版本号