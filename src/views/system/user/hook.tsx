import { ReTableColumn } from "@/components/re-table/types";
import { ref } from "vue";
import { getUserList } from "@/api/user";
import { ElMessage, ElMessageBox } from "element-plus";

export function useTable() {
  const columns: ReTableColumn[] = [
    {
      type: "selection",
      width: "50px",
    },
    {
      prop: "avatar",
      label: "头像",
      render: (row: any) => (
        <>
          <re-image
            width="50px"
            height="50px"
            src={row.avatar}
            previewList={[row.avatar]}
            roundedFull={true}
            fit="cover"
          />
        </>
      ),
    },
    {
      prop: "username",
      label: "用户名",
    },
    {
      prop: "sex",
      label: "性别",
    },
    {
      fixed: "right",
      label: "操作",
      render: (row: any) => (
        <>
          <el-button size="small" link type="primary">
            编辑
          </el-button>
          <el-button
            size="small"
            link
            type="danger"
            onclick={() => remove(row)}
          >
            删除
          </el-button>
        </>
      ),
    },
  ];
  const filters = [
    {
      type: "text",
      label: "用户名",
      key: "username",
    },
  ];
  const remove = (row: any) => {
    ElMessageBox.confirm("删除后无法恢复，是否继续？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }).then(() => {
      ElMessage({
        type: "success",
        message: "删除成功",
      });
      console.log(row);
    });
  };
  const request = (params: any) => {
    return getUserList(params);
  };
  const tableRef = ref();
  return {
    request,
    columns,
    filters,
    tableRef,
  };
}
