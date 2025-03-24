// Kjo store do menaxhoje gjithcka rreth autentifikimit: regjistrimi, logimi, marrja e user-it, logout-i
import { defineStore } from "pinia"
import { ref } from "vue"
import api from "../api/api"
import router from "../router"

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const token = ref(localStorage.getItem('token') || '')

  const register = async (data) => {
    const res = await api.post('/api/register', data)
    token.value = res.data.access_token
    localStorage.setItem('token', token.value)
    api.defaults.headers.common['Authorization'] = `Bearer ${token.value}`
    await getUser()
    router.push('/')
  }  

  const login = async (data) => {
    const res = await api.post('/api/login', data)
    token.value = res.data.access_token
    localStorage.setItem('token', token.value)
    await getUser()
    router.push('/')
  }

  const getUser = async () => {
    const res = await api.get('/api/user')
    user.value = res.data
  }

  const logout = async () => {
    await api.post('/api/logout')
    token.value = ''
    user.value = null
    localStorage.removeItem('token')
    router.push('/login')
  }

  return { user, token, login, register, getUser, logout }
})
