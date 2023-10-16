<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" label-width="68px">
      <el-form-item label="标题" prop="title">
        <el-input
          v-model="queryParams.title"
          placeholder="请输入标题"
          clearable
          @keyup.enter.native="handleQuery"
        />
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
      :data="newsList"
      border
    >
      <el-table-column label="主键ID" align="center" prop="id" width="90px"/>
      <el-table-column label="标题" align="center" prop="title">
        <template slot-scope="scope">
          <span v-html="simpleTitle(scope.row)">
            {{ scope.row.title }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="主图" align="center" prop="icon" width="150px">
        <template slot-scope="scope">
          <img :src="scope.row.icon" style="width: 36px; height: 36px"/>
        </template>
      </el-table-column>
      <el-table-column label="简介内容" align="center" prop="simpleContent">
        <template slot-scope="scope">
          <span v-html="simpleContent(scope.row)">
            {{ scope.row.simpleContent }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="内容" align="center" prop="content">
        <template slot-scope="scope">
          <span v-html="content(scope.row)">
            {{ scope.row.content }}
          </span>
        </template>
      </el-table-column>
      <el-table-column label="语言" align="center" prop="langue" width="90px" :formatter="langue"/>
      <el-table-column label="启用状态" align="center" prop="enable" :formatter="enable" width="90px"/>
      <el-table-column label="创建用户" align="center" prop="createUser" width="90px"/>
      <el-table-column label="创建时间" align="center" prop="createTime" :formatter="createTime" width="95px"/>
      <el-table-column label="更新用户" align="center" prop="modifiedUser" width="90px"/>
      <el-table-column label="更新时间" align="center" prop="modifiedTime" :formatter="modifiedTime" width="95px"/>
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

    <!-- 添加或修改新闻对话框 -->
    <el-dialog :title="title" :visible.sync="open" width="800px">
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="启用状态" prop="enable">
          <el-select v-model="form.enable" placeholder="请选择启用状态" clearable>
            <el-option label="关闭" :value="0"/>
            <el-option label="启用" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item label="语言" prop="langue">
          <el-select v-model="form.langue" placeholder="请选择语言" clearable>
            <el-option label="中文" :value="0"/>
            <el-option label="英文" :value="1"/>
          </el-select>
        </el-form-item>
        <el-form-item label="标题" prop="title">
          <textarea style="width: 680px;height: 50px" v-model="form.title" placeholder="请输入标题"/>
        </el-form-item>
        <el-form-item label="主图" prop="icon">
          <img style="width: 480px" :src="form.icon"/>
          <ossUpload @on-upload="form.icon=$event"></ossUpload>
        </el-form-item>
        <el-form-item label="简介内容" prop="simpleContent">
          <textarea style="width: 680px;height: 80px" v-model="form.simpleContent" type="textarea"
                    placeholder="请输入简介内容"/>
        </el-form-item>
        <el-form-item label="内容" prop="content">
          <my-quill-editor style="width: 680px; height: 250px" v-model="form.content" ref="quillEditor"/>
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
import {listNews, getNews, delNews, addNews, updateNews} from "@/api/system/news";
import myQuillEditor from "@/components/Editor";

export default {
  name: "cpsp",
  components: {
    myQuillEditor,
  },
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 总条数
      total: 0,
      // 新闻表格数据
      newsList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        modifiedTime: undefined,
        modifiedUser: undefined,
        createUser: undefined,
        enable: undefined,
        content: undefined,
        simpleContent: undefined,
        icon: undefined,
        title: undefined,
        langue: undefined,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        enable: [
          {required: true, message: "启用状态不能为空", trigger: "blur"}
        ],
        langue: [
          {required: true, message: "语言不能为空", trigger: "blur"}
        ],
        title: [
          {required: true, message: "标题不能为空", trigger: "blur"}
        ],
        icon: [
          {required: true, message: "主图不能为空", trigger: "blur"}
        ],
        simpleContent: [
          {required: true, message: "简介内容不能为空", trigger: "blur"}
        ],
        content: [
          {required: true, message: "内容不能为空", trigger: "blur"}
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询新闻列表 */
    getList() {
      this.loading = true;
      listNews(this.queryParams).then(response => {
        this.newsList = response.rows;
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
        remark: undefined,
        modifiedTime: undefined,
        modifiedUser: undefined,
        createTime: undefined,
        createUser: undefined,
        enable: undefined,
        langue: undefined,
        content: undefined,
        simpleContent: undefined,
        icon: undefined,
        title: undefined,
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
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length != 1
      this.multiple = !selection.length
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加新闻";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getNews(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改新闻";
      });
    },
    /** 提交按钮 */
    submitForm: function () {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != undefined) {
            updateNews(this.form).then(response => {
              if (response.code === 200) {
                this.msgSuccess("修改成功");
                this.open = false;
                this.getList();
              } else {
                this.msgError(response.msg);
              }
            });
          } else {
            addNews(this.form).then(response => {
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
      this.$confirm('是否确认删除新闻编号为"' + ids + '"的数据项?', "警告", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(function () {
        return delNews(ids);
      }).then(() => {
        this.getList();
        this.msgSuccess("删除成功");
      }).catch(function () {
      });
    },
    createTime(row, column) {
      return this.parseTime(row.createTime);
    },
    modifiedTime(row, column) {
      return this.parseTime(row.modifiedTime);
    },
    enable(row, column) {
      if (row.enable === 0) {
        return "关闭";
      } else {
        return "启用";
      }
    },
    langue(row, column) {
      if (row.langue === 0) {
        return "中文";
      } else {
        return "英文";
      }
    },
    content(row, column) {
      let am = row.content;
      if (am) {
        if (am.length <= 35) {
          return am;
        } else {
          return am.substring(0, 35) + "...";
        }
      }
    },
    simpleContent(row, column) {
      let am = row.simpleContent;
      if (am) {
        if (am.length <= 35) {
          return am;
        } else {
          return am.substring(0, 35) + "...";
        }
      }
    },
    simpleTitle(row, column) {
      let am = row.title;
      if (am) {
        if (am.length <= 35) {
          return am;
        } else {
          return am.substring(0, 35) + "...";
        }
      }
    },
  }
};
</script>
