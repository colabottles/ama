import satori from 'satori'
import { Resvg } from '@resvg/resvg-js'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')

  const supabase = useServerSupabase()
  const { data: question, error } = await supabase
    .from('questions')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !question) {
    throw createError({ statusCode: 404, message: 'Question not found.' })
  }

  // useStorage returns binary assets as base64 strings in Nitro
  const storage = useStorage('assets/server')
  const raw = await storage.getItem('fonts/SofiaSansSemiCondensed-Medium.ttf')
  if (!raw) throw createError({ statusCode: 500, message: 'Font not found.' })
  const fontData = Buffer.from(raw as string, 'base64')

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '800px',
          height: '418px',
          background: '#000000',
          border: '1px solid #3a1012',
          borderRadius: '12px',
          padding: '40px',
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Sofia',
          color: '#fafafa',
          boxSizing: 'border-box',
        },
        children: [
          // header
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '24px',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', flexDirection: 'column', gap: '4px' },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: { fontWeight: 700, fontSize: '20px', color: '#fafafa' },
                          children: 'Todd Libby',
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: { fontSize: '16px', color: '#a07070' },
                          children: '@toddl.dev',
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'span',
                  props: {
                    style: { fontSize: '16px', fontWeight: 600, color: '#F46945' },
                    children: '#ama',
                  },
                },
              ],
            },
          },
          // terminal
          {
            type: 'div',
            props: {
              style: {
                background: 'linear-gradient(135deg, #140506 0%, #C11E23 100%)',
                borderRadius: '8px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                flex: 1,
              },
              children: [
                // dots
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', gap: '8px', alignItems: 'center' },
                    children: [
                      { type: 'div', props: { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#ff5f57' } } },
                      { type: 'div', props: { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#febc2e' } } },
                      { type: 'div', props: { style: { width: '12px', height: '12px', borderRadius: '50%', background: '#28c840' } } },
                    ],
                  },
                },
                // question body
                {
                  type: 'div',
                  props: {
                    style: {
                      background: '#000000',
                      borderRadius: '4px',
                      padding: '16px',
                      flex: 1,
                      display: 'flex',
                      alignItems: 'flex-start',
                    },
                    children: [
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '18px',
                            color: '#fafafa',
                            lineHeight: 1.5,
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                          },
                          children: question.question,
                        },
                      },
                    ],
                  },
                },
                // footer
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      color: 'rgba(255,255,255,0.4)',
                    },
                    children: [
                      { type: 'span', props: { children: 'toddl.dev/ama' } },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 800,
      height: 418,
      fonts: [
        {
          name: 'Sofia',
          data: fontData,
          weight: 400,
          style: 'normal',
        },
      ],
    }
  )

  const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: 800 } })
  const png = resvg.render().asPng()

  setResponseHeaders(event, {
    'Content-Type': 'image/png',
    'Cache-Control': 'public, max-age=31536000, immutable',
  })

  return png
})