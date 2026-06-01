export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody(event)

  if (!body?.text) {
    throw createError({ statusCode: 400, message: 'Post text is required.' })
  }

  if (!config.blueskyHandle || !config.blueskyAppPassword) {
    throw createError({ statusCode: 500, message: 'Bluesky credentials not configured.' })
  }

  // 1. authenticate
  const sessionRes = await fetch('https://bsky.social/xrpc/com.atproto.server.createSession', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      identifier: config.blueskyHandle,
      password: config.blueskyAppPassword,
    }),
  })

  if (!sessionRes.ok) {
    throw createError({ statusCode: 401, message: 'Bluesky authentication failed.' })
  }

  const session = await sessionRes.json()
  const accessJwt = session.accessJwt
  const did = session.did

  // 2. resolve the question URL into a link card (external embed)
  const questionUrl = body.questionUrl as string | undefined
  let embed: Record<string, unknown> | undefined

  if (questionUrl) {
    // fetch OG data for the link card
    const ogRes = await fetch(questionUrl).catch(() => null)
    const ogHtml = ogRes ? await ogRes.text() : ''

    const getOg = (prop: string) => {
      const match = ogHtml.match(new RegExp(`<meta[^>]*property=["']${prop}["'][^>]*content=["']([^"']+)["']`, 'i'))
        ?? ogHtml.match(new RegExp(`<meta[^>]*content=["']([^"']+)["'][^>]*property=["']${prop}["']`, 'i'))
      return match?.[1] ?? ''
    }

    const ogImage = getOg('og:image')
    const ogTitle = getOg('og:title')
    const ogDescription = getOg('og:description')

    // upload OG image as blob for the link card thumbnail
    let thumbBlob = null
    if (ogImage) {
      const imgRes = await fetch(ogImage).catch(() => null)
      if (imgRes?.ok) {
        const imgBuffer = await imgRes.arrayBuffer()
        const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
          method: 'POST',
          headers: {
            'Content-Type': imgRes.headers.get('content-type') ?? 'image/png',
            'Authorization': `Bearer ${accessJwt}`,
          },
          body: imgBuffer,
        })
        if (uploadRes.ok) {
          thumbBlob = (await uploadRes.json()).blob
        }
      }
    }

    embed = {
      $type: 'app.bsky.embed.external',
      external: {
        uri: questionUrl,
        title: ogTitle || 'AMA',
        description: ogDescription || '',
        ...(thumbBlob ? { thumb: thumbBlob } : {}),
      },
    }
  }

  // 3. build facets for #ama hashtag
  const text = body.text as string
  const hashtagIndex = text.lastIndexOf('#ama')
  const encoder = new TextEncoder()
  const byteStart = encoder.encode(text.slice(0, hashtagIndex)).length
  const byteEnd = byteStart + encoder.encode('#ama').length

  const record: Record<string, unknown> = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    facets: [
      {
        index: { byteStart, byteEnd },
        features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ama' }],
      },
    ],
    ...(embed ? { embed } : {}),
  }

  // 4. create the post
  const postRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.createRecord', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessJwt}`,
    },
    body: JSON.stringify({
      repo: did,
      collection: 'app.bsky.feed.post',
      record,
    }),
  })

  if (!postRes.ok) {
    const err = await postRes.json()
    throw createError({ statusCode: 500, message: err.message ?? 'Failed to create Bluesky post.' })
  }

  const post = await postRes.json()
  return { uri: post.uri, cid: post.cid }
})