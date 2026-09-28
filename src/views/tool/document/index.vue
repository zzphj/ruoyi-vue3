<template>
    <div class="app-container">
       <el-form :model="queryParams" ref="queryRef" :inline="true" v-show="showSearch">
          <el-form-item label="文档名称" prop="documentName">
             <el-input
                v-model="queryParams.documentName"
                placeholder="请输入文档名称"
                clearable
                style="width: 200px"
                @keyup.enter="handleQuery"
             />
          </el-form-item>
          <el-form-item label="状态" prop="status">
             <el-select v-model="queryParams.status" placeholder="文档状态" clearable style="width: 200px">
                <el-option
                   v-for="dict in sys_normal_disable"
                   :key="dict.value"
                   :label="dict.label"
                   :value="dict.value"
                />
             </el-select>
          </el-form-item>
          <el-form-item>
             <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
             <el-button icon="Refresh" @click="resetQuery">重置</el-button>
          </el-form-item>
       </el-form>

       <el-row :gutter="10" class="mb8">
          <el-col :span="1.5">
             <el-button
                type="primary"
                plain
                icon="Plus"
                @click="handleAdd"
                v-hasPermi="['system:document:add']"
             >新增</el-button>
          </el-col>
          <el-col :span="1.5">
             <el-button
                type="success"
                plain
                icon="Edit"
                :disabled="single"
                @click="handleUpdate"
                v-hasPermi="['system:document:edit']"
             >修改</el-button>
          </el-col>
          <el-col :span="1.5">
             <el-button
                type="danger"
                plain
                icon="Delete"
                :disabled="multiple"
                @click="handleDelete"
                v-hasPermi="['system:document:remove']"
             >删除</el-button>
          </el-col>

          <right-toolbar v-model:showSearch="showSearch" @queryTable="getList"></right-toolbar>
       </el-row>
 
       <el-table v-loading="loading" :data="documentList" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55" align="center" />
          <el-table-column label="文档编号" align="center" prop="documentId" />
          <el-table-column label="文档名称" align="center" prop="documentName" />
          <el-table-column label="文档内容" align="center" prop="document" />
          <el-table-column label="状态" align="center" prop="documentStatus">
             <template #default="scope">
                <dict-tag :options="sys_normal_disable" :value="scope.row.status" />
             </template>
          </el-table-column>
          <el-table-column label="创建时间" align="center" prop="createTime" width="180">
             <template #default="scope">
                <span>{{ parseTime(scope.row.createTime) }}</span>
             </template>
          </el-table-column>
          <el-table-column label="操作" width="180" align="center" class-name="small-padding fixed-width">
             <template #default="scope">
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:document:edit']">修改</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:document:remove']">删除</el-button>
             </template>
          </el-table-column>
       </el-table>
 
       <pagination
          v-show="total > 0"
          :total="total"
          v-model:page="queryParams.pageNum"
          v-model:limit="queryParams.pageSize"
          @pagination="getList"
       />
 
       <!-- 添加或修改文档对话框 -->
       <el-dialog :title="title" v-model="open" width="500px" append-to-body>
          <el-form ref="documentRef" :model="form" :rules="rules" label-width="80px">
             <el-form-item label="文档名称" prop="documentName">
                <el-input v-model="form.documentName" placeholder="请输入文档名称" />
             </el-form-item>
             <el-form-item label="文档内容" prop="document">
                <el-input v-model="form.document" placeholder="请输入文档名称" />
             </el-form-item>
             <el-form-item label="文档状态" prop="status">
                <el-radio-group v-model="form.status">
                   <el-radio
                      v-for="dict in sys_normal_disable"
                      :key="dict.value"
                      :value="dict.value"
                   >{{ dict.label }}</el-radio>
                </el-radio-group>
             </el-form-item>
          </el-form>
          <template #footer>
             <div class="dialog-footer">
                <el-button type="primary" @click="submitForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
             </div>
          </template>
       </el-dialog>
    </div>
 </template>
 
 <script setup lang="ts" name="Document">
 import {listDocument, addDocument, delDocument, getDocument, updateDocument } from "@/api/system/document"
 import type { documentQueryParams, SysDocument } from '@/types/api/system/document'
 
 const { proxy } = getCurrentInstance()
 const { sys_normal_disable } = useDict("sys_normal_disable")
 
 const documentList = ref<SysDocument[]>([])
 const open = ref<boolean>(false)
 const loading = ref<boolean>(true)
 const showSearch = ref<boolean>(true)
 const ids = ref<number[]>([])
 const single = ref<boolean>(true)
 const multiple = ref<boolean>(true)
 const total = ref<number>(0)
 const title = ref<string>("")
 
 const data = reactive({
   form: {} as SysDocument,
   queryParams: {
     pageNum: 1,
     pageSize: 10,
     documentName: undefined,
     status: undefined
   } as documentQueryParams,
   rules: {
     documentName: [{ required: true, message: "文档名称不能为空", trigger: "blur" }],
     document: [{ required: true, message: "文档内容不能为空", trigger: "blur" }],
   }
 })
 
 const { queryParams, form, rules } = toRefs(data)
 
 /** 查询文档列表 */
 function getList() {
   loading.value = true
   listDocument(queryParams.value).then(response => {
     documentList.value = response.rows
     total.value = response.total
     loading.value = false
   })
 }
 
 /** 取消按钮 */
 function cancel() {
   open.value = false
   reset()
 }
 
 /** 表单重置 */
 function reset() {
   form.value = {
    documentId: undefined,
    documentCode: undefined,
    documentName: undefined,
    documentSort: 0,
     status: "0",
     remark: undefined
   }
   proxy.resetForm("documentRef")
 }
 
 /** 搜索按钮操作 */
 function handleQuery() {
   queryParams.value.pageNum = 1
   getList()
 }
 
 /** 重置按钮操作 */
 function resetQuery() {
   proxy.resetForm("queryRef")
   handleQuery()
 }
 
 /** 多选框选中数据 */
 function handleSelectionChange(selection: SysDocument[]) {
   ids.value = selection.map(item => item.documentId!)
   single.value = selection.length != 1
   multiple.value = !selection.length
 }
 
 /** 新增按钮操作 */
 function handleAdd() {
   reset()
   open.value = true
   title.value = "添加文档"
 }
 
 /** 修改按钮操作 */
 function handleUpdate(row?: SysDocument) {
   reset()
   const documentId = row?.documentId || ids.value[0]
   getDocument(documentId).then(response => {
     form.value = response.data!
     open.value = true
     title.value = "修改文档"
   })
 }
 
 /** 提交按钮 */
 function submitForm() {
   proxy.$refs["documentRef"].validate((valid: boolean) => {
     if (valid) {
       if (form.value.documentId != undefined) {
         updateDocument(form.value).then(() => {
           proxy.$modal.msgSuccess("修改成功")
           open.value = false
           getList()
         })
       } else {
         addDocument(form.value).then(() => {
           proxy.$modal.msgSuccess("新增成功")
           open.value = false
           getList()
         })
       }
     }
   })
 }
 
 /** 删除按钮操作 */
 function handleDelete(row?: SysDocument) {
   const documentIds = row?.documentId || ids.value
   proxy.$modal.confirm('是否确认删除文档编号为"' + documentIds + '"的数据项？').then(function() {
     return delDocument(documentIds)
   }).then(() => {
     getList()
     proxy.$modal.msgSuccess("删除成功")
   }).catch(() => {})
 }
 
 
 getList()
 </script>
 