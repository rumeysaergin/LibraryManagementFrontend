export const useApi = () => {

    const apiFetch = async <T>(
        url: string,
        options: any = {}
    ) => {

        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

        const headers = {
            ...(options.headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {})
        }

        // Birincil olarak https://localhost:7205 portunu dener
        try {
            return await $fetch<T>(
                `https://localhost:7205${url}`,
                {
                    ...options,
                    headers
                }
            )
        }
        catch (err: any) {
            // Eğer SSL sertifikası veya port bağlantı hatası oluşursa http://localhost:5000 veya 5213 portlarını dener
            try {
                return await $fetch<T>(
                    `http://localhost:5000${url}`,
                    {
                        ...options,
                        headers
                    }
                )
            }
            catch {
                try {
                    return await $fetch<T>(
                        `http://localhost:5213${url}`,
                        {
                            ...options,
                            headers
                        }
                    )
                }
                catch {
                    throw err
                }
            }
        }
    }

    return {
        apiFetch
    }
}