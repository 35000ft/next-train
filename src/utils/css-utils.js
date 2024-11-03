function scaleSize(sizeStr, factor) {
  const match = sizeStr.match(/^(\d+(?:\.\d+)?)([a-z%]+)$/); // 匹配数字和单位
  if (!match) {
    throw new Error(`尺寸格式不正确: ${sizeStr}`);
  }

  const [_, value, unit] = match;
  const scaledValue = parseFloat(value) * factor;

  return `${scaledValue}${unit}`;
}

function getNumberFromSizeString(sizeStr) {
  const match = sizeStr.match(/^(-?\d+(?:\.\d+)?)([a-z%]+)$/); // 匹配数字和单位
  if (!match) {
    throw new Error(`尺寸格式不正确: ${sizeStr}`);
  }
  const [_, value, unit] = match;
  return parseFloat(value)
}

export {scaleSize, getNumberFromSizeString}
