<template>
  <div class="re-table-wrapper">
    <!-- 查询 --->
    <div class="re-filter-card" v-if="isShowFilter">
      <el-form :model="filterForm" :inline="true" ref="searchFormRef">
        <el-form-item :label="v.label" v-for="(v, i) in filters" :key="i" :prop="v.key">
          <el-input v-if="v.type === 'text' || !v.type" :placeholder="v.placeholder" :clearable="v.clearable"
            v-model="filterForm[v.key]" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onQuery" :loading="isLoading">
            <Icon v-if="!isLoading" class="mr-1" icon="material-symbols:search-rounded" />
            查询
          </el-button>
          <el-button @click="onReset">
            <Icon class="mr-1" icon="material-symbols:refresh" />
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <!-- 列表 -->
    <div :class="(isShowFilter ? 'mt-4' : '') + ' re-table-card'">
      <div class="re-table-toolbar mb-4">
        <slot name="toolbar"></slot>
      </div>
      <el-table v-loading="isLoading" :data="tableData" :header-cell-style="headerCellStyle"
        :cell-style="props.cellStyle" :border="props.border" :default-expand-all="props.defaultExpandAll"
        :row-key="props.rowKey" empty-text="暂无数据" :tree-props="props.treeProps"
        @row-click="(row: any, col: any, e: Event) => emits('row-click', row, col, e)"
        @selection-change="tableSelectionChange">
        <el-table-column v-for="(v, i) in props.columns" :key="i" :type="v.type" :index="v.index"
          :column-key="v.columnKey" :prop="v.prop" :label="v.label" :width="v.width" :fixed="v.fixed"
          :render-header="v.renderHeader" :sortable="v.sortable" :sort-method="v.sortMethod" :sort-by="v.sortBy"
          :sort-orders="v.sortOrders" :resizable="v.resizable" :formatter="v.formatter ?? defaultFormatter"
          :show-overflow-tooltip="v.showOverflowTooltip" :align="v.align" :header-align="v.headerAlign"
          :class-name="v.className" :label-class-name="v.labelClassName" :selectable="v.selectable"
          :reserve-selection="v.reserveSelection" :filters="v.filters" :filter-placement="v.filterPlacement"
          :filter-class-name="v.filterClassName" :filter-multiple="v.filterMultiple" :filter-method="v.filterMethod"
          :filtered-value="v.filteredValue">
          <template #default="scope" v-if="v.render && !isLoading">
            <component :is="v.render(scope.row)"></component>
          </template>
        </el-table-column>
      </el-table>
      <!--分页-->
      <div class="w-full flex flex-row-reverse mt-4" v-if="total > 0">
        <el-pagination v-model:page-size="filterForm.size" :total="total" :page-sizes="[10, 20, 30, 40, 50]"
          :pager-count="5" @size-change="handleSizeChange" @current-change="handleCurrentChange" small background
          layout="sizes, prev, pager, next" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import "./index.styl"
import { Icon } from "@iconify/vue";
import { CSSProperties, onBeforeMount, onMounted, reactive, ref } from "vue";
import { FormInstance } from "element-plus/es/components/form";
import { ReTableColumn, FilterStruct, CustomRequestFunc } from './types'
import { PagedResult } from "#/data";
import utils from "@/utils"

const headerCellStyle: CSSProperties = { background: '#fafafa', color: '#334155' };
const props = withDefaults(defineProps<{
  columns: ReTableColumn[],
  //当request函数存在时，data不生效
  data?: Array<any>,
  height?: string | number,
  maxHeight?: string | number,
  stripe?: boolean,
  border?: boolean,
  size?: '' | 'large' | 'default' | 'small',
  fit?: boolean,
  showHeader?: boolean,
  highlightCurrentRow?: boolean,
  currentRowKey?: string | number,
  rowClassName?: Function | string,
  rowStyle?: Function | object,
  cellClassName?: Function | object,
  cellStyle?: Function | object,
  headerRowClassName?: Function | string,
  headerRowStyle?: Function | object,
  headerCellClassName?: Function | string,
  rowKey: string,
  emptyText?: string,
  defaultExpandAll?: boolean,
  expandRowKeys?: object,
  defaultSort?: object,
  tooltipEffect?: 'dark' | 'light',
  tooltipOptions?: object,
  showSummary?: boolean,
  sumText?: string,
  summaryMethod?: Function,
  spanMethod?: Function,
  selectOnIndeterminate?: boolean,
  indent?: number,
  lazy?: boolean,
  load?: Function,
  treeProps?: object,
  tableLayout?: 'fixed' | 'auto',
  scrollbarAlwaysOn?: boolean,
  showOverflowTooltip?: boolean,
  flexible?: boolean,
  enabledFilter?: boolean,
  filters?: Array<FilterStruct>,
  request?: CustomRequestFunc | undefined
}>(), {
  stripe: false,
  border: false,
  size: "default",
  fit: true,
  showHeader: true,
  enabledFilter: false
});
const emits = defineEmits<{
  (e: 'row-click', row: any, col: any, event: Event): void,
  (e: 'selection-change', selection: any[]): void
}>();
const isShowFilter = ref<boolean>((props.enabledFilter && props.filters && props.filters.length > 0) ?? false)
const filterForm = reactive({
  page: 1,
  size: 10
});
const total = ref<number>(0);
const tableData = ref<Array<any>>(props.data ?? []);
const selectedRows = ref<any[]>();
const selectedRowKeys = ref<any[]>();
const searchFormRef = ref<FormInstance>();
const isLoading = ref<boolean>(false);
//查询
const onQuery = () => {
  if (props.request) {
    requestData();
  }
}
//重置
const onReset = () => {
  searchFormRef?.value?.resetFields();
  if (props.request) {
    requestData();
  }
}
const tableSelectionChange = (newSelection: any[]) => {
  selectedRows.value = newSelection;
  if (props.rowKey) {
    selectedRowKeys.value = selectedRows.value?.map(x => x[props.rowKey]);
  }
  emits("selection-change", newSelection)
}

//异步请求接口数据
function requestData() {
  if (props.request) {
    isLoading.value = true;
    props.request(filterForm).then((res: PagedResult<any> | any) => {
      if (res.data.total) {
        tableData.value = res.data.rows;
        total.value = res.data.total;
      } else {
        tableData.value = res.data;
      }
      isLoading.value = false;
    }).catch(() => {
      isLoading.value = false;
    });
  }
}

function handleSizeChange(val: number) {
  filterForm.size = val;
  requestData();
}

function handleCurrentChange(val: number) {
  filterForm.page = val;
  requestData();
}

function defaultFormatter(_1: any, _2: any, cellValue: any) {
  return utils.formatterNullableContent(cellValue);
}

const refresh = async () => {
  requestData();
}

defineExpose({
  refresh,
  selectedRows,
  selectedRowKeys
})

onBeforeMount(() => {
  if (isShowFilter) {
    for (let i = 0; i < props.filters!.length; i++) {
      const item = props.filters![i];
      filterForm[item.key] = item?.defaultValue;
    }
  }
})
onMounted(() => {
  requestData();
})
</script>