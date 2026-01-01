<template>
  <view class=""> wo shi </view>
</template>

<script setup>
  import { ref, onMounted } from 'vue'
  import { useDb } from '@/utils'
  const { find } = useDb()
  const getRoles = async () => {
    const res = await find('uni-id-roles')
    console.log(res)
  }
  onMounted(() => {
    getRoles()
  })
</script>

<style lang="scss" scoped></style>
