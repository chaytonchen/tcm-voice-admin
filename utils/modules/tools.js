export const useTools = () => {
  /**
   * 生成数组的随机索引
   * @param {Array} array - 输入数组
   * @returns {number} 随机索引
   */
  const randomIndex = (array = []) => {
    return Math.floor(Math.random() * array.length)
  }

  /**
   * 将电话号码中间4位替换为*
   * @param {string} mobile - 电话号码
   * @returns {string} 掩码处理后的电话号码
   */
  const mobileMask = (mobile = '') => {
    if (!mobile || typeof mobile !== 'string' || mobile.length < 11) {
      return mobile
    }
    return mobile.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
  }

  /**
   * 格式化时间为指定格式
   * @param {Date} date - 时间对象
   * @param {string} format - 时间格式，默认yyyy-MM-dd HH:mm:ss
   * @returns {string} 格式化后的时间字符串
   */
  const formatTime = (date, format = 'yyyy-MM-dd HH:mm:ss') => {
    if (!date) return ''
    const year = new Date(date).getFullYear()
    const month = String(new Date(date).getMonth() + 1).padStart(2, '0')
    const day = String(new Date(date).getDate()).padStart(2, '0')
    const hours = String(new Date(date).getHours()).padStart(2, '0')
    const minutes = String(new Date(date).getMinutes()).padStart(2, '0')
    const seconds = String(new Date(date).getSeconds()).padStart(2, '0')
    return format
      .replace('yyyy', year)
      .replace('MM', month)
      .replace('dd', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds)
  }

  /**
   * 将分转换为元
   * @param {number} cents - 分金额
   * @returns {number} 元金额
   */
  const centsToYuan = (cents = 0) => {
    return cents / 100
  }

  /**
   * 将元转换为分
   * @param {number} yuan - 元金额
   * @returns {number} 分金额
   */
  const yuanToCents = (yuan = 0) => {
    return Math.round(yuan * 100)
  }

  /**
   * 生成订单号
   * 订单号格式：[3位门店标识][1位用户标识][10位时间戳][4位随机数]
   * 示例：001C2023120114301234（门店001的客户端用户在2023年12月1日14点30分生成的订单，随机数为1234）
   *
   * @param {string|number} storeId - 门店ID，会转换为3位数字格式（001-999）
   * @param {string} userType - 用户类型，'c'表示客户端用户，其他值表示商家端用户
   * @returns {string} 18位订单号
   *
   * @example
   * generateOrderNo(1, 'c')
   * // 返回类似：001C2023120114301234
   *
   * @example
   * generateOrderNo(25, 'b')
   * // 返回类似：025B2023120114305678
   */
  function generateOrderNo(storeId, userType) {
    // 1. 门店标识（补3位，支持001-999）
    const storeFlag = String(storeId).padStart(3, '0')
    // 2. 用户端标识（C/B）
    const userFlag = userType === 'c' ? 'C' : 'B'
    // 3. 时间戳（年月日时分，10位）
    const timeStr = new Date().toISOString().slice(0, 16).replace(/[-T:]/g, '')
    // 4. 4位随机数
    const randomStr = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')

    return `${storeFlag}${userFlag}${timeStr}${randomStr}`
  }

  // getLocation 函数已移至 useLocation 组合式函数中

  /**
   * 计算两个地理位置之间的距离
   * @param {Object} currentLocation - 当前位置，包含latitude和longitude
   * @param {Object} targetLocation - 目标位置，包含latitude和longitude
   * @returns {string} 格式化后的距离字符串，如"<100m"、"500m"、"5km"
   */
  const calculateDistance = (currentLocation, targetLocation) => {
    // 检查参数是否合法
    if (
      !currentLocation ||
      !targetLocation ||
      !currentLocation.latitude ||
      !currentLocation.longitude ||
      !targetLocation.latitude ||
      !targetLocation.longitude
    ) {
      return ''
    }

    // 地球半径（米）
    const R = 6371e3
    // 将经纬度转换为弧度
    const lat1 = (currentLocation.latitude * Math.PI) / 180
    const lat2 = (targetLocation.latitude * Math.PI) / 180
    const deltaLat = ((targetLocation.latitude - currentLocation.latitude) * Math.PI) / 180
    const deltaLon = ((targetLocation.longitude - currentLocation.longitude) * Math.PI) / 180

    // Haversine公式
    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c // 距离（米）

    // 格式化距离
    if (distance < 100) {
      return '<100m'
    } else if (distance < 1000) {
      return `${Math.round(distance)}m`
    } else {
      return `${(distance / 1000).toFixed(1)}km`
    }
  }

  /**
   * 生成一个不重复的随机字符串
   * @param {number} length - 随机字符串长度，默认10位
   * @returns {string} 随机字符串
   */
  const generateRandomCode = (length = 10) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // 不包含容易混淆的字母I、O、0、1
    let result = ''
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length)
      result += chars.charAt(randomIndex)
    }
    return result
  }

  return {
    formatTime,
    randomIndex,
    centsToYuan,
    yuanToCents,
    generateOrderNo,
    mobileMask,
    calculateDistance
  }
}
