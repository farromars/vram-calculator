export async function GET() {
  return Response.json({ 
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'llm-vram-calculator',
    version: '1.0.0'
  })
} 