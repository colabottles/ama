export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body?.question?.trim()) {
    throw createError({ statusCode: 400, message: 'Question is required.' })
  }

  if (body.question.trim().length > 280) {
    throw createError({ statusCode: 400, message: 'Question must be 280 characters or fewer.' })
  }

  const supabase = useServerSupabase()

  const { data, error } = await supabase
    .from('questions')
    .insert({ question: body.question.trim(), answered: false })
    .select()
    .single()

  if (error) throw createError({ statusCode: 500, message: error.message })

  return data
})