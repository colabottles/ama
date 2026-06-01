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

  // 2. fetch and upload the card image as app.bsky.embed.images (like Daniel Roe's AMA)
  const questionUrl = body.questionUrl as string | undefined
  let embed: Record<string, unknown> | undefined

  if (questionUrl) {
    const ogImageUrl = questionUrl.replace(/\/ama\//, '/api/og/')
    const imgRes = await fetch(ogImageUrl).catch(() => null)

    if (imgRes?.ok) {
      const imgBuffer = await imgRes.arrayBuffer()
      const uploadRes = await fetch('https://bsky.social/xrpc/com.atproto.repo.uploadBlob', {
        method: 'POST',
        headers: {
          'Content-Type': 'image/png',
          'Authorization': `Bearer ${accessJwt}`,
        },
        body: imgBuffer,
      })

      if (uploadRes.ok) {
        const { blob } = await uploadRes.json()
        embed = {
          $type: 'app.bsky.embed.images',
          images: [{
            alt: body.altText || 'AMA question card',
            image: blob,
            aspectRatio: { $type: 'app.bsky.embed.defs#aspectRatio', width: 800, height: 418 },
          }],
        }
      }
    }
  }

  // 3. build facets for #ama hashtag and URL
  const text = body.text as string
  const encoder = new TextEncoder()

  const hashtagIndex = text.lastIndexOf('#ama')
  const hashtagByteStart = encoder.encode(text.slice(0, hashtagIndex)).length
  const hashtagByteEnd = hashtagByteStart + encoder.encode('#ama').length

  const urlStr = 'asktodd.netlify.app/ama'
  const urlIndex = text.lastIndexOf(urlStr)
  const urlByteStart = encoder.encode(text.slice(0, urlIndex)).length
  const urlByteEnd = urlByteStart + encoder.encode(urlStr).length

  const record: Record<string, unknown> = {
    $type: 'app.bsky.feed.post',
    text,
    createdAt: new Date().toISOString(),
    facets: [
      {
        index: { byteStart: hashtagByteStart, byteEnd: hashtagByteEnd },
        features: [{ $type: 'app.bsky.richtext.facet#tag', tag: 'ama' }],
      },
      {
        index: { byteStart: urlByteStart, byteEnd: urlByteEnd },
        features: [{ $type: 'app.bsky.richtext.facet#link', uri: 'https://asktodd.netlify.app/ama' }],
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