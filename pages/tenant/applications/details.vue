<template>
  <div class="h-full overflow-y-scroll">
    <!-- 页面标题和操作按钮 -->
    <div class="flex justify-between items-center mb-df">
      <h1 class="text-lg font-bold text-primary">{{ title }}</h1>
      <div class="flex" v-if="!isView && detail.status === 0">
        <el-button type="primary" class="mr-10" @click="handleApprove">审核通过</el-button>
        <el-button type="danger" @click="handleReject">拒绝申请</el-button>
        <el-button @click="goBack">返回</el-button>
      </div>
      <div v-else>
        <el-button @click="goBack">返回</el-button>
      </div>
    </div>

    <!-- 加载状态 -->
    <el-skeleton :loading="loading" animated>
      <!-- 详情卡片 -->
      <el-card shadow="hover" class="mb-df">
        <!-- 基本信息 -->
        <template #header>
          <div class="flex justify-between items-center">
            <span>基本信息</span>
            <el-tag :type="getStatusType(detail.status)" effect="light" class="status-tag ml-10">
              {{ getStatusText(detail.status) }}
            </el-tag>
          </div>
        </template>

        <el-descriptions :column="2" :border="true">
          <el-descriptions-item label="申请时间">{{
            formatTime(detail.create_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="登录手机号">{{ detail.login_phone }}</el-descriptions-item>
          <el-descriptions-item label="商家类型">{{
            getMerchantTypeText(detail.merchant_type)
          }}</el-descriptions-item>
          <el-descriptions-item label="申请状态">{{
            getStatusText(detail.status)
          }}</el-descriptions-item>
          <el-descriptions-item label="审核时间" v-if="detail.audit_time">{{
            formatTime(detail.audit_time)
          }}</el-descriptions-item>
          <el-descriptions-item
            label="审核人"
            v-if="detail.status !== 0 && detail.audit_by?.[0]._id"
            >{{
              detail.audit_by?.[0].nickname || detail.audit_by?.[0].username
            }}</el-descriptions-item
          >
          <el-descriptions-item label="已注册用户" v-if="existingUser">
            <view class="flex align-center gap-df"
              ><text>用户名：{{ existingUser.nickname || existingUser.username }}</text>
              <el-button type="warning" size="small" @click="handleBindUser"
                >绑定用户并审核通过</el-button
              >
            </view>
          </el-descriptions-item>

          <el-descriptions-item label="拒绝原因" v-if="detail.status === 2">{{
            detail.reason || '无'
          }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 主体信息 -->
      <el-card shadow="hover" class="mb-df">
        <template #header>
          <div class="">
            <span>主体信息</span>
          </div>
        </template>

        <el-descriptions :column="2" :border="true">
          <el-descriptions-item label="主体名称">{{ detail.merchant_name }}</el-descriptions-item>
          <el-descriptions-item label="资质类型">{{
            getLicenseTypeText(detail.license_type)
          }}</el-descriptions-item>
          <el-descriptions-item label="企业/个体户代码">{{
            detail.license_code
          }}</el-descriptions-item>
          <el-descriptions-item label="资质照片">
            <el-image
              v-if="detail.license_image"
              :src="detail.license_image"
              fit="cover"
              class="w-160 h-100 pointer radius-md"
              @click="previewImage(detail.license_image)"
            >
              <template #placeholder>
                <div
                  class="w-100 h-100 flex items-center justify-center bg-secondary text-disabled border border-dashed radius-sm"
                >
                  暂无图片
                </div>
              </template>
            </el-image>
            <span v-else>暂无图片</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 法人信息 -->
      <el-card shadow="hover" class="detail-card mb-df">
        <template #header>
          <div class="flex justify-between items-center">
            <span>法人信息</span>
          </div>
        </template>

        <el-descriptions :column="2" :border="true">
          <el-descriptions-item label="法人姓名">{{ detail.legal_person }}</el-descriptions-item>
          <el-descriptions-item label="身份证号">{{ detail.id_card }}</el-descriptions-item>
          <el-descriptions-item label="身份证正面">
            <el-image
              v-if="detail.id_card_front"
              :src="detail.id_card_front"
              fit="cover"
              class="w-160 h-100 pointer radius-md"
              @click="previewImage(detail.id_card_front)"
            >
              <template #placeholder>
                <div
                  class="w-100 h-100 flex items-center justify-center bg-secondary text-disabled border border-dashed radius-sm"
                >
                  暂无图片
                </div>
              </template>
            </el-image>
            <span v-else>暂无图片</span>
          </el-descriptions-item>
          <el-descriptions-item label="身份证反面">
            <el-image
              v-if="detail.id_card_back"
              :src="detail.id_card_back"
              fit="cover"
              class="w-160 h-100 pointer radius-md"
              @click="previewImage(detail.id_card_back)"
            >
              <template #placeholder>
                <div
                  class="w-100 h-100 flex items-center justify-center bg-secondary text-disabled border border-dashed radius-sm"
                >
                  暂无图片
                </div>
              </template>
            </el-image>
            <span v-else>暂无图片</span>
          </el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 联系人信息 -->
      <el-card shadow="hover" class="detail-card mb-df">
        <template #header>
          <div class="flex justify-between items-center">
            <span>联系人信息</span>
          </div>
        </template>

        <el-descriptions :column="2" :border="true">
          <el-descriptions-item label="联系人姓名">{{ detail.contact_name }}</el-descriptions-item>
          <el-descriptions-item label="联系电话">{{ detail.contact_phone }}</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </el-skeleton>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewList"
      @close="previewVisible = false"
    />
  </div>
</template>

<script setup>
  import { ref, reactive, computed, getCurrentInstance } from 'vue'
  import { useDb, useInteraction, useTools, useCloud } from '@/utils'
  import { onLoad } from '@dcloudio/uni-app'
  import { useUserStore } from '@/stores'
  import { storeToRefs } from 'pinia'

  const userStore = useUserStore()
  const { user_id } = storeToRefs(userStore)
  const { callObject } = useCloud()
  // 数据库操作
  const { findOne, update, db, count, remove, add } = useDb()
  const { msg, confirm, prompt, showLoading, hideLoading } = useInteraction()
  const { formatTime } = useTools()

  // 详情数据
  const detail = ref({})
  const loading = ref(false)

  // 路由参数
  const routeParams = ref({})

  // 图片预览
  const previewVisible = ref(false)
  const previewList = ref([])

  // 页面标题
  const title = computed(() => {
    return isView.value ? '申请详情' : '审核申请'
  })

  // 是否为查看模式
  const isView = computed(() => {
    // 当status为0时是审核模式，其他为查看模式
    return detail.value.status !== 0
  })

  // 状态文本映射
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }

  // 状态类型映射
  const statusTypeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }

  // 商家类型映射
  const merchantTypeMap = {
    enterprise: '企业',
    individual: '个体工商户',
    medical: '医疗机构'
  }

  // 资质类型映射
  const licenseTypeMap = {
    business: '营业执照',
    medical: '医疗机构执业许可证'
  }

  // 获取状态文本
  const getStatusText = (status) => {
    return statusMap[status] || status
  }

  // 获取状态类型
  const getStatusType = (status) => {
    return statusTypeMap[status] || 'info'
  }

  // 获取商家类型文本
  const getMerchantTypeText = (type) => {
    return merchantTypeMap[type] || type
  }

  // 获取资质类型文本
  const getLicenseTypeText = (type) => {
    return licenseTypeMap[type] || type
  }

  // 获取详情数据
  const fetchDetail = async () => {
    loading.value = true
    try {
      const id = routeParams.value.id
      const where = `_id == '${id}'`
      const field =
        'login_phone,login_password, merchant_type, merchant_name, license_code, license_type, license_image, legal_person, id_card, id_card_front, id_card_back, contact_name, contact_phone, status, create_at, audit_time, reason, audit_by'

      const userCollection = db
        .collection('uni-id-users')
        .field('_id, username, nickname')
        .getTemp()
      const applicationCollection = db
        .collection('tcm-tenant-applications')
        .where(where)
        .field(field)
        .getTemp()

      const res = await findOne([applicationCollection, userCollection])
      if (res.success) {
        detail.value = res.data || {}
      } else {
        msg(res.errMsg || '获取详情失败', 'error')
        goBack()
      }
    } catch (err) {
      msg('获取详情失败', 'error')
      goBack()
    } finally {
      loading.value = false
    }
  }

  const existingUser = ref(null)

  const createTenant = async () => {
    // 创建租户
    const data = {
      merchant_name: detail.value.merchant_name,
      merchant_type: detail.value.merchant_type,
      license_code: detail.value.license_code,
      license_type: detail.value.license_type,
      license_image: detail.value.license_image,
      legal_person: detail.value.legal_person,
      id_card_front: detail.value.id_card_front,
      id_card_back: detail.value.id_card_back,
      contact_name: detail.value.contact_name,
      contact_phone: detail.value.contact_phone,
      status: 1
    }
    return await add('tcm-tenant', data)
  }

  const createUser = async (tenant_id) => {
    // 创建用户
    const data = {
      mobile: detail.value.login_phone,
      password: detail.value.login_password,
      username: 'tenant' + detail.value.login_phone,
      nickname: detail.value.contact_name,
      authorizedApp: ['__UNI__9A2F17A'],
      role: ['tenant_admin'],
      tenant_id
    }
    return await callObject('uni-id-co', 'addUser', data)
  }

  const handleBindUser = async () => {
    let res = await confirm('确定要绑定此用户到租户吗？', '确认绑定用户')
    if (!res) return

    showLoading()
    // 1、创建租户
    res = await createTenant()
    console.log('创建租户结果:', res)
    if (!res.success || !res.id) {
      hideLoading()
      console.error('创建租户失败:', res.errMsg)
      msg(res.errMsg || '创建租户失败', 'error')
      return
    }
    const tenant_id = res.id
    // 2、租户信息绑定用户
    const uid = existingUser.value._id
    const roles = existingUser.value.role || []
    if (!roles.includes('tenant_admin')) {
      roles.push('tenant_admin')
    }
    res = await callObject('uni-id-co', 'updateUser', {
      uid,
      role: roles,
      username: 'tenant' + detail.value.login_phone,
      password: detail.value.login_password,
      tenant_id,
      mobile: detail.value.login_phone
    })
    if (!res.success) {
      await remove('tcm-tenant', `_id == '${tenant_id}'`)
      hideLoading()
      msg(res.errMsg || '更新用户角色失败', 'error')
      return
    }

    const where = `_id == '${detail.value._id}'`
    const data = {
      status: 1,
      audit_time: Date.now(),
      audit_by: user_id.value,
      update_at: Date.now(),
      reason: ''
    }
    res = await update('tcm-tenant-applications', where, data)
    hideLoading()
    if (res.success) {
      msg('审核通过成功', 'success')
      // fetchDetail()
      // 通知列表页面刷新
      uni.$emit('refresh')
      goBack()
    } else {
      msg(res.errMsg || '审核失败', 'error')
    }
  }

  // 处理审核通过
  const handleApprove = async () => {
    const confirmResult = await confirm('确定要审核通过这条申请吗？', '确认审核通过')
    if (!confirmResult) return

    const data = {
      status: 1,
      audit_time: Date.now(),
      audit_by: user_id.value,
      update_at: Date.now(),
      reason: ''
    }

    showLoading()
    // 审核通过后做这几件事情
    // 1、查询license_code是否在tcm-tenant表中存在
    let res = await count('tcm-tenant', `license_code == '${detail.value.license_code}'`)
    console.log('查询结果:', res)
    if (res.total > 0) {
      hideLoading()
      msg('此企业已注册，无法重复创建', 'warning')
      return
    }

    res = await findOne(
      'uni-id-users',
      `mobile == '${detail.value.login_phone}' || username == 'tenant${detail.value.login_phone}'`,
      {
        field: '_id, username, nickname, role'
      }
    )

    if (res.data?._id) {
      existingUser.value = res.data
      hideLoading()
      msg('此手机号已注册，请确认是否为该用户', 'warning')
      return
    }
    // 2、如果不存在，创建一个新用户和新租户，先创建租户，生成tenant_id然后用login_phone创建用户
    res = await createTenant()

    if (!res.success || !res.id) {
      hideLoading()
      msg(res.errMsg || '创建租户失败', 'error')
      return
    }
    const tenant_id = res.id

    res = await createUser(tenant_id)
    console.log('创建用户结果:', res)
    if (!res.success) {
      await remove('tcm-tenant', `_id == '${tenant_id}'`)
      hideLoading()
      msg(res.errMsg || '创建用户失败', 'error')
      return
    }

    // 3、更新申请状态为已通过
    const where = `_id == '${detail.value._id}'`
    res = await update('tcm-tenant-applications', where, data)
    showLoading(false)

    if (res.success) {
      msg('审核通过成功', 'success')
      // fetchDetail()
      // 通知列表页面刷新
      uni.$emit('refresh')
      goBack()
    } else {
      msg(res.errMsg || '审核失败', 'error')
    }
  }

  // 处理拒绝申请
  const handleReject = async () => {
    // 使用prompt获取拒绝原因
    const result = await prompt('请输入拒绝原因', '拒绝申请', { placeholder: '请输入拒绝原因' })

    // 确保result不是null，避免TypeError
    if (result && result.success) {
      const reason = result.value
      if (!reason.trim()) {
        msg('请输入拒绝原因', 'warning')
        return
      }

      try {
        const data = {
          status: 2,
          audit_time: Date.now(),
          reason: reason.trim(),
          audit_by: user_id.value,
          update_at: Date.now()
        }

        const where = `_id == '${detail.value._id}'`
        showLoading()
        const res = await update('tcm-tenant-applications', where, data)
        hideLoading()

        if (res.success) {
          msg('已拒绝此申请', 'success')
          // fetchDetail()
          // 通知列表页面刷新
          uni.$emit('refresh')
          goBack()
        } else {
          msg(res.errMsg || '审核失败', 'error')
        }
      } catch (err) {
        console.error('拒绝申请失败:', err)
        msg('审核失败', 'error')
      }
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

  // 获取路由参数
  onLoad((options) => {
    routeParams.value = options
    // 在onLoad中直接获取数据，更早地开始加载
    fetchDetail()
  })
</script>
