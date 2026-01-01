<template>
  <view class="h-full overflow-y-auto">
    <div class="container p-df">
      <!-- 页面标题和操作按钮 -->
      <div class="flex justify-between items-center mb-20">
        <h1 class="text-xl font-bold text-primary">店铺详情</h1>
        <div class="flex gap-10">
          <!-- 审核操作按钮组 -->
          <template v-if="detail.status === 0">
            <el-button type="success" size="default" @click="handleApprove" :disabled="submitting">
              审核通过
            </el-button>
            <el-button type="danger" size="default" @click="handleReject" :disabled="submitting">
              审核拒绝
            </el-button>
          </template>

          <!-- 关闭店铺按钮 -->
          <template v-else-if="detail.status === 1">
            <el-button
              type="warning"
              size="default"
              @click="handleCloseShop"
              :disabled="submitting"
            >
              关闭店铺
            </el-button>
          </template>

          <!-- 开启店铺按钮 -->
          <template v-else-if="detail.status === 3">
            <el-button type="success" size="default" @click="handleOpenShop" :disabled="submitting">
              开启店铺
            </el-button>
          </template>

          <!-- 返回按钮 -->
          <el-button size="default" @click="goBack"> 返回列表 </el-button>
        </div>
      </div>

      <!-- 加载状态 -->
      <el-skeleton :loading="loading" animated>
        <!-- 店铺基本信息卡片 -->
        <el-card shadow="hover" class="mb-20">
          <template #header>
            <div class="flex justify-between items-center">
              <h3 class="text-lg font-semibold">基本信息</h3>
              <el-tag :type="getStatusType(detail.status)" effect="light">
                {{ getStatusText(detail.status) }}
              </el-tag>
            </div>
          </template>

          <el-descriptions :column="2" :border="true" class="mb-20">
            <el-descriptions-item label="店铺名称" :span="2"
              >{{ detail.name || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="创建时间"
              >{{ formatTime(detail.created_at) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="更新时间"
              >{{ formatTime(detail.updated_at) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="店铺评分" v-if="detail.score"
              >{{ detail.score }}
            </el-descriptions-item>
            <el-descriptions-item label="店铺状态"
              >{{ getStatusText(detail.status) }}
            </el-descriptions-item>
            <el-descriptions-item label="店铺介绍" :span="2"
              >{{ detail.description || '暂无介绍' }}
            </el-descriptions-item>

            <!-- 拒绝信息展示 - 仅当状态为拒绝时显示 -->
            <template v-if="detail.status === 2">
              <el-descriptions-item label="审核时间" v-if="detail.audit_time"
                >{{ formatTime(detail.audit_time) }}
              </el-descriptions-item>
              <el-descriptions-item label="审核人" v-if="detail.audit_by">
                <template v-if="Array.isArray(detail.audit_by) && detail.audit_by[0]">
                  {{ detail.audit_by[0]?.nickname || detail.audit_by[0]?.username || '无' }}
                </template>
                <template v-else>
                  {{ detail.audit_by || '无' }}
                </template>
              </el-descriptions-item>
              <el-descriptions-item label="拒绝原因" :span="2"
                >{{ detail.reason || '无' }}
              </el-descriptions-item>
            </template>
          </el-descriptions>
        </el-card>

        <!-- 联系人信息卡片 -->
        <el-card shadow="hover" class="mb-20">
          <template #header>
            <h3 class="text-lg font-semibold">联系人信息</h3>
          </template>

          <el-descriptions :column="2" :border="true">
            <el-descriptions-item label="联系人姓名">{{
              detail.contact_person || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{
              detail.contact_phone || '-'
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 店铺地址卡片 -->
        <el-card shadow="hover" class="mb-20">
          <template #header>
            <h3 class="text-lg font-semibold">店铺地址</h3>
          </template>

          <el-descriptions :column="2" :border="true">
            <el-descriptions-item label="省份">{{ detail.province || '-' }}</el-descriptions-item>
            <el-descriptions-item label="城市">{{ detail.city || '-' }}</el-descriptions-item>
            <el-descriptions-item label="区县">{{ detail.district || '-' }}</el-descriptions-item>
            <el-descriptions-item label="详细地址">{{
              detail.address || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="纬度" v-if="detail.latitude">{{
              detail.latitude
            }}</el-descriptions-item>
            <el-descriptions-item label="经度" v-if="detail.longitude">{{
              detail.longitude
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 营业时间卡片 -->
        <el-card shadow="hover" class="mb-20">
          <template #header>
            <h3 class="text-lg font-semibold">营业时间</h3>
          </template>

          <el-descriptions :column="2" :border="true">
            <el-descriptions-item label="开始时间">{{
              detail.business_hours?.start || '-'
            }}</el-descriptions-item>
            <el-descriptions-item label="结束时间">{{
              detail.business_hours?.end || '-'
            }}</el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 店铺Logo卡片 -->
        <el-card shadow="hover" class="mb-20">
          <template #header>
            <h3 class="text-lg font-semibold">店铺Logo</h3>
          </template>

          <el-descriptions :column="2" :border="true">
            <el-descriptions-item label="Logo">
              <div class="flex items-center gap-10">
                <el-image
                  v-if="detail.logo"
                  :src="detail.logo"
                  fit="cover"
                  class="w-80 h-80 object-cover round cursor-pointer"
                  @click="previewImage(detail.logo)"
                >
                  <template #placeholder>
                    <div
                      class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500 round"
                    >
                      <el-icon class="text-40"><Picture /></el-icon>
                    </div>
                  </template>
                </el-image>
                <span v-else class="text-gray-500">暂无Logo</span>
              </div>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>

        <!-- 店铺图片卡片 -->
        <el-card shadow="hover" class="mb-20">
          <template #header>
            <h3 class="text-lg font-semibold">店铺图片</h3>
          </template>

          <div class="grid grid-cols-4 gap-sm mt-10">
            <el-image
              v-for="(image, index) in detail.images || []"
              :key="index"
              :src="image"
              fit="cover"
              class="w-full h-120 object-cover radius-md cursor-pointer"
              @click="previewImage(image)"
            >
              <template #placeholder>
                <div
                  class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-500"
                >
                  <el-icon class="text-20"><Picture /></el-icon>
                  <span class="ml-5">加载中...</span>
                </div>
              </template>
            </el-image>
            <div
              v-if="!detail.images || detail.images.length === 0"
              class="col-span-4 text-center py-20 text-gray-500"
            >
              <el-icon class="text-40 mb-10"><Picture /></el-icon>
              <br />
              暂无店铺图片
            </div>
          </div>
        </el-card>

        <!-- 人员信息卡片 -->
        <el-card shadow="hover" class="mb-20">
          <template #header>
            <h3 class="text-lg font-semibold">人员信息</h3>
          </template>

          <!-- 店长信息 -->
          <div class="mb-20">
            <h4 class="text-md font-medium mb-10">店长</h4>
            <el-descriptions
              :column="3"
              :border="true"
              v-if="
                detail.shop_keeper_id &&
                Array.isArray(detail.shop_keeper_id) &&
                detail.shop_keeper_id[0]
              "
            >
              <el-descriptions-item label="姓名">{{
                detail.shop_keeper_id?.[0].nickname || detail.shop_keeper_id?.[0].username || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{
                detail.shop_keeper_id?.[0].mobile || '无'
              }}</el-descriptions-item>
            </el-descriptions>
            <div v-else class="text-gray-500 bg-gray-50 p-10 radius-md">暂无店长信息</div>
          </div>

          <!-- 核销员信息 -->
          <div class="mb-20">
            <h4 class="text-md font-medium mb-10">核销员</h4>
            <el-descriptions
              :column="3"
              :border="true"
              v-if="
                detail.shop_verifier_id &&
                Array.isArray(detail.shop_verifier_id) &&
                detail.shop_verifier_id[0]
              "
            >
              <el-descriptions-item label="姓名">{{
                detail.shop_verifier_id[0]?.nickname || detail.shop_verifier_id[0]?.username || '无'
              }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{
                detail.shop_verifier_id[0]?.mobile || '无'
              }}</el-descriptions-item>
            </el-descriptions>
            <div v-else class="text-gray-500 bg-gray-50 p-10 radius-md">暂无核销员信息</div>
          </div>

          <!-- 理疗师列表 -->
          <div>
            <h4 class="text-md font-medium mb-10">理疗师列表</h4>
            <el-table
              :data="detail.shop_staff_ids || []"
              border
              v-if="
                detail.shop_staff_ids &&
                Array.isArray(detail.shop_staff_ids) &&
                detail.shop_staff_ids.length > 0
              "
            >
              <el-table-column label="姓名" min-width="100">
                <template #default="scope">
                  {{ scope.row.nickname || scope.row.username || '无' }}
                </template>
              </el-table-column>
              <el-table-column label="手机号" min-width="120">
                <template #default="scope">
                  {{ scope.row.mobile || '无' }}
                </template>
              </el-table-column>
              <el-table-column label="角色" min-width="100">
                <template #default="scope"> 理疗师 </template>
              </el-table-column>
            </el-table>
            <div v-else class="text-gray-500 bg-gray-50 p-10 radius-md">暂无理疗师信息</div>
          </div>
        </el-card>
      </el-skeleton>
    </div>

    <!-- 图片预览组件 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewList"
      @close="previewVisible = false"
    />
  </view>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useDb, useInteraction, useTools } from '@/utils'
  import { Picture } from '@element-plus/icons-vue'
  import { onLoad } from '@dcloudio/uni-app'
  import { useUserStore } from '@/stores'
  const userStore = useUserStore()
  const { user_id } = storeToRefs(userStore)

  // 数据库操作
  const { findOne, update, db } = useDb()
  const { msg, showLoading, hideLoading, confirm, prompt } = useInteraction()
  const { formatTime } = useTools()

  // 响应式数据
  const detail = ref({})
  const loading = ref(false)
  const submitting = ref(false)
  const previewVisible = ref(false)
  const previewList = ref([])

  // 路由参数
  const routeParams = ref({})

  // 状态文本映射
  const statusMap = {
    0: '未审核',
    1: '审核通过',
    2: '审核拒绝',
    3: '已关闭'
  }

  // 状态类型映射
  const statusTypeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger',
    3: 'info'
  }

  // 获取状态文本
  const getStatusText = (status) => {
    return statusMap[status] || status
  }

  // 获取状态类型
  const getStatusType = (status) => {
    return statusTypeMap[status] || 'info'
  }

  // 获取角色文本
  const getRoleText = (role) => {
    if (!role || !Array.isArray(role)) return '无'
    const roleMap = {
      shop_keeper: '店长',
      shop_verifier: '核销员',
      shop_staff: '理疗师',
      platform_admin: '平台管理员',
      tenant_admin: '租户管理员'
    }
    return role.map((r) => roleMap[r] || r).join(', ')
  }

  // 获取店铺详情数据
  const fetchShopDetail = async () => {
    loading.value = true
    try {
      // 获取路由参数中的店铺ID
      const shopId = routeParams.value.id
      if (!shopId) {
        msg('缺少店铺ID', 'error')
        goBack()
        return
      }
      // 构建查询条件
      const where = `_id == '${shopId}'`
      const field =
        '_id, name, tenant_id, contact_phone, contact_person, province, city, district, address, latitude, longitude, description, business_hours, business_license, status, reason, audit_time, audit_by, created_at, updated_at, score, logo, images, shop_keeper_id, shop_staff_ids, shop_verifier_id,audit_by, audit_time, reason'
      const shopCollection = db.collection('tcm-shops').where(where).field(field).getTemp()
      const userCollection = db
        .collection('uni-id-users')
        .field('_id, nickname, username, mobile')
        .getTemp()
      const collections = [shopCollection, userCollection]

      // 调用数据库查询
      const res = await findOne(collections)
      console.log('res', res)
      if (res.success) {
        detail.value = res.data || {}
      } else {
        msg(res.errMsg || '获取店铺详情失败', 'error')
        goBack()
      }
    } catch (error) {
      console.error('获取店铺详情失败:', error)
      msg('获取店铺详情失败', 'error')
      goBack()
    } finally {
      loading.value = false
    }
  }

  // 审核通过处理
  const handleApprove = async () => {
    try {
      const confirmResult = await confirm('确定要审核通过该店铺吗？', '审核确认')

      if (!confirmResult) return

      submitting.value = true
      // 首先需要更改店长用户绑定此店铺
      const tenant_id = detail.value.tenant_id
      const shop_keeper_id = detail.value.shop_keeper_id[0]?._id
      if (!shop_keeper_id) return msg('店铺店长不存在', 'error')
      showLoading('正在处理审核...')
      // 先绑定店长，用传统的db对象，jql不支持db.command更新数据库、
      // 先查询用户的权限，然后给其添加一个shop_keeper的权限

      const shopKeeperWhere = `_id == '${shop_keeper_id}'`
      const userRes = await findOne('uni-id-users', shopKeeperWhere, {
        field: 'role'
      })
      if (!userRes.success) {
        return msg(userRes.errMsg || '查询店长用户失败', 'error')
      }
      const userRole = userRes.data?.role || []

      if (!userRole.includes('shop_keeper')) {
        userRole.push('shop_keeper')
      }

      const shopKeeperUpdateData = {
        tenant_id,
        role: userRole
      }
      const shopKeeperRes = await update('uni-id-users', shopKeeperWhere, shopKeeperUpdateData)
      if (!shopKeeperRes.success) {
        return msg(shopKeeperRes.errMsg || '绑定店长失败', 'error')
      }
      // 构建更新数据
      const updateData = {
        status: 1,
        audit_time: Date.now(),
        audit_by: user_id.value, // TODO: 替换为实际登录用户ID
        reason: '',
        updated_at: Date.now()
      }

      // 执行更新操作
      const where = `_id == '${detail.value._id}'`

      const res = await update('tcm-shops', where, updateData)
      if (res.success) {
        msg('审核通过成功', 'success')

        // 更新本地数据
        Object.assign(detail.value, updateData)
        // 通知列表页刷新
        uni.$emit('refresh')
        goBack()
      } else {
        msg(res.errMsg || '审核通过失败', 'error')
      }
    } catch (error) {
      console.error('审核通过失败:', error)
      msg('审核通过失败', 'error')
    } finally {
      submitting.value = false
      hideLoading()
    }
  }

  // 审核拒绝处理
  const handleReject = async () => {
    try {
      // 弹出输入框获取拒绝原因
      const result = await prompt('请输入拒绝原因', '审核拒绝')

      if (!result || !result.success) return

      const rejectReason = result.value.trim()
      if (!rejectReason) {
        msg('请输入拒绝原因', 'warning')
        return
      }

      submitting.value = true
      showLoading('正在处理审核...')

      // 构建更新数据
      const updateData = {
        status: 2,
        audit_time: Date.now(),
        audit_by: user_id.value, // TODO: 替换为实际登录用户ID
        reason: rejectReason,
        updated_at: Date.now()
      }

      // 执行更新操作
      const where = `_id == '${detail.value._id}'`
      const res = await update('tcm-shops', where, updateData)

      if (res.success) {
        msg('审核拒绝成功', 'success')
        // 更新本地数据
        Object.assign(detail.value, updateData)
        // 通知列表页刷新
        uni.$emit('refresh')
        goBack()
      } else {
        msg(res.errMsg || '审核拒绝失败', 'error')
      }
    } catch (error) {
      console.error('审核拒绝失败:', error)
      msg('审核拒绝失败', 'error')
    } finally {
      submitting.value = false
      hideLoading()
    }
  }

  // 关闭店铺处理
  const handleCloseShop = async () => {
    try {
      const confirmResult = await confirm(
        '确定要关闭该店铺吗？关闭后店铺将无法正常运营。',
        '关闭店铺确认'
      )

      if (!confirmResult) return

      submitting.value = true
      showLoading('正在关闭店铺...')

      // 构建更新数据
      const updateData = {
        status: 3,
        updated_at: Date.now()
      }

      // 执行更新操作
      const where = `_id == '${detail.value._id}'`
      const res = await update('tcm-shops', where, updateData)

      if (res.success) {
        msg('店铺关闭成功', 'success')
        // 更新本地数据
        Object.assign(detail.value, updateData)
        // 通知列表页刷新
        uni.$emit('refresh')
        goBack()
      } else {
        msg(res.errMsg || '店铺关闭失败', 'error')
      }
    } catch (error) {
      console.error('关闭店铺失败:', error)
      msg('关闭店铺失败', 'error')
    } finally {
      submitting.value = false
      hideLoading()
    }
  }

  // 开启店铺处理
  const handleOpenShop = async () => {
    try {
      const confirmResult = await confirm(
        '确定要开启该店铺吗？开启后店铺将恢复正常运营。',
        '开启店铺确认'
      )

      if (!confirmResult) return

      submitting.value = true
      showLoading('正在开启店铺...')

      // 构建更新数据 - 与关闭店铺相反，status改为1
      const updateData = {
        status: 1,
        updated_at: Date.now()
      }

      // 执行更新操作
      const where = `_id == '${detail.value._id}'`
      const res = await update('tcm-shops', where, updateData)

      if (res.success) {
        msg('店铺开启成功', 'success')
        // 更新本地数据
        Object.assign(detail.value, updateData)
        // 通知列表页刷新
        uni.$emit('refresh')
        goBack()
      } else {
        msg(res.errMsg || '店铺开启失败', 'error')
      }
    } catch (error) {
      console.error('开启店铺失败:', error)
      msg('开启店铺失败', 'error')
    } finally {
      submitting.value = false
      hideLoading()
    }
  }

  // 图片预览
  const previewImage = (url) => {
    previewList.value = [url]
    previewVisible.value = true
  }

  // 返回上一页
  const goBack = () => {
    uni.navigateBack()
  }

  // 页面加载时获取数据
  onLoad((options) => {
    if (options && options.id) {
      routeParams.value = options
      fetchShopDetail()
    } else {
      msg('缺少店铺ID', 'error')
      goBack()
    }
  })
</script>

<style lang="scss" scoped>
  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .grid-cols-4 {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 1024px) {
    .grid-cols-4 {
      grid-template-columns: repeat(3, 1fr);
    }
  }

  @media (max-width: 768px) {
    .grid-cols-4 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (max-width: 480px) {
    .grid-cols-4 {
      grid-template-columns: 1fr;
    }
  }
</style>
