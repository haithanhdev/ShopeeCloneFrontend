import i18n from 'src/i18n/i18n'
import { Category, CategoryListResponse } from 'src/types/category.type'
import http from 'src/utils/http'

const URL = 'categories'
const categoryApi = {
  getCategories: () => {
    return http.get<CategoryListResponse>(URL, {
      headers: {
        'Accept-Language': i18n.language // ví dụ: 'en' hoặc 'vi'
      }
    })
  },
  getChildrenCategories: (parentCategoryId: number) => {
    if (!parentCategoryId) return
    return http.get<CategoryListResponse>(`${URL}?parentCategoryId=${parentCategoryId}`, {
      headers: {
        'Accept-Language': i18n.language // ví dụ: 'en' hoặc 'vi'
      }
    })
  },
  getDetailCategory: (id: number) => {
    if (!id) return
    return http.get<Category>(`${URL}/${id}`, {
      headers: {
        'Accept-Language': i18n.language // ví dụ: 'en' hoặc 'vi'
      }
    })
  }
}

export default categoryApi
