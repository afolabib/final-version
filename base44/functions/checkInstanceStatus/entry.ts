import { createClientFromRequest } from 'npm:@base44/sdk@0.8.23';

const FLY_API_TOKEN = Deno.env.get('FLY_API_TOKEN');
const FLY_APP_NAME = Deno.env.get('FLY_APP_NAME') || 'openclaw-prod';
const FLY_API_BASE = 'https://api.machines.dev';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { instanceId } = await req.json();

    if (!instanceId) {
      return Response.json({ error: 'Missing instanceId' }, { status: 400 });
    }

    const instance = await base44.asServiceRole.entities.CustomerInstance.get(instanceId);
    if (!instance) {
      return Response.json({ error: 'Instance not found' }, { status: 404 });
    }

    if (user.role !== 'admin' && instance.customerId !== user.id) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const machineId = instance.config?.machineId || instance.appId;

    const res = await fetch(`${FLY_API_BASE}/v1/apps/${FLY_APP_NAME}/machines/${machineId}`, {
      headers: {
        'Authorization': `Bearer ${FLY_API_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    if (!res.ok) {
      return Response.json({ success: true, status: 'failed' });
    }

    const machine = await res.json();
    let status;
    switch (machine.state) {
      case 'started': status = 'active'; break;
      case 'stopped':
      case 'suspended': status = 'paused'; break;
      default: status = 'failed';
    }

    if (status !== instance.status) {
      await base44.asServiceRole.entities.CustomerInstance.update(instanceId, { status });
    }

    return Response.json({ success: true, status, machineState: machine.state });
  } catch (error) {
    console.error('Status check error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});