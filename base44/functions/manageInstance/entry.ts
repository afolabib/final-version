import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FLY_API_TOKEN = Deno.env.get('FLY_API_TOKEN');
const FLY_APP_NAME = Deno.env.get('FLY_APP_NAME') || 'openclaw-prod';
const FLY_API_BASE = 'https://api.machines.dev';

async function flyFetch(path, options = {}) {
  const response = await fetch(`${FLY_API_BASE}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${FLY_API_TOKEN}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Fly.io API ${response.status}: ${text}`);
  }
  return response;
}

async function startMachine(machineId) {
  await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines/${machineId}/start`, { method: 'POST' });
  await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines/${machineId}/wait?state=started`);
}

async function stopMachine(machineId) {
  await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines/${machineId}/stop`, { method: 'POST' });
  await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines/${machineId}/wait?state=stopped`);
}

async function deleteMachine(machineId, volumeId) {
  try { await stopMachine(machineId); } catch { /* already stopped */ }
  await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines/${machineId}?force=true`, { method: 'DELETE' });
  if (volumeId) {
    await flyFetch(`/v1/apps/${FLY_APP_NAME}/volumes/${volumeId}`, { method: 'DELETE' });
  }
}

async function getMachineStatus(machineId) {
  const res = await flyFetch(`/v1/apps/${FLY_APP_NAME}/machines/${machineId}`);
  const machine = await res.json();
  switch (machine.state) {
    case 'started': return 'active';
    case 'stopped':
    case 'suspended': return 'paused';
    default: return 'failed';
  }
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { instanceId, action } = await req.json();

    if (!instanceId || !action) {
      return Response.json({ error: 'Missing instanceId or action' }, { status: 400 });
    }

    if (!['start', 'stop', 'delete', 'status'].includes(action)) {
      return Response.json({ error: 'Invalid action. Must be: start, stop, delete, status' }, { status: 400 });
    }

    // Get instance — admin can manage any, users only their own
    const instance = await base44.asServiceRole.entities.CustomerInstance.get(instanceId);
    if (!instance) {
      return Response.json({ error: 'Instance not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && instance.customerId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const machineId = instance.config?.machineId || instance.appId;
    const volumeId = instance.config?.volumeId;

    switch (action) {
      case 'start': {
        await startMachine(machineId);
        await base44.asServiceRole.entities.CustomerInstance.update(instanceId, { status: 'active' });
        return Response.json({ success: true, status: 'active' });
      }
      case 'stop': {
        await stopMachine(machineId);
        await base44.asServiceRole.entities.CustomerInstance.update(instanceId, { status: 'paused' });
        return Response.json({ success: true, status: 'paused' });
      }
      case 'delete': {
        await deleteMachine(machineId, volumeId);
        await base44.asServiceRole.entities.CustomerInstance.delete(instanceId);
        return Response.json({ success: true, status: 'deleted' });
      }
      case 'status': {
        const status = await getMachineStatus(machineId);
        if (status !== instance.status) {
          await base44.asServiceRole.entities.CustomerInstance.update(instanceId, { status });
        }
        return Response.json({ success: true, status });
      }
    }
  } catch (error) {
    console.error('Manage instance error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});