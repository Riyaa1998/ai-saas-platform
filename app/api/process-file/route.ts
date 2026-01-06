import { NextResponse } from 'next/server';
import { Readable } from 'stream';
import * as XLSX from 'xlsx';

// Helper function to convert buffer to stream
const bufferToStream = (buffer: Buffer) => {
  const readable = new Readable();
  readable._read = () => {}; // _read is required but you can noop it
  readable.push(buffer);
  readable.push(null);
  return readable;
};

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Read the file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    let data: any[] = [];
    
    // Check file extension
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (fileExt === 'csv') {
      // Parse CSV
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
    } else if (['xls', 'xlsx'].includes(fileExt || '')) {
      // Parse Excel
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const firstSheet = workbook.SheetNames[0];
      data = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    // Here you would typically process the data and generate predictions
    // For now, we'll just return the parsed data
    return NextResponse.json({
      success: true,
      data,
      message: 'File processed successfully'
    });

  } catch (error) {
    console.error('Error processing file:', error);
    return NextResponse.json(
      { error: 'Failed to process file' },
      { status: 500 }
    );
  }
}
