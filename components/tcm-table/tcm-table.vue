<template>
  <div class="tcm-table-container">
    <!-- 搜索栏和操作按钮 -->
    <div v-if="showSearch || actions.length > 0" class="search-bar">
      <div class="search-inputs" v-if="showSearch">
        <slot name="search"></slot>
        <el-button v-if="showSearchActions" type="primary" @click="handleSearch">搜索</el-button>
        <el-button v-if="showSearchActions" @click="handleReset">重置</el-button>
      </div>
      <div class="action-buttons" v-if="actions.length > 0">
        <template v-for="(action, index) in actions" :key="index">
          <el-button
            :type="action.type || 'primary'"
            :size="action.size || 'default'"
            :disabled="action.disabled"
            @click="action.handler"
          >
            <el-icon v-if="action.icon"><component :is="action.icon" /></el-icon>
            {{ action.text }}
          </el-button>
        </template>
      </div>
    </div>

    <!-- 表格区域 -->
    <div class="table-wrapper">
      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="data"
        style="width: 100%"
        height="100%"
        stripe
        border
        :header-cell-style="headerCellStyle"
        :header-cell-class-name="'table-header-cell'"
        @selection-change="handleSelectionChange"
        :row-key="rowKey"
        :default-expand-all="defaultExpandAll"
      >
        <!-- 选择列 -->
        <el-table-column v-if="showSelection" type="selection" width="55" fixed="left" />

        <!-- 自定义列 -->
        <slot></slot>

        <!-- 自定义空状态 -->
        <template #empty>
          <div class="empty-state-container">
            <el-empty description="暂无数据" />
          </div>
        </template>
      </el-table>

      <!-- 分页 -->
      <div v-if="showPagination" class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.pageSize"
          :page-sizes="pageSizes"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
          :hide-on-single-page="false"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive } from 'vue'

  // Props定义
  const props = defineProps({
    // 表格数据
    data: {
      type: Array,
      default: () => []
    },
    // 加载状态
    loading: {
      type: Boolean,
      default: false
    },
    // 分页配置
    pagination: {
      type: Object,
      default: () => ({
        current: 1,
        pageSize: 10,
        total: 0
      })
    },
    // 是否显示分页
    showPagination: {
      type: Boolean,
      default: true
    },
    // 页面大小选项
    pageSizes: {
      type: Array,
      default: () => [10, 20, 50, 100]
    },
    // 是否显示选择框
    showSelection: {
      type: Boolean,
      default: true
    },
    // 行标识字段
    rowKey: {
      type: String,
      default: '_id'
    },
    // 是否默认展开所有行
    defaultExpandAll: {
      type: Boolean,
      default: false
    },
    // 是否显示搜索栏
    showSearch: {
      type: Boolean,
      default: true
    },
    // 是否显示搜索按钮和重置按钮
    showSearchActions: {
      type: Boolean,
      default: true
    },
    // 操作按钮配置
    actions: {
      type: Array,
      default: () => []
    },
    // 表头样式
    headerCellStyle: {
      type: Object,
      default: () => ({ backgroundColor: '#f5f7fa' })
    }
  })

  // 定义事件
  const emit = defineEmits(['search', 'reset', 'selection-change', 'size-change', 'current-change'])

  // 表格引用
  const tableRef = ref(null)
  // 选中的行ID
  const selectedIds = ref([])

  // 处理搜索
  const handleSearch = () => {
    emit('search')
  }

  // 处理重置
  const handleReset = () => {
    emit('reset')
  }

  // 处理选择变化
  const handleSelectionChange = (selection) => {
    selectedIds.value = selection.map((item) => item[props.rowKey])
    emit('selection-change', selection, selectedIds.value)
  }

  // 处理页面大小变化
  const handleSizeChange = (size) => {
    emit('size-change', size)
  }

  // 处理当前页变化
  const handleCurrentChange = (current) => {
    emit('current-change', current)
  }

  // 暴露方法给父组件
  defineExpose({
    tableRef,
    selectedIds,
    handleSearch,
    handleReset
  })
</script>

<style scoped lang="scss">
  .tcm-table-container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }

  .search-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding: 15px;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .search-inputs {
    display: flex;
    align-items: center;
  }

  .action-buttons {
    display: flex;
  }

  .table-wrapper {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    background-color: #fff;
    border-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
  }

  .pagination-container {
    padding: 15px;
    border-top: 1px solid #ebeef5;
    display: flex;
    justify-content: flex-end;
    align-items: center;
  }

  /* 强制显示分页器，即使total为0 */
  .pagination-container .el-pagination {
    display: flex !important;
  }

  /* 调整分页器前后按钮样式 */
  .pagination-container :deep(.btn-prev),
  .pagination-container :deep(.btn-next) {
    min-width: 32px !important;
    height: 32px !important;
    display: flex !important;
    align-items: center !important;
    justify-content: center !important;
    padding: 0 8px !important;
  }

  /* 表头样式 - 居中加粗且不换行 */
  :deep(.table-header-cell) {
    font-weight: 600 !important;
    .cell {
      white-space: nowrap !important;
    }
  }

  :deep(.el-table__cell) {
    text-align: center;
  }

  /* 自定义空状态容器 */
  .empty-state-container {
    padding: 20px 0;
  }

  /* 响应式调整 */
  @media (max-width: 768px) {
    .search-bar {
      flex-direction: column;
      gap: 15px;
      align-items: stretch;
    }

    .search-inputs {
      flex-wrap: wrap;
    }

    .action-buttons {
      justify-content: center;
    }
  }
</style>
