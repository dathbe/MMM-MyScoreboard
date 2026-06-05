/*
  Rewrite outbound provider fetches to a local fixture HTTP server.

  Installed via NODE_OPTIONS="--import file:///abs/path/to/fetch-shim.js"
  before spawning MagicMirror. The fixture server's port is read from
  the FIXTURE_PORT env var.
*/

const FIXTURE_PORT = parseInt(process.env.FIXTURE_PORT ?? '8765', 10)

const PROVIDER_HOSTS = new Set([
  'site.web.api.espn.com',
  'site.api.espn.com',
  'mastapi.mobile.mlbinfra.com',
  'stats-api.sportsnet.ca',
  'api-sdp.canpl.ca',
  'lscluster.hockeytech.com',
])

const origFetch = globalThis.fetch

globalThis.fetch = async function (input, init) {
  let url
  try {
    url = new URL(typeof input === 'string' ? input : input?.url ?? String(input))
  }
  catch {
    return origFetch(input, init)
  }
  if (PROVIDER_HOSTS.has(url.host)) {
    url.protocol = 'http:'
    url.host = `localhost:${FIXTURE_PORT}`
    return origFetch(url.toString(), init)
  }
  return origFetch(input, init)
}
