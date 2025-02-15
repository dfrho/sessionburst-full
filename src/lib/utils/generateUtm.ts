export function generateUtm() {
  const sources = [
    'google',
    'chatgpt',
    'facebook',
    'twitter',
    'direct',
    'email',
  ];
  const campaigns = ['winter2024', 'socialads', 'emailblast', 'organic'];
  const mediums = ['search', 'social', 'cpc', 'email', 'organic'];
  const searchTerms = [
    'session simulation',
    'saas analytics',
    'demo automation',
    'user testing',
  ];

  const utm_medium = mediums[Math.floor(Math.random() * mediums.length)];
  const params = {
    utm_source: sources[Math.floor(Math.random() * sources.length)],
    utm_medium,
    utm_campaign: campaigns[Math.floor(Math.random() * campaigns.length)],
  };

  // Add utm_term only if medium is search
  if (utm_medium === 'search') {
    params.utm_term =
      searchTerms[Math.floor(Math.random() * searchTerms.length)];
  }

  return params;
}
