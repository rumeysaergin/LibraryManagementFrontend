/**
 * Admin oturum kontrolü.
 * Her admin sayfasında onMounted içinde çağrılır.
 * Token yoksa veya kullanıcı Admin rolünde değilse /admin/login'e yönlendirir.
 */
export const useAdminAuth = () => {

    const checkAdminAuth = async () => {

        if (typeof window === 'undefined') {
            return
        }

        const token = localStorage.getItem('token')

        if (!token) {
            await navigateTo('/admin/login')
            return
        }

        const role = localStorage.getItem('role')

        if (role !== 'Admin') {
            await navigateTo('/admin/login')
        }
    }

    const adminLogout = async () => {

        if (typeof window !== 'undefined') {
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
            localStorage.removeItem('email')
            localStorage.removeItem('role')
        }

        await navigateTo('/admin/login')
    }

    return {
        checkAdminAuth,
        adminLogout
    }
}
