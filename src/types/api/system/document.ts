import type { PageDomain, BaseEntity } from "../common";

/** 文档分页查询参数 */
export interface documentQueryParams extends PageDomain {
  /** 文档name */
  documentName?: string;
  /** 状态 */
  status?: string;
}

/** 文档信息 */
export interface SysDocument extends BaseEntity {
  /** 文档ID */
  documentId?: number;
  /** 文档名称 */
  documentName?: string;
  /** 文档内容 */
  document?: string;
  /** 状态（0正常 1停用） */
  status?: '0' | '1';
  /** 删除标志（0代表存在 2代表删除） */
  delFlag:string;
}
