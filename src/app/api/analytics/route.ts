import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 这里可以将数据发送到分析服务
    console.log('Analytics data:', data);
    
    // 如果配置了外部分析服务
    if (process.env.ANALYTICS_ENDPOINT) {
      await fetch(process.env.ANALYTICS_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.ANALYTICS_API_KEY}`
        },
        body: JSON.stringify(data)
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to record analytics' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // 可以返回一些聚合的分析数据
  return NextResponse.json({
    message: 'Analytics endpoint',
    status: 'operational'
  });
} 