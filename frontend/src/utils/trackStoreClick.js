import { analyticsApi } from '../api/client'

/**
 * Logs when a user clicks on an outbound link to visit a product on a store's primary website.
 * @param {Object} params
 * @param {number|string} [params.productId]
 * @param {string} [params.productName]
 * @param {string} [params.storeName]
 * @param {string} params.targetUrl
 * @param {number} [params.price]
 * @param {string} [params.sourcePage]
 */
export const trackStoreClick = ({ productId, productName, storeName, targetUrl, price, sourcePage = 'product_card' }) => {
  if (!targetUrl || targetUrl === '#') return

  try {
    const sessionId = localStorage.getItem('techprice_session_id') || 'anon_' + Math.random().toString(36).substring(2, 9)
    const token = localStorage.getItem('techprice_token')
    let userId = null
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        userId = payload.sub ? Number(payload.sub) : null
      } catch (e) {
        // Ignore jwt parse error
      }
    }

    analyticsApi.trackOutboundClick({
      product_id: productId ? Number(productId) : null,
      product_name: productName || null,
      store_name: storeName || null,
      target_url: targetUrl,
      price: price ? Number(price) : null,
      session_id: sessionId,
      user_id: userId,
      source_page: sourcePage
    }).catch(err => {
      // Fire-and-forget: do not block navigation
      console.warn('Outbound click log failed:', err)
    })
  } catch (err) {
    console.warn('Tracking error:', err)
  }
}
