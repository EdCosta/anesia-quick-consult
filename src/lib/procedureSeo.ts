export function slugifyProcedureTitle(title: string) {
  return title
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function buildPublicProcedurePath(id: string, title: string) {
  const slug = slugifyProcedureTitle(title);
  return slug ? `/procedures/${id}/${slug}` : `/procedures/${id}`;
}
