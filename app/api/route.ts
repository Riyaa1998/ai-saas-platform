// app/api/analytics/route.ts
import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs';

export async function GET() {
  try {
    // In production, this would call your Python service
    // For now, we'll read from the generated JSON file
    const filePath = path.join(process.cwd(), 'components', 'analytics', 'analytics_data.json');
    
    // Generate new data
    const { exec } = require('child_process');
    exec('python components/analytics/analytics_service.py');
    
    // Read the generated file
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return NextResponse.json(jsonData);
  } catch (error) {
    console.error('Error in analytics API:', error);
    return NextResponse.json(
      { error: 'Failed to load analytics' },
      { status: 500 }
    );
  }
}