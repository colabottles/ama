export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: false },

  runtimeConfig: {
    supabaseServiceKey: '',
    blueskyHandle: '',
    blueskyAppPassword: '',
    public: {
      supabaseUrl: '',
      supabaseAnonKey: '',
      siteHandle: '@toddl.dev',
      siteDisplayName: 'Todd Libby',
    }
  },

  app: {
    head: {
      title: 'Ask Me Anything Anonymously',
      meta: [
        { name: 'description', content: 'Ask me anything, anonymously.' }
      ]
    }
  }
})