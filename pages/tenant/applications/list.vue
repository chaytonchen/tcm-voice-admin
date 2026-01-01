<template>
  <view class="h-full">
    <tcm-table
      ref="tableRef"
      :data="tableData"
      :loading="loading"
      :pagination="pagination"
      :show-pagination="true"
      :show-selection="true"
      :actions="tableActions"
      :show-search="true"
      @search="handleSearch"
      @reset="handleReset"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 自定义搜索栏 -->
      <template #search>
        <el-input
          v-model.trim="searchForm.keyword"
          placeholder="请输入租户名称或联系人"
          clearable
          class="w-200 mr-df"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>
        <el-input
          v-model.trim="searchForm.loginPhone"
          placeholder="请输入登录手机号"
          clearable
          class="w-200 mr-df"
        >
          <template #prefix>
            <el-icon><Phone /></el-icon>
          </template>
        </el-input>
        <el-select
          v-model="searchForm.status"
          placeholder="请选择申请状态"
          class="w-180 mr-df"
          clearable
        >
          <el-option label="待审核" value="pending" />
          <el-option label="已通过" value="approved" />
          <el-option label="已拒绝" value="rejected" />
        </el-select>
      </template>

      <!-- 表格列定义 -->
      <el-table-column prop="merchant_name" label="租户名称" min-width="180" />
      <el-table-column prop="login_phone" label="登录手机号" min-width="120" />
      <el-table-column prop="contact_name" label="联系人" min-width="120" />
      <el-table-column prop="contact_phone" label="联系电话" min-width="120" />
      <el-table-column prop="merchant_type" label="主体类型" min-width="120">
        <template #default="scope">
          {{ getMerchantTypeText(scope.row.merchant_type) }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="申请状态" min-width="100">
        <template #default="scope">
          <el-tag :type="getStatusType(scope.row.status)" effect="light">
            {{ getStatusText(scope.row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="create_at" label="申请时间" min-width="160">
        <template #default="scope">
          {{ formatTime(scope.row.create_at) }}
        </template>
      </el-table-column>
      <el-table-column prop="reason" label="拒绝原因" min-width="200" show-overflow-tooltip />
      <el-table-column label="操作" min-width="140" fixed="right">
        <template #default="scope">
          <el-button type="info" size="small" @click="toDetails(scope.row)" icon="">
            详情
          </el-button>
          <el-button type="danger" size="small" @click="handleDelete(scope.row)" class="ml-8">
            删除
          </el-button>
        </template>
      </el-table-column>
    </tcm-table>
  </view>
</template>

<script setup>
  import { ref, reactive } from 'vue'
  import { onLoad, onUnload } from '@dcloudio/uni-app'
  import { Search, Phone } from '@element-plus/icons-vue'
  import { useDb, useInteraction, useTools } from '@/utils'

  const { find, remove } = useDb()
  const { msg, confirm } = useInteraction()
  const { formatTime } = useTools()

  // 表格引用
  const tableRef = ref(null)

  // 表格数据
  const tableData = ref([])

  // 加载状态
  const loading = ref(false)

  // 分页配置
  const pagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0
  })

  // 搜索表单
  const searchForm = reactive({
    keyword: '',
    status: '',
    loginPhone: ''
  })

  // 状态文本映射 - 使用数值类型的状态值
  const statusMap = {
    0: '待审核',
    1: '已通过',
    2: '已拒绝'
  }

  // 状态类型映射 - 使用数值类型的状态值
  const statusTypeMap = {
    0: 'warning',
    1: 'success',
    2: 'danger'
  }

  // 主体类型映射 - 使用字符串类型的主体类型值
  const merchantTypeMap = {
    enterprise: '企业',
    individual: '个体工商户',
    medical: '医疗机构'
  }

  // 获取状态文本
  const getStatusText = (status) => {
    return statusMap[status] || status
  }

  // 获取状态类型
  const getStatusType = (status) => {
    return statusTypeMap[status] || 'info'
  }

  // 获取主体类型文本
  const getMerchantTypeText = (type) => {
    return merchantTypeMap[type] || type
  }

  // 批量删除
  const handleBatchDelete = async () => {
    if (tableRef.value?.selectedIds?.length > 0) {
      const confirmResult = await confirm(
        `确定要删除选中的${tableRef.value.selectedIds.length}条记录吗？`,
        '确认删除'
      )

      // 如果用户点击了确定按钮
      if (confirmResult) {
        // 构建批量删除的查询条件字符串
        const ids = tableRef.value.selectedIds
        const where = `_id in [${ids.map((id) => `'${id}'`).join(', ')}]`

        const result = await remove('tcm-tenant-applications', where)
        if (result.success) {
          msg('删除成功', 'success')
          fetchData()
        } else {
          msg(result.errMsg || '删除失败', 'error')
        }
      }
    }
  }

  // 表格操作按钮
  const tableActions = ref([
    {
      type: 'danger',
      text: '批量删除',
      size: 'default',
      icon: 'Delete',
      disabled: true,
      handler: handleBatchDelete
    }
  ])

  // 搜索处理
  const handleSearch = () => {
    pagination.current = 1
    fetchData()
  }

  // 重置处理
  const handleReset = () => {
    searchForm.keyword = ''
    searchForm.status = ''
    pagination.current = 1
    fetchData()
  }

  // 选择变化处理
  const handleSelectionChange = (selection, selectedIds) => {
    // 更新批量操作按钮状态
    tableActions.value[0].disabled = selection.length === 0
  }

  // 页面大小变化处理
  const handleSizeChange = (size) => {
    pagination.pageSize = size
    pagination.current = 1
    fetchData()
  }

  // 当前页变化处理
  const handleCurrentChange = (current) => {
    pagination.current = current
    fetchData()
  }

  // 查看详情
  const toDetails = (row) => {
    uni.navigateTo({
      url: `./details?id=${row._id}`,
      // 使用events选项监听事件
      success: (res) => {
        uni.$once('refresh', (data) => {
          fetchData()
        })
      }
    })
  }

  // 删除记录
  const handleDelete = async (row) => {
    const confirmResult = await confirm('确定要删除这条申请记录吗？', '确认删除')
    // 如果用户点击了确定按钮
    if (confirmResult) {
      // 直接传递_id作为查询条件，remove函数会自动处理
      const result = await remove('tcm-tenant-applications', row._id)
      if (result.success) {
        msg('删除成功', 'success')
        fetchData()
      } else {
        msg(result.errMsg || '删除失败', 'error')
      }
    }
  }

  // 数据获取函数
  const fetchData = async () => {
    loading.value = true

    // 构建查询条件字符串
    let where = ''
    let conditions = []

    // 搜索条件处理 - 使用RegExp.test替代indexOf
    if (searchForm.keyword) {
      // 使用RegExp.test进行模糊查询
      const keyword = searchForm.keyword
      conditions.push(
        `${new RegExp(keyword)}.test(merchant_name) || ${new RegExp(
          keyword
        )}.test(contact_name) || ${new RegExp(keyword)}.test(contact_phone)`
      )
    }

    // 登录手机号搜索已包含在关键字搜索中

    // 状态筛选 - 使用正确的字段名和数值类型
    if (searchForm.status) {
      // 转换状态值：pending -> 0, approved -> 1, rejected -> 2
      const statusMap = { pending: 0, approved: 1, rejected: 2 }
      conditions.push(`status == ${statusMap[searchForm.status]}`)
    }

    if (conditions.length > 0) {
      where = conditions.join(' && ')
    }

    // 构建查询选项 - 使用正确的orderBy格式
    // field参数：所有用到的字段，以字符串形式传入
    // orderBy参数：字符串形式，例如 'create_at desc' 或 'create_at desc, name asc'
    const options = {
      // 分页参数
      skip: (pagination.current - 1) * pagination.pageSize,
      limit: pagination.pageSize,
      // 排序参数 - 字符串形式
      orderBy: 'create_at desc',
      // 所有用到的字段，以字符串形式传入
      field:
        '_id, merchant_name, login_phone, contact_name, contact_phone, merchant_type, status, create_at, reason'
    }

    // 获取数据 - 正确的调用方式，传递3个参数
    const res = await find('tcm-tenant-applications', where, options)

    if (res.success) {
      tableData.value = res.data || []
      pagination.total = res.count || 0
    } else {
      msg(res.errMsg || '获取数据失败', 'error')
    }

    loading.value = false
  }

  // 组件挂载时获取数据
  onLoad(() => {
    fetchData()
  })
</script>

<style lang="scss" scoped></style>
