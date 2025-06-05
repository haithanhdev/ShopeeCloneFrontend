import i18n from 'src/i18n/i18n'
import { Product, ProductList, ProductListConfig } from 'src/types/product.type'
import http from 'src/utils/http'

const URL = 'products'
const productApi = {
  getProducts: (params: ProductListConfig) => {
    return http.get<ProductList>(URL, {
      params,
      headers: {
        'Accept-Language': i18n.language // ví dụ: 'en' hoặc 'vi'
      }
    })
  },
  getProductDetail(id: string) {
    return http.get<Product>(`${URL}/${id}`, {
      headers: {
        'Accept-Language': i18n.language // ví dụ: 'en' hoặc 'vi'
      }
    })
  }
}

export default productApi
