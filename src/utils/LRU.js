class LRUCache {
  constructor(limit = 10) {
    this.cache = new Map();  // 使用 Map 存储缓存项
    this.limit = limit;      // 设置缓存的最大容量
  }

  // 获取缓存项，如果不存在返回 undefined
  get(key, defaultValue) {
    if (!this.cache.has(key)) {
      if (defaultValue) {
        return defaultValue
      } else {
        return null
      }
    }
    const value = this.cache.get(key);
    // 访问该项时，将其移到 Map 的末尾，表示最近使用
    this.cache.delete(key);
    this.cache.set(key, value);
    return value
  }

  has(key) {
    return this.cache.has(key)
  }

  // 设置缓存项
  set(key, value) {
    // 如果 key 已经存在，删除旧的 key 以更新位置
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    // 如果缓存容量达到限制，删除最旧的缓存项
    else if (this.cache.size >= this.limit) {
      // 删除 Map 中第一个插入的项，即最旧的项
      this.cache.delete(this.cache.keys().next().value);
    }
    // 插入新的项
    this.cache.set(key, value);
  }

  /**
   * Batch set
   * @param {Array[Object]} values An obj array
   * @param {Function} keyGetter generate key
   */
  batchSet(values, keyGetter) {
    for (let value of values) {
      const key = keyGetter(value)
      if (!key) {
        console.warn('key cannot be null/undefined', value, values, keyGetter)
        continue
      }
      this.set(key, value)
    }
  }

  // 删除指定的缓存项
  delete(key) {
    this.cache.delete(key);
  }

  // 获取缓存的大小
  size() {
    return this.cache.size;
  }

  // 清空缓存
  clear() {
    this.cache.clear();
  }
}

export default LRUCache
