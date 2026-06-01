export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const supabase = useServerSupabase()

  const { error } = await supabase
    .from('questions')
    .delete()
    .eq('id', id)

  if (error) throw createError({ statusCode: 500, message: error.message })

  return { deleted: true }
})