export const useApi = () => {

    const apiFetch = async <T>(
        url: string,
        options: any = {}
    ) => {

        const token = localStorage.getItem('token')

        return await $fetch<T>(
            `https://localhost:7205${url}`,
            {
                ...options,

                headers: {
                    ...(options.headers || {}),
                    Authorization: `Bearer ${token}`
                }
            }
        )
    }

    return {
        apiFetch
    }
}