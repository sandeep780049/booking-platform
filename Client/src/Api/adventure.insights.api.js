import { axiosClient } from '../AxiosClient/axios'

export const getAdventureInsights = async (adventureId, range = 'month') => {
  const res = await axiosClient.get(`/api/admin/adventure-insights/${adventureId}`, {
    params: { range },
    withCredentials: true,
  })
  return res.data
}
