# 字体系统使用指南

## 概述
本项目使用统一的字体系统来管理所有字体大小、字重和行高，确保整个应用的视觉一致性。

## 字体大小类

### 基础字体大小
- `.text-xs` - 10px (超小)
- `.text-sm` - 12px (小)
- `.text-base` - 14px (基础)
- `.text-md` - 16px (中等)
- `.text-lg` - 18px (大)
- `.text-xl` - 20px (超大)
- `.text-2xl` - 24px (2倍大)
- `.text-3xl` - 28px (3倍大)
- `.text-4xl` - 32px (4倍大)
- `.text-5xl` - 36px (5倍大)

### 字重类
- `.font-light` - 300 (细)
- `.font-normal` - 400 (正常)
- `.font-medium` - 500 (中等)
- `.font-semibold` - 600 (半粗)
- `.font-bold` - 700 (粗)
- `.font-extrabold` - 800 (超粗)

## 使用方法

### 在JSX中使用
```jsx
<div className="text-lg font-bold">这是大号粗体文本</div>
<p className="text-base font-normal">这是正常大小的段落文本</p>
<h1 className="text-4xl font-bold">这是大标题</h1>
```

### 在CSS中使用变量
```css
.my-component {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  line-height: var(--line-height-normal);
}
```

### 修改默认字体大小
要修改整个应用的默认字体大小，编辑 `src/styles/fonts.css` 文件中的 `:root` 部分：

```css
:root {
  --font-size-base: 16px; /* 修改这里来改变默认字体大小 */
  /* 其他变量... */
}
```

## 响应式字体
你可以结合媒体查询来创建响应式字体：

```css
@media (max-width: 768px) {
  :root {
    --font-size-base: 14px;
    --font-size-lg: 16px;
  }
}
```

## 注意事项
1. 字体配置文件 `fonts.css` 必须在 `index.css` 之前引入
2. 所有字体相关的样式都应该使用CSS变量，而不是硬编码的值
3. 新增字体大小时，请同时更新CSS变量和对应的工具类 