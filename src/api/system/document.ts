import request from '@/utils/request'
import type { documentQueryParams, SysDocument, AjaxResult, TableDataInfo } from '@/types'

// 查询文档列表
export function listDocument(query: documentQueryParams): Promise<TableDataInfo<SysDocument[]>> {
  return request({
    url: '/system/document/list',
    method: 'get',
    params: query
  })
}

// 查询文档详细
export function getDocument(documentId: number): Promise<AjaxResult<SysDocument>> {
  return request({
    url: '/system/document/' + documentId,
    method: 'get'
  })
}

// 新增文档
export function addDocument(data: SysDocument): Promise<AjaxResult> {
  return request({
    url: '/system/document',
    method: 'post',
    data: data
  })
}

// 修改文档
export function updateDocument(data: SysDocument): Promise<AjaxResult> {
  return request({
    url: '/system/document',
    method: 'put',
    data: data
  })
}

// 删除文档
export function delDocument(documentId: number | number[]): Promise<AjaxResult> {
  return request({
    url: '/system/document/' + documentId,
    method: 'delete'
  })
}
