import request from '@/utils/request'
import {Encrypt} from '@/utils/aes'

// 查询文件列表
export function listDoc(query) {
    return request({
        url: '/system/doc/admin/list',
        method: 'post',
        data: {
            data: Encrypt(query)
        }
    })
}

// 查询文件详细
export function getDoc(id) {
    return request({
        url: '/system/doc/query/' + id,
        method: 'post'
    })
}

// 新增文件
export function addDoc(data) {
    return request({
        url: '/system/doc/add',
        method: 'post',
        data: {
            data: Encrypt(data)
        }
    })
}

// 修改文件
export function updateDoc(data) {
    return request({
        url: '/system/doc/edit',
        method: 'post',
        data: {
            data: Encrypt(data)
        }
    })
}

// 删除文件
export function delDoc(id) {
    return request({
        url: '/system/doc/remove/' + id,
        method: 'post'
    })
}

