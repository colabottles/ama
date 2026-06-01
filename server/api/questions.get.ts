export default defineEventHandler(async (event) => {
  const supabase = useServerSupabase()
  const query = getQuery(event)

  let req = supabase
    .from('questions')
    .select('*')
    .order('created_at', { ascending: false })

  // admin can see all; public only sees answered
  if (query.admin !== 'true') {
    req = req.eq('answered', true)
  }

  const { data, error } = await req

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})