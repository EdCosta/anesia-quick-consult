export function slugifyText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildPublicGuidelinePath(id: string, title: string) {
  const slug = slugifyText(title);
  return slug ? `/recommendations/${id}/${slug}` : `/recommendations/${id}`;
}

export function buildPublicProtocolPath(id: string, title: string) {
  const slug = slugifyText(title);
  return slug ? `/protocols/${id}/${slug}` : `/protocols/${id}`;
}
