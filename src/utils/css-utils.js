function scaleSize(sizeStr, factor) {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)([a-z%]+)$/); // 匹配数字和单位
  if (!match) {
    throw new Error("尺寸格式不正确");
  }

  const [_, value, unit] = match;
  const scaledValue = parseFloat(value) * factor;

  return `${scaledValue}${unit}`;
}

export {scaleSize}
