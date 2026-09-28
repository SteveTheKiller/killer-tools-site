interface ReleaseAsset {
  name: string;
  size: number;
  browser_download_url: string;
}

interface GitHubRelease {
  tag_name: string;
  assets: ReleaseAsset[];
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== 'GET') {
      return new Response(null, { status: 405, headers: { Allow: 'GET' } });
    }

    try {
      const upstream = await fetch('https://api.github.com/repos/SteveTheKiller/KillerMCP/releases/latest', {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'KillerTools-release-metadata',
        },
        cf: { cacheEverything: true, cacheTtl: 300 },
      });
      if (!upstream.ok) {
        return new Response(null, { status: 503 });
      }

      const release = await upstream.json() as GitHubRelease;
      const asset = release.assets?.find(item => item.name === 'KillerMCP-Setup.exe');
      if (!/^v\d+\.\d+\.\d+$/.test(release.tag_name) || !asset || !Number.isFinite(asset.size) || asset.size <= 0) {
        return new Response(null, { status: 503 });
      }

      return Response.json({
        tag_name: release.tag_name,
        assets: [{
          name: asset.name,
          size: asset.size,
          browser_download_url: asset.browser_download_url,
        }],
      }, { headers: { 'Cache-Control': 'public, max-age=300' } });
    }
    catch {
      return new Response(null, { status: 503 });
    }
  },
};
