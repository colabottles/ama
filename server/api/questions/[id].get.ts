export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const supabase = useServerSupabase()
  const { data, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .eq('answered', true)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, message: 'Question not found.' })
  }

  return data
})