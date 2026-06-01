export default defineNuxtRouteMiddleware(async (to) => {
  if (!to.path.startsWith('/admin')) return

  const { getSession } = useAuth()
  const session = await getSession()

  if (!session) {
    return navigateTo('/login')
  }
})