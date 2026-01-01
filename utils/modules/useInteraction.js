import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

export const useInteraction = () => {
  // 消息提示
  const msg = (message, type = 'info') => {
    ElMessage({
      message,
      type,
      duration: 2000
    })
  }

  // 确认对话框
  const confirm = async (message, title = '提示', options = {}) => {
    try {
      await ElMessageBox.confirm(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning',
        ...options
      })
      return true
    } catch (err) {
      return false
    }
  }

  // 提示对话框
  const alert = async (message, title = '提示', options = {}) => {
    try {
      await ElMessageBox.alert(message, title, {
        confirmButtonText: '确定',
        ...options
      })
      return true
    } catch (err) {
      return false
    }
  }

  // 输入对话框
  const prompt = async (message, title = '提示', options = {}) => {
    try {
      const result = await ElMessageBox.prompt(message, title, {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        ...options
      })
      return {
        success: true,
        value: result.value
      }
    } catch (err) {
      return {
        success: false,
        value: ''
      }
    }
  }
  let loadingInstance
  const showLoading = (addOptions = {}) => {
    const options = {
      fullscreen: true,
      ...addOptions
    }
    loadingInstance = ElLoading.service(options)
  }

  const hideLoading = () => {
    if (loadingInstance) loadingInstance.close()
  }

  return {
    msg,
    confirm,
    alert,
    prompt,
    showLoading,
    hideLoading
  }
}
