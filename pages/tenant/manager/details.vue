<template>
  <view class="h-full overflow-y-scroll">
    <!-- 页面标题和操作按钮 -->
    <div class="flex justify-between items-center mb-df">
      <h1 class="text-lg font-bold text-primary">租户详情</h1>
      <div>
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
            <el-button
              :type="getChangeStatusType(detail.status)"
              size="small"
              @click="handleChangeStatus"
            >
              {{ getChangeStatusText(detail.status) }}
            </el-button>
          </div>
        </template>

        <el-descriptions :column="2" :border="true">
          <el-descriptions-item label="租户名称">{{ detail.merchant_name }}</el-descriptions-item>
          <el-descriptions-item label="主体类型">{{
            getMerchantTypeText(detail.merchant_type)
          }}</el-descriptions-item>
          <el-descriptions-item label="创建时间">{{
            formatTime(detail.create_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="更新时间">{{
            formatTime(detail.update_at)
          }}</el-descriptions-item>
          <el-descriptions-item label="租户状态">
            <el-tag :type="getStatusType(detail.status)" effect="light" class="status-tag mr-10">
              {{ getStatusText(detail.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="租户有效期" v-if="detail.expire_time">{{
            formatTime(detail.expire_time)
          }}</el-descriptions-item>
          <el-descriptions-item label="租户描述" :span="2">{{
            detail.description || '无'
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
          <el-descriptions-item label="资质代码">{{ detail.license_code }}</el-descriptions-item>
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
          <el-descriptions-item label="企业地址" :span="2">{{
            detail.address || '无'
          }}</el-descriptions-item>
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
          <el-descriptions-item label="企业邮箱">{{ detail.email || '无' }}</el-descriptions-item>
        </el-descriptions>
      </el-card>

      <!-- 银行信息 -->
      <el-card shadow="hover" class="detail-card mb-df">
        <template #header>
          <div class="flex justify-between items-center">
            <span>银行信息</span>
          </div>
        </template>

        <el-descriptions :column="2" :border="true">
          <el-descriptions-item label="银行账户名称">{{
            detail.bank_account_name || '无'
          }}</el-descriptions-item>
          <el-descriptions-item label="银行账号">{{
            detail.bank_account || '无'
          }}</el-descriptions-item>
          <el-descriptions-item label="开户银行">{{
            detail.bank_name || '无'
          }}</el-descriptions-item>
          <el-descriptions-item label="开户支行">{{
            detail.bank_branch || '无'
          }}</el-descriptions-item>
          <el-descriptions-item label="联行号">{{
            detail.bank_branch_code || '无'
          }}</el-descriptions-item>
          <el-descriptions-item label="税务登记证号">{{
            detail.tax_registration_no || '无'
          }}</el-descriptions-item>
          <el-descriptions-item label="分账比例" v-if="detail.profit_sharing_ratio"
            >{{ (detail.profit_sharing_ratio * 100).toFixed(1) }}%</el-descriptions-item
          >
        </el-descriptions>
      </el-card>
    </el-skeleton>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewVisible"
      :url-list="previewList"
      @close="previewVisible = false"
    />
  </view>
</template>

<script setup>
  import { ref } from 'vue'
  import { useDb, useInteraction, useTools } from '@/utils'
  import { onLoad } from '@dcloudio/uni-app'

  // 数据库操作
  const { findOne, update } = useDb()
  const { msg, showLoading, hideLoading, confirm } = useInteraction()
  const { formatTime } = useTools()

  // 详情数据
  const detail = ref({})
  const loading = ref(false)

  // 路由参数
  const routeParams = ref({})

  // 图片预览
  const previewVisible = ref(false)
  const previewList = ref([])

  // 状态文本映射
  const statusMap = {
    0: '禁用',
    1: '启用'
  }

  // 状态类型映射
  const statusTypeMap = {
    0: 'danger',
    1: 'success'
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

  // 获取状态更改文本
  const getChangeStatusText = (status) => {
    return status === 0 ? '启用' : '禁用'
  }

  // 获取状态更改按钮类型
  const getChangeStatusType = (status) => {
    return status === 0 ? 'success' : 'danger'
  }

  // 获取新状态值
  const getNewStatus = (status) => {
    return status === 0 ? 1 : 0
  }

  // 处理状态更改
  const handleChangeStatus = async () => {
    const newStatus = getNewStatus(detail.value.status)
    const newStatusText = getStatusText(newStatus)

    const confirmResult = await confirm(
      `确定要将租户状态更改为【${newStatusText}】吗？`,
      '确认更改状态'
    )

    if (!confirmResult) return

    showLoading()

    try {
      const where = `_id == '${detail.value._id}'`
      const data = {
        status: newStatus,
        update_at: Date.now()
      }

      const res = await update('tcm-tenant', where, data)

      if (res.success) {
        msg('状态更改成功', 'success')
        // 更新本地数据
        detail.value.status = newStatus
        detail.value.update_at = Date.now()
        // 通知列表页面刷新
        uni.$emit('refresh')
      } else {
        msg(res.errMsg || '状态更改失败', 'error')
      }
    } catch (err) {
      console.error('状态更改失败:', err)
      msg('状态更改失败', 'error')
    } finally {
      hideLoading()
    }
  }

  // 获取详情数据
  const fetchDetail = async () => {
    loading.value = true
    try {
      const id = routeParams.value.id
      const where = `_id == '${id}'`
      const field =
        '_id, merchant_name, merchant_type, logo, description, contact_name, contact_phone, email, address, license_code, license_type, license_image, legal_person, id_card_front, id_card_back, status, create_at, update_at, expire_time, bank_account, bank_name, bank_branch, bank_account_name, bank_branch_code, tax_registration_no, profit_sharing_ratio'

      const res = await findOne('tcm-tenant', where, {
        field
      })
      if (res.success) {
        detail.value = res.data || {}
      } else {
        msg(res.errMsg || '获取详情失败', 'error')
        goBack()
      }
    } catch (err) {
      console.error('获取详情失败:', err)
      msg('获取详情失败', 'error')
      goBack()
    } finally {
      loading.value = false
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

<style lang="scss" scoped>
  .status-tag {
    margin-left: 10px;
  }
</style>
