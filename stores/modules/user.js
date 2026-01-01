import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import * as uniIdPagesStore from '@/uni_modules/uni-id-pages/common/store'

export const useUserStore = defineStore('user', () => {
  // State
  const userInfo = ref(uni.getStorageSync('uni-id-pages-userInfo') || {})

  // Getters
  const hasLogin = computed(() => {
    return Object.keys(userInfo.value).length != 0
  })

  const user_id = computed(() => {
    return userInfo.value._id || ''
  })

  //mutations
  const setUserInfo = (data, cover = false) => {
    uniIdPagesStore.mutations.setUserInfo(data, { cover })
  }

  // Actions
  const logout = async () => {
    await uniIdPagesStore.mutations.logout()
  }

  return {
    // State
    userInfo,

    // Getters
    hasLogin,
    user_id,

    // Mutations
    setUserInfo,

    // Actions
    logout
  }
})
