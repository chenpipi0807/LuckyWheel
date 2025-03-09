# 好运转盘

一个美观实用的幸运抽奖转盘应用，支持自定义选项、概率分配和多种抽奖模式。

![微信截图_20250309083525](https://github.com/user-attachments/assets/10d9ad1c-f251-480a-94bc-a34b2d555a47)


## 功能特性

- **美观界面**：采用现代化设计，使用SVG技术绘制转盘，确保完美的视觉体验
- **自定义选项**：可以添加、编辑和删除转盘上的选项
- **概率模式**：
  - **平均概率**：所有选项概率相等
  - **递增概率**：概率按顺序递增，让最后的选项有更高的中奖概率
- **抽奖模式**：
  - **常规模式**：转盘保持所有选项
  - **递减模式**：抽中后自动移除该选项
- **交互体验**：
  - 一键旋转抽奖
  - 支持鼠标拖拽手动旋转
  - 动画效果流畅自然
  - 清晰的结果显示

## 如何使用

### 快速启动

1. 双击 `启动好运转盘.bat` 文件
2. 浏览器将自动打开并显示好运转盘应用

### 操作指南

1. **管理选项**：
   - 点击左侧边栏中的 `添加选项` 按钮添加新选项
   - 点击现有选项旁的 ✕ 按钮删除选项
   - 直接点击并编辑选项文本

2. **设置模式**：
   - 选择 `常规` 或 `递减` 模式决定中奖后选项是保留还是移除
   - 选择 `平均概率` 或 `递增概率` 决定概率分配方式

3. **开始抽奖**：
   - 点击 `旋转` 按钮进行自动抽奖
   - 或用鼠标拖拽转盘手动旋转

4. **查看结果**：
   - 转盘停止后，中奖结果将显示在底部

## 技术信息

- 使用HTML, CSS和JavaScript开发
- 采用SVG技术实现转盘绘制
- 使用Python提供本地服务器功能

## 启动要求

- 有Python环境的用户可直接运行启动脚本
- 无需安装任何其他依赖

## 注意事项

- 每次旋转的结果是随机的，根据设定的概率分布
- 在递减模式下，所有选项被抽完后需要手动添加新选项

## 许可

本项目仅供个人学习和娱乐使用。
