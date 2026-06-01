export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody(event)

  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('questions')
    .update({
      answered: body.answered ?? true,
      answer: body.answer ?? null,
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})