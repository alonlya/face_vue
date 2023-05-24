<template>
    <div class="container">
      <h1>人脸库查询</h1>
  
      <div class="search-box">
        <label for="name-input">姓名：</label>
        <input type="text" v-model="searchName" id="name-input" />
        <label for="group-input">班组：</label>
        <input type="text" v-model="searchGroup" id="group-input" />
        <button @click="search">查询</button>
        <button @click="resetSearch">重置</button>
      </div>
  
      <div>
        <button @click="showAddFaceModal">添加人脸</button>
        <div v-if="showAddFace">
          <div class="modal" tabindex="-1" role="dialog">
            <div class="modal-dialog" role="document">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">添加人脸</h5>
                  <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="cancelAddFaceModal">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div class="modal-body">
                  <div>
                    <label>姓名：</label>
                    <input v-model="name" />
                  </div>
                  <div>
                    <label>班组：</label>
                    <input v-model="group" />
                  </div>
                  <div>
                    <label>选择图片：</label>
                    <input type="file" @change="onFileChange" />
                  </div>
                </div>
                <div class="modal-footer">
                  <button type="button" class="btn btn-primary" @click="addFace">确认</button>
                  <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="cancelAddFaceModal">取消</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <transition name="modal">
      <div v-if="showAddFaceSuccess" class="modal fade show" tabindex="-1" role="dialog" aria-labelledby="successModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="successModalLabel">添加人脸成功</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="hideAddFaceSuccessModal">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <p>添加人脸成功！</p>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-primary" @click="hideAddFaceSuccessModal">确定</button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  
      <div v-if="showModal" class="modal fade" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="exampleModalLabel">修改人脸信息</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close" @click="closeModal">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="form-group">
                <label for="name">姓名</label>
                <input type="text" class="form-control" id="name" v-model="name" placeholder="请输入姓名" />
              </div>
              <div class="form-group">
                <label for="group">班组</label>
                <input type="text" class="form-control" id="group" v-model="group" placeholder="请输入班组" />
              </div>
              <div class="form-group">
                <label for="image">图片</label>
                <input type="file" class="form-control-file" id="image" @change="handleImageUpload" />
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-dismiss="modal" @click="closeModal">关闭</button>
              <button type="button" class="btn btn-primary" @click="updateFace">修改</button>
            </div>
          </div>
        </div>
      </div>
  
      <table class="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>姓名</th>
            <th>班组</th>
            <th>人员图片信息</th>
            <th>操作</th>
          </tr>
        </thead>      <tbody>
        <tr v-for="face in dataList" :key="face.id">
          <td>{{ face.id }}</td>
          <td>{{ face.name }}</td>
          <td>{{ face.group }}</td>
          <td>
            <!-- <img :src="face.image" alt="Face Image" /> -->
            <img :src="getImageUrl(face.face_base64)" alt="Face Image" />
          </td>
          <td>
            <button @click="showEditModal(face)">编辑</button>
            <button @click="deleteFace(face.id)">删除</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      dataList: [],
      total: 0,
      page: 0,
      perPage: 10,
      currentPage: 1,
      lastPage: 0,
      searchName: '',
      searchGroup: '',
      name: '',
      group: '',
      faceId: '',
      response: {
        code: 0,
        data: { total: 0, per_page: 0, current_page: 0, last_page: 0, data: [] },
        message: '',
      },
      showAddFace: false,
      file: null,
      showAddFaceSuccess: false,
      updateId: 0,
      updateName: '',
      updateGroup: '',
      updateImageBase64: '',
      showModal: false,
      headers: {},
    };
  },
  mounted() {
    const token = localStorage.getItem('token');
    if (token) {
      this.headers.Authorization = token;
    }
    this.response = {
      code: 0,
      data: { total: 0, per_page: 0, current_page: 0, last_page: 0, data: [] },
      message: '',
    };
    this.loadPage(1);
  },
  methods: {
    showEditModal(face) {
      this.updateId = face.id;
      this.updateName = face.name;
      this.updateGroup = face.group;
      this.updateImageBase64 = '';
      this.showModal = true;
    },
    async loadPage(page = 1) {
      try {
        console.log('name:', this.name, 'group:', this.group, 'file:', this.file);
        const response = await axios.get('http://localhost:5000/api/face_database', {
          params: {
            page: page.toString(),
            limit: this.perPage.toString(),
            name: this.searchName,
            group: this.searchGroup,
          },
          headers:this.headers,
        });
        this.response = response.data;
        if (this.response.code === 0) {
          this.total = this.response.data.total;
          this.perPage = this.response.data.per_page;
          this.currentPage = this.response.data.current_page;
          this.lastPage = this.response.data.last_page;
          this.dataList = this.response.data.data;
        } else {
          alert('获取数据失败');
        }
      } catch (error) {
        console.error(error);
        alert('获取数据失败');
      }
    },
    search() {
      this.loadPage(1);
    },
    resetSearch() {
      this.searchName = '';
      this.searchGroup = '';
      this.loadPage(1);
    },
    onPageChanged(event) {
      this.loadPage(event.page);
    },
    getPages() {
      const pages = [];
      const currentPage = this.currentPage;
      const lastPage = this.lastPage;
      const delta = 2;
      pages.push(1);
      for (let i = Math.max(2, currentPage - delta); i <= Math.min(lastPage - 1, currentPage + delta); i++) {
        pages.push(i);
      }
      if (lastPage > 1) {
        pages.push(lastPage);
      }
      return pages;
    },
    onNextPageClicked(event) {
      event.preventDefault();
      const nextPage = this.currentPage + 1;
      if (nextPage <= this.lastPage) {
        this.loadPage(nextPage);
      }
    },
    onPrePageClicked(event) {
      event.preventDefault();
      const nextPage = this.currentPage - 1;
      if (nextPage <= this.lastPage) {
        this.loadPage(nextPage);
      }
    },
    getImageUrl(base64Img) {
      const img = new Image();
      img.src = 'data:image/png;base64,' + base64Img;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 60;
      canvas.height = 60;
      ctx.drawImage(img, 0, 0, 60, 60);
      return canvas.toDataURL();
    },
    getThumbnail(imageData) {
      const image = new Image();
      image.src = 'data:image/png;base64,' + imageData;
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const thumbnailWidth = 100;
      const thumbnailHeight = (thumbnailWidth * image.height) / image.width;
      canvas.width = thumbnailWidth;
      canvas.height = thumbnailHeight;
      ctx.drawImage(image, 0, 0, thumbnailWidth, thumbnailHeight);
      return canvas.toDataURL();
    },
    showImage(imageData) {
      const image = new Image();
      image.src = imageData;
      const width = window.innerWidth * 0.8;
      const height = (width * image.height) / image.width;
      const imageUrl = image.src;
      const html = `<div class="modal"><div class="modal-content"><img src="${imageUrl}" width="${width}" height="${height}"></div></div>`;
      const div = document.createElement('div');
      div.innerHTML = html;
      document.body.appendChild(div);
    },
    showAddFaceModal() {
      this.showAddFace = true;
    },
    cancelAddFace() {
      this.showAddFace = false;
      this.name = '';
      this.group = '';
      this.file = null;
    },
    showAddFaceSuccessModal() {
      this.showAddFaceSuccess = true;
    },
    hideAddFaceSuccessModal() {
      this.showAddFaceSuccess = false;
    },
    onFileChange(event) {
      this.file = event.target.files[0];
    },
    async addFace() {
      if (!this.name || !this.group || !this.file) {
        alert('请填写完整信息');
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(this.file);
      reader.onload = async () => {
        const base64Img = reader.result.toString().split(',')[1];
        try {
          const response = await axios.post('http://127.0.0.1:5000/add_face', {
          name: this.name,
          group: this.group,
          image: base64Img,
        }, {
          headers: this.headers, // Add headers to the request
        });
          if (response.data.success === true) {
            this.showAddFace = false;
            // this.showAddFaceSuccess = true;
            this.showAddFaceSuccessModal();
          } else {
            alert('添加失败');
          }
        } catch (error) {
          console.error(error);
          alert('添加失败');
        }
      };
    },
    hideAddFaceSuccess() {
      this.showAddFaceSuccess = false;
      this.loadPage(1);
    },
    handleImageUpload($event) {
      const file = $event.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        this.updateImageBase64 = event.target.result.toString().split(',')[1];
      };
      reader.readAsDataURL(file);
    },
    openModal(face) {
      this.updateId = face.id;
      this.updateImageBase64 = '';
      this.showModal = true;
    },
    closeModal() {
      this.showModal = false;
      this.updateName = '';
      this.updateGroup = '';
    },
    async updateFace() {
      try {
        const response = await axios.put(`http://localhost:5000/api/face_database/${this.updateId}`, {
          name: this.name,
          group: this.group,
          face_base64: this.updateImageBase64,
            });
        this.showModal = false;
        if (response.data.code === 0) {
          alert('修改成功');
          this.loadPage(this.currentPage);
        } else {
          alert('修改失败');
        }
      } catch (error) {
        console.error(error);
        alert('修改失败');
      }
    },
    async deleteFace(id) {
      if (confirm('确定删除这条记录吗？')) {
        try {
          const response = await axios.delete(`http://localhost:5000/api/face_database/${id}`);
          if (response.data.success === true) {
            alert('删除成功');
            this.loadPage();
          } else {
            alert('删除失败');
          }
        } catch (error) {
          console.error(error);
          alert('删除失败');
        }
      }
    },
  },
};
</script>
<style>.container {
  margin: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.search-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.search-box label {
  margin-right: 10px;
}

.search-box input[type="text"] {
  padding: 5px;
  border: 1px solid #ccc;
}

.search-box button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 3px;
}

.search-box button:hover {
  background-color: #45a049;
}

div.add-face {
  margin-bottom: 20px;
}

div.add-face label {
  display: block;
  margin-bottom: 5px;
}

div.add-face input {
  width: 100%;
  padding: 5px;
  border: 1px solid #ccc;
}

div.add-face button {
  padding: 5px 10px;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 3px;
}

div.add-face button:hover {
  background-color: #45a049;
}

div.add-face p.success-message {
  margin-top: 10px;
  color: green;
}

.modal {
  display: block;
  position: fixed;
  z-index: 1050;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: rgba(0, 0, 0, 0.4);
}

.modal-dialog {
  position: relative;
  width: auto;
  margin: 10px;
  pointer-events: none;
}

.modal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 0.3rem;
  outline: 0;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}

.modal-title {
  font-size: 20px;
  font-weight: 500;
}

.modal-body {
  flex-grow: 1;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.modal-footer button {
  margin-left: 10px;
  padding: 5px 10px;
  background-color: #4CAF50;
  color: #fff;
  border: none;
  cursor: pointer;
  border-radius: 3px;
}

.modal-footer button:hover {
  background-color: #45a049;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f2f2f2;
}
</style>

  