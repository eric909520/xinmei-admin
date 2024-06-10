<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="文件名称" prop="docName">
        <el-input
            v-model="queryParams.docName"
            placeholder="请输入文件名称"
            clearable
            @keyup.enter.native="handleQuery"
        />
      </el-form-item>
      <el-form-item label="分类" prop="type">
        <el-select v-model="queryParams.type" placeholder="请选择分类" clearable>
          <el-option label="光伏组件" value="0"/>
          <el-option label="技术支持" value="1"/>
        </el-select>
      </el-form-item>
      <el-form-item label="语言" prop="langue">
        <el-select v-model="queryParams.langue" placeholder="请选择语言" clearable>
          <el-option label="中文" value="0"/>
          <el-option label="英文" value="1"/>
        </el-select>
      </el-form-item>
      <el-form-item label="启用状态" prop="enable">
        <el-select v-model="queryParams.enable" placeholder="请选择启用状态" clearable>
          <el-option label="关闭" value="0"/>
          <el-option label="启用" value="1"/>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="el-icon-search" @click="handleQuery">搜索</el-button>
        <el-button icon="el-icon-refresh" @click="resetQuery">重置</el-button>
        <el-button icon="el-icon-plus" type="warning" @click="handleAdd">新增</el-button>
      </el-form-item>
    </el-form>

    <el-table
        :max-height="620"
        stripe
        v-loading="loading"
        :data="docList"
        border
    >
      <el-table-column label="主键ID" align="center" prop="id" width="80px"/>
      <el-table-column label="分类" align="center" prop="type" :formatter="type" width="120px"/>
      <el-table-column label="文件名称" align="center" prop="docName"/>
      <el-table-column label="文件类型" align="center" prop="docType"/>
      <el-table-column label="下载链接" align="center" prop="link"/>
      <el-table-column label="分类名称" align="center" prop="typeName"/>
      <el-table-column label="语言" align="center" prop="langue" :formatter="langue" width="80px"/>
      <el-table-column label="启用状态" align="center" prop="enable" :formatter="enable" width="80px"/>
      <el-table-column label="操作" align="center" width="130px">
        <template slot-scope="scope">
          <el-button
              size="mini"
              type="success"
              @click="handleUpdate(scope.row)"
          >修改
          </el-button>
          <br/>
          <el-button
              style="margin-top: 5px"
              size="mini"
              type="primary"
              @click="handleDelete(scope.row)"
          >删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination
        v-show="total>0"
        :total="total"
        :page.sync="queryParams.pageNum"
        :limit.sync="queryParams.pageSize"
        @pagination="getList"
    />

    <!-- 添加或修改文件对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="580px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="分类" prop="type">
          <el-select v-model="form.type" placeholder="请选择分类">
            <el-option label="光伏组件" :value="0"/>
            <el-option label="技术支持" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item label="文件名称" prop="docName">
          <el-input v-model="form.docName" placeholder="请输入文件名称"/>
        </el-form-item>
        <el-form-item label="文件类型" prop="docType">
          <el-input v-model="form.docType" placeholder="请输入文件类型"/>
        </el-form-item>
        <el-form-item label="下载链接" prop="link">
          <textarea style="width: 460px;height: 80px" v-model="form.link" placeholder="请输入阿里云OSS文件下载链接"/>
        </el-form-item>
        <el-form-item label="分类名称" prop="typeName">
          <el-input v-model="form.typeName" placeholder="请输入分类名称"/>
        </el-form-item>
        <el-form-item label="语言" prop="langue">
          <el-select v-model="form.langue" placeholder="请输入语言">
            <el-option label="中文" :value="0"/>
            <el-option label="英文" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item label="启用状态" prop="enable">
          <el-select v-model="form.enable" placeholder="请选择启用状态" clearable>
            <el-option label="关闭" :value="0"/>
            <el-option label="启用" :value="1"/>
          </el-select>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import {listDoc, getDoc, delDoc, addDoc, updateDoc} from "@/api/system/doc";

export default {
  data() {
    return {
      // 遮罩层
      loading: true,
      // 总条数
      total: 0,
      // 文件表格数据
      docList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        enable: undefined,
        docType: undefined,
        link: undefined,
        docName: undefined,
        typeName: undefined,
        type: undefined,
        langue: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        enable: [
          {required: true, message: "启用状态不能为空", trigger: "blur"}
        ], docType: [
          {required: true, message: "文件类型不能为空", trigger: "blur"}
        ], docName: [
          {required: true, message: "文件名称不能为空", trigger: "blur"}
        ], type: [
          {required: true, message: "分类不能为空", trigger: "blur"}
        ], langue: [
          {required: true, message: "语言不能为空", trigger: "blur"}
        ], link: [
          {required: true, message: "下载链接不能为空", trigger: "blur"}
        ], typeName: [
          {required: true, message: "分类名称不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询文件列表 */
    getList() {
      this.loading = true;
      listDoc(this.queryParams).then(response => {
        this.docList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        enable: undefined,
        docType: undefined,
        link: undefined,
        docName: undefined,
        typeName: undefined,
        type: undefined,
        langue: undefined,
        id: undefined
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加文件";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getDoc(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改文件";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateDoc(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addDoc(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("新增成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          }
        }
      });
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$confirm('是否确认删除文件编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delDoc(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(function () {
      });
    },
    langue(row, column) {
      if (row.langue === 0) {
        return "中文";
      } else {
        return "英文";
      }
    },
    type(row, column) {
      if (row.type === 0) {
        return "光伏组件";
      } else {
        return "技术支持";
      }
    },
    enable(row, column) {
      if (row.enable === 0) {
        return "关闭";
      } else {
        return "启用";
      }
    },
  }
};
</script>
