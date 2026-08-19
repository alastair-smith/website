export const onRequestGet: PagesFunction = async ({ request }) => {
  const { search } = new URL(request.url);
  const res = await fetch(
    `https://csdmeeplo0.execute-api.eu-west-1.amazonaws.com/${search}`,
  );

  const contentType = res.headers.get('content-type') ?? '';
  if (contentType.startsWith('image/')) return res;

  return Response.redirect(new URL('/kelly', request.url).toString(), 302);
};
