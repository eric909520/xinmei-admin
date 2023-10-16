import request from '@/utils/request'
import {Encrypt} from '@/utils/aes'

// 查询新闻列表
export function listNews(query) {
  return request({
    url: '/system/news/list',
    method: 'post',
    data: {
      data: Encrypt(query)
    }
  })
}

// 查询新闻详细
export function getNews(id) {
  return request({
    url: '/system/news/query/' + id,
    method: 'post'
  })
}

// 新增新闻
export function addNews(data) {
  return request({
    url: '/system/news/add',
    method: 'post',
    data: {
      data: Encrypt(data)
    }
  })
}

// 修改新闻
export function updateNews(data) {
  return request({
    url: '/system/news/edit',
    method: 'post',
    data: {
      data: Encrypt(data)
    }
  })
}

// 删除新闻
export function delNews(id) {
  return request({
    url: '/system/news/remove/' + id,
    method: 'post'
  })
}
