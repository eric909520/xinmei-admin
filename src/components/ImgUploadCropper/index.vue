<template>
  <el-dialog
    class="img-upload-cropper"
    :title="title"
    :visible.sync="show"
    width="800px"
    append-to-body
    @close="onDialogClose"
  >
    <el-row>
      <el-col :xs="24" :md="12" :style="{ height: '350px' }">
        <vue-cropper
          ref="cropper"
          :img="options.img"
          outputType="png"
          :info="true"
          :autoCrop="options.autoCrop"
          :autoCropWidth="options.autoCropWidth"
          :autoCropHeight="options.autoCropHeight"
          :fixedBox="options.fixedBox"
          @realTime="realTime"
        />
      </el-col>
      <el-col :xs="24" :md="12" :style="{ height: '350px' }">
        <div
          class="upload-preview"
          :style="`width:${options.autoCropWidth}px;height:${options.autoCropHeight}px;border-radius:${previewBorderRaidus}`"
        >
          <img :src="previews.url" :style="previews.img" />
        </div>
      </el-col>
    </el-row>
    <br />
    <el-row>
      <el-col :lg="2" :md="2">
        <el-upload
          action="#"
          :http-request="httpRequest"
          :show-file-list="false"
          :before-upload="beforeUpload"
        >
          <el-button size="small">
            上传
            <i class="el-icon-upload el-icon--right"></i>
          </el-button>
        </el-upload>
      </el-col>
      <el-col :lg="{ span: 1, offset: 2 }" :md="2">
        <el-button
          icon="el-icon-plus"
          size="small"
          @click="changeScale(1)"
        ></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button
          icon="el-icon-minus"
          size="small"
          @click="changeScale(-1)"
        ></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button
          icon="el-icon-refresh-left"
          size="small"
          @click="rotateLeft()"
        ></el-button>
      </el-col>
      <el-col :lg="{ span: 1, offset: 1 }" :md="2">
        <el-button
          icon="el-icon-refresh-right"
          size="small"
          @click="rotateRight()"
        ></el-button>
      </el-col>
      <el-col :lg="{ span: 2, offset: 6 }" :md="2">
        <el-button type="primary" size="small" @click="uploadImg()"
        >提 交</el-button
        >
      </el-col>
    </el-row>
  </el-dialog>
</template>

<script>
import { VueCropper } from "vue-cropper";
import { fileUpload } from "@/api/system/upload";
import { uploadAvatar } from "@/api/system/user";

export default {
  name: "img-upload-cropper",
  components: { VueCropper },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
    title: {
      type: String,
      default: "",
    },
    compType: {
      type: String,
      default: "",
    },
    /**
     * 右边预览图的border-radius，单位自定
     */
    previewBorderRaidus: {
      type: String,
      default: "",
    },
  },
  computed: {},
  watch: {
    visible(val) {
      this.show = val;
    },
  },
  data() {
    return {
      options: {
        img: "", //裁剪图片的地址
        autoCrop: true, // 是否默认生成截图框
        autoCropWidth: 200, // 默认生成截图框宽度
        autoCropHeight: 200, // 默认生成截图框高度
        fixedBox: true, // 固定截图框大小 不允许改变
      },
      show: false,
      previews: {},
    };
  },
  created() {},
  mounted() {},
  methods: {
    /**
     * 关闭时
     */
    onDialogClose() {
      this.$emit("update:visible", false);
    },
    /**
     * 图片上传之前
     */
    beforeUpload(file) {
      if (file.type.indexOf("image/") == -1) {
        this.msgError("文件格式错误，请上传图片类型,如：JPG，PNG后缀的文件。");
      } else {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          this.options.img = reader.result;
        };
      }
    },
    /**
     * 上传到服务器
     */
    uploadImg() {
      this.$refs.cropper.getCropBlob((data) => {
        let formData = new FormData();

        if (this.compType === "avatar") {
          // 头像上传
          formData.append("avatarfile", data);

          uploadAvatar(formData).then((response) => {
            console.log(
              "🚀 ~ file: index.vue ~ line 161 ~ uploadAvatar ~ response",
              response
            );
            if (response.code === 200) {
              this.show = false;

              this.options.img = "";
              this.$emit("upload-success", response.imgUrl);

              this.msgSuccess("修改成功");
            }
          });
        } else {
          formData.append("file", data);

          fileUpload(formData).then((response) => {
            if (response.code === 200) {
              // this.$refs.cropper.clearCrop();

              this.show = false;

              this.options.img = "";

              this.$emit("upload-success", response.url);

              this.msgSuccess("上传成功");
            }
          });
        }
      });
    },
    // 向左旋转
    rotateLeft() {
      this.$refs.cropper.rotateLeft();
    },
    // 向右旋转
    rotateRight() {
      this.$refs.cropper.rotateRight();
    },
    // 图片缩放
    changeScale(num) {
      num = num || 1;
      this.$refs.cropper.changeScale(num);
    },
    // 实时预览
    realTime(data) {
      this.previews = data;
    },
    /**
     * 覆盖默认的上传行为，可以自定义上传的实现
     * 留空即可，不写这个的话会有点报错
     */
    httpRequest() {},
  },
};
</script>

<style lang="scss" scoped>
.img-upload-cropper {
  .upload-preview {
    position: absolute;
    top: 50%;
    transform: translate(50%, -50%);
    border-radius: 0;
    box-shadow: 0 0 4px #ccc;
    overflow: hidden;
  }
}
</style>
