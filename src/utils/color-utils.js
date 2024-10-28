function isDarkColor(color) {
  // 将颜色转换为 RGB 格式
  let r, g, b;

  if (color.startsWith("#")) {
    // 如果颜色是以 "#" 开头的十六进制格式
    color = color.slice(1); // 移除开头的 "#"

    if (color.length === 3) {
      // 如果是简写格式 #RGB
      r = parseInt(color[0] + color[0], 16);
      g = parseInt(color[1] + color[1], 16);
      b = parseInt(color[2] + color[2], 16);
    } else if (color.length === 6) {
      // 完整的十六进制格式 #RRGGBB
      r = parseInt(color.slice(0, 2), 16);
      g = parseInt(color.slice(2, 4), 16);
      b = parseInt(color.slice(4, 6), 16);
    } else {
      throw new Error("Invalid hex color format");
    }
  } else {
    throw new Error("Only hex colors are supported");
  }

  // 计算颜色亮度（使用常见的加权公式）
  const brightness = 0.299 * r + 0.587 * g + 0.114 * b;

  return brightness < 128
}

export {isDarkColor}
