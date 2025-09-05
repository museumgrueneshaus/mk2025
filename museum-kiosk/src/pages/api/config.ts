import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

// API routes require server-side rendering
export const prerender = false;

const configPath = path.join(process.cwd(), 'public', 'config', 'kiosks.json');

// Get current configuration
export const GET: APIRoute = async ({ url }) => {
  try {
    const mac = url.searchParams.get('mac');
    const data = await fs.readFile(configPath, 'utf-8');
    const config = JSON.parse(data);
    
    if (mac) {
      return new Response(JSON.stringify({
        success: true,
        config: config[mac] || null
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      config
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Get config error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to get configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Save configuration
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { mac, config: newConfig } = body;
    
    if (!mac || !newConfig) {
      return new Response(JSON.stringify({
        error: 'Missing MAC address or configuration'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Read existing config
    let existingConfig = {};
    try {
      const data = await fs.readFile(configPath, 'utf-8');
      existingConfig = JSON.parse(data);
    } catch (err) {
      console.log('No existing config found, creating new one');
    }

    // Update config for specific MAC
    existingConfig[mac] = {
      ...existingConfig[mac],
      ...newConfig,
      lastUpdated: new Date().toISOString()
    };

    // Save updated config
    await fs.writeFile(
      configPath,
      JSON.stringify(existingConfig, null, 2),
      'utf-8'
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Configuration saved successfully',
      config: existingConfig[mac]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Save config error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to save configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

// Update entire configuration (for admin panel save all)
export const PUT: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    
    // Save entire config
    await fs.writeFile(
      configPath,
      JSON.stringify(body, null, 2),
      'utf-8'
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Full configuration saved successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update config error:', error);
    return new Response(JSON.stringify({
      error: 'Failed to update configuration',
      details: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};