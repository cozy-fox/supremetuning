import { requireAdmin } from '@/lib/auth';
import { NextResponse } from 'next/server';
import { getCollection } from '@/lib/mongodb';

/**
 * POST /api/admin/upload-logo - Upload logo image to MongoDB
 * Stores image as base64 string in a separate collection
 */
export async function POST(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const groupId = formData.get('groupId');

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/svg+xml', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { message: 'Invalid file type. Only PNG, JPG, SVG, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024; // 2MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { message: 'File too large. Maximum size is 2MB.' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert to base64
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Store in MongoDB
    const logosCollection = await getCollection('group_logos');
    
    const logoData = {
      groupId: groupId ? parseInt(groupId) : null,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      dataUrl: dataUrl,
      uploadedAt: new Date(),
      uploadedBy: 'admin'
    };

    const result = await logosCollection.insertOne(logoData);

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logoId: result.insertedId.toString(),
      dataUrl: dataUrl
    });
  } catch (error) {
    console.error('❌ Upload logo error:', error);
    return NextResponse.json(
      { message: 'Failed to upload logo', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/upload-logo?id=xxx - Get logo by ID
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const logoId = searchParams.get('id');

    if (!logoId) {
      return NextResponse.json(
        { message: 'Logo ID is required' },
        { status: 400 }
      );
    }

    const logosCollection = await getCollection('group_logos');
    const { ObjectId } = require('mongodb');
    
    const logo = await logosCollection.findOne({ _id: new ObjectId(logoId) });

    if (!logo) {
      return NextResponse.json(
        { message: 'Logo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      logoId: logo._id.toString(),
      dataUrl: logo.dataUrl,
      fileName: logo.fileName,
      fileType: logo.fileType
    });
  } catch (error) {
    console.error('❌ Get logo error:', error);
    return NextResponse.json(
      { message: 'Failed to get logo', error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/upload-logo?id=xxx - Delete logo by ID
 */
export async function DELETE(request) {
  const authResult = requireAdmin(request);
  if (authResult.error) {
    return NextResponse.json(
      { message: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const logoId = searchParams.get('id');

    if (!logoId) {
      return NextResponse.json(
        { message: 'Logo ID is required' },
        { status: 400 }
      );
    }

    const logosCollection = await getCollection('group_logos');
    const { ObjectId } = require('mongodb');
    
    await logosCollection.deleteOne({ _id: new ObjectId(logoId) });

    return NextResponse.json({
      message: 'Logo deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete logo error:', error);
    return NextResponse.json(
      { message: 'Failed to delete logo', error: error.message },
      { status: 500 }
    );
  }
}

