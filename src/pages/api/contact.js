export async function POST(request) {
  const result = 'Request success';
  console.log(request.body);
  return new Response(JSON.stringify(result), {
    headers: {
      'Content-Type': 'application/json',
    },
  });
}
