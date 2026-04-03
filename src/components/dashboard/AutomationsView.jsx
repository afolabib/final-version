import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, X, ChevronDown, ChevronRight, ArrowDown, GripVertical,
  Zap, Clock, Mail, Database, Bot, Send, Slack,
  Globe, Filter, ListTodo, ToggleLeft, ToggleRight,
  Pencil, Trash2, Check, ArrowUp, Sparkles, Play,
  AlertCircle, CheckCircle2, Timer, RefreshCw, ChevronLeft,
  Webhook, FormInput, CreditCard, Bell, GitBranch, Repeat,
  Eye, BarChart2, Activity
} from 'lucide-react';
import { useCompany } from '@/contexts/CompanyContext';

// ── Step type registry ────────────────────────────────────────────────────────

const TRIGGER_TYPES = [
  {
    id: 'schedule', label: 'Schedule', icon: Clock, color: '#5B5FFF',
    desc: 'Run on a time schedule',
    fields: [
      { key: 'cron_label', label: 'Frequency', type: 'select', options: ['Every 15 minutes', 'Every hour', 'Every day at 9am', 'Every Monday 8am', 'Every Friday 5pm', 'First of the month'] },
      { key: 'timezone', label: 'Timezone', type: 'select', options: ['UTC', 'US/Eastern', 'US/Pacific', 'Europe/London', 'Europe/Paris'] },
    ],
  },
  {
    id: 'email', label: 'Email received', icon: Mail, color: '#0EA5E9',
    desc: 'Trigger when an email arrives',
    fields: [
      { key: 'filter', label: 'Filter (optional)', type: 'text', placeholder: 'e.g. from:customer@acme.com' },
      { key: 'label', label: 'Gmail label', type: 'select', options: ['Inbox', 'Important', 'Starred', 'Support', 'Custom…'] },
    ],
  },
  {
    id: 'new_record', label: 'New CRM record', icon: Database, color: '#10B981',
    desc: 'When a record is created or updated',
    fields: [
      { key: 'source', label: 'CRM source', type: 'select', options: ['HubSpot', 'Salesforce', 'Pipedrive', 'Attio', 'Notion'] },
      { key: 'event', label: 'Event', type: 'select', options: ['New contact', 'New deal', 'Stage change', 'Task completed', 'Note added'] },
    ],
  },
  {
    id: 'webhook', label: 'Webhook', icon: Globe, color: '#8B5CF6',
    desc: 'Receive data from an external service',
    fields: [
      { key: 'path', label: 'Endpoint path', type: 'text', placeholder: '/webhook/my-trigger' },
      { key: 'method', label: 'Method', type: 'select', options: ['POST', 'GET', 'PUT', 'PATCH'] },
    ],
  },
  {
    id: 'form_submit', label: 'Form submitted', icon: FormInput, color: '#F59E0B',
    desc: 'Trigger from a form submission',
    fields: [
      { key: 'form_name', label: 'Form name', type: 'text', placeholder: 'e.g. Contact form' },
      { key: 'source', label: 'Source', type: 'select', options: ['Typeform', 'Tally', 'HubSpot form', 'Custom (embedded)'] },
    ],
  },
  {
    id: 'stripe_event', label: 'Stripe event', icon: CreditCard, color: '#6B63FF',
    desc: 'Trigger on payment or subscription events',
    fields: [
      { key: 'event', label: 'Event type', type: 'select', options: ['Payment succeeded', 'Subscription created', 'Invoice past due', 'Churn (cancelled)'] },
    ],
  },
];

const ACTION_TYPES = [
  {
    id: 'agent_task', label: 'Agent task', icon: Bot, color: '#5B5FFF',
    desc: 'Assign work to an AI agent',
    fields: [
      { key: 'agent', label: 'Agent', type: 'select', options: ['Freemi (CEO)', 'Aria (Sales)', 'Marcus (Marketing)', 'Nova (Support)', 'Dex (Operations)'] },
      { key: 'instruction', label: 'Instruction', type: 'textarea', placeholder: 'What should the agent do with {{trigger.data}}?' },
      { key: 'output_var', label: 'Save output as', type: 'text', placeholder: 'e.g. draft_email' },
    ],
  },
  {
    id: 'send_email', label: 'Send email', icon: Send, color: '#10B981',
    desc: 'Send an email via connected inbox',
    fields: [
      { key: 'to', label: 'To', type: 'text', placeholder: '{{trigger.email}} or fixed address' },
      { key: 'subject', label: 'Subject', type: 'text', placeholder: 'e.g. Your daily digest — {{date}}' },
      { key: 'body', label: 'Body', type: 'textarea', placeholder: '{{prev.output}} or write message' },
      { key: 'reply_to', label: 'Reply-to (optional)', type: 'text', placeholder: 'Leave blank to use default' },
    ],
  },
  {
    id: 'slack_message', label: 'Slack message', icon: Slack, color: '#4A154B',
    desc: 'Post a message to a Slack channel',
    fields: [
      { key: 'channel', label: 'Channel', type: 'text', placeholder: '#sales or @username' },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: '{{prev.output}}' },
      { key: 'mention', label: 'Mention (optional)', type: 'text', placeholder: '@here or @channel' },
    ],
  },
  {
    id: 'http_request', label: 'HTTP request', icon: Globe, color: '#F59E0B',
    desc: 'Call any external API endpoint',
    fields: [
      { key: 'method', label: 'Method', type: 'select', options: ['POST', 'GET', 'PUT', 'PATCH', 'DELETE'] },
      { key: 'url', label: 'URL', type: 'text', placeholder: 'https://api.example.com/endpoint' },
      { key: 'headers', label: 'Headers (JSON)', type: 'textarea', placeholder: '{"Authorization": "Bearer {{secrets.api_key}}"}' },
      { key: 'body', label: 'Body (JSON)', type: 'textarea', placeholder: '{"data": "{{prev.output}}"}' },
    ],
  },
  {
    id: 'condition', label: 'Condition / filter', icon: Filter, color: '#8B5CF6',
    desc: 'Branch or filter based on a value',
    fields: [
      { key: 'field', label: 'Value', type: 'text', placeholder: '{{prev.confidence}} or {{trigger.score}}' },
      { key: 'operator', label: 'Operator', type: 'select', options: ['equals', 'not equals', 'contains', 'does not contain', 'greater than', 'less than', 'is empty', 'is not empty'] },
      { key: 'value', label: 'Compare to', type: 'text', placeholder: 'e.g. 70' },
      { key: 'on_false', label: 'On false', type: 'select', options: ['Stop workflow', 'Continue anyway', 'Jump to step…'] },
    ],
  },
  {
    id: 'create_task', label: 'Create task', icon: ListTodo, color: '#F43F5E',
    desc: 'Create a task in Freemi',
    fields: [
      { key: 'title', label: 'Task title', type: 'text', placeholder: '{{prev.output}} or write title' },
      { key: 'assignee', label: 'Assign to', type: 'select', options: ['Freemi (CEO)', 'Aria (Sales)', 'Marcus (Marketing)', 'Nova (Support)', 'Unassigned'] },
      { key: 'priority', label: 'Priority', type: 'select', options: ['critical', 'high', 'medium', 'low'] },
      { key: 'due_in', label: 'Due in', type: 'select', options: ['1 hour', '4 hours', 'End of day', '2 days', '1 week', 'No due date'] },
    ],
  },
  {
    id: 'wait', label: 'Wait / delay', icon: Timer, color: '#64748B',
    desc: 'Pause the workflow before the next step',
    fields: [
      { key: 'duration', label: 'Wait for', type: 'select', options: ['30 seconds', '5 minutes', '1 hour', '4 hours', '1 day', '3 days', '1 week'] },
      { key: 'until', label: 'Or wait until (optional)', type: 'text', placeholder: '{{trigger.scheduled_at}} — leave blank to ignore' },
    ],
  },
  {
    id: 'notify', label: 'In-app notification', icon: Bell, color: '#EC4899',
    desc: 'Send a notification inside Freemi',
    fields: [
      { key: 'title', label: 'Title', type: 'text', placeholder: 'e.g. New lead qualified' },
      { key: 'message', label: 'Message', type: 'textarea', placeholder: '{{prev.output}}' },
      { key: 'urgency', label: 'Urgency', type: 'select', options: ['Normal', 'High', 'Critical'] },
    ],
  },
  {
    id: 'loop', label: 'Loop / for each', icon: Repeat, color: '#0EA5E9',
    desc: 'Repeat for each item in a list',
    fields: [
      { key: 'list', label: 'Input list', type: 'text', placeholder: '{{prev.items}} or {{trigger.records}}' },
      { key: 'var_name', label: 'Item variable name', type: 'text', placeholder: 'e.g. item' },
    ],
  },
];

const ALL_TYPES = [...TRIGGER_TYPES, ...ACTION_TYPES];
function typeById(id) { return ALL_TYPES.find(t => t.id === id); }
const uid = () => Math.random().toString(36).slice(2, 8);

// ── Step validation ───────────────────────────────────────────────────────────
function isStepConfigured(step) {
  const type = typeById(step.type);
  if (!type) return false;
  const required = type.fields.filter(f => !f.label.includes('optional') && !f.label.includes('(optional)'));
  return required.some(f => step.config?.[f.key]?.trim?.());
}

// ── Infer steps from prompt ───────────────────────────────────────────────────
function inferSteps(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('email') && (p.includes('inbox') || p.includes('respond') || p.includes('reply'))) return [
    { id: uid(), type: 'email',      config: { filter: '', label: 'Inbox' } },
    { id: uid(), type: 'agent_task', config: { agent: 'Freemi (CEO)', instruction: 'Categorize this email and draft an appropriate response', output_var: 'draft' } },
    { id: uid(), type: 'condition',  config: { field: '{{draft.confidence}}', operator: 'greater than', value: '80', on_false: 'Stop workflow' } },
    { id: uid(), type: 'send_email', config: { to: '{{trigger.from}}', subject: 'Re: {{trigger.subject}}', body: '{{draft.output}}' } },
  ];
  if (p.includes('lead') || p.includes('crm') || p.includes('contact')) return [
    { id: uid(), type: 'new_record', config: { source: 'HubSpot', event: 'New contact' } },
    { id: uid(), type: 'agent_task', config: { agent: 'Aria (Sales)', instruction: 'Research this lead and write a personalised outreach email', output_var: 'outreach' } },
    { id: uid(), type: 'condition',  config: { field: '{{outreach.confidence}}', operator: 'greater than', value: '70', on_false: 'Stop workflow' } },
    { id: uid(), type: 'wait',       config: { duration: '5 minutes' } },
    { id: uid(), type: 'send_email', config: { to: '{{trigger.email}}', subject: 'Quick question', body: '{{outreach.output}}' } },
  ];
  if (p.includes('daily') || p.includes('morning') || p.includes('digest') || p.includes('summary')) return [
    { id: uid(), type: 'schedule',   config: { cron_label: 'Every day at 9am', timezone: 'UTC' } },
    { id: uid(), type: 'agent_task', config: { agent: 'Freemi (CEO)', instruction: "Summarize yesterday's completed tasks and today's open priorities", output_var: 'digest' } },
    { id: uid(), type: 'send_email', config: { to: '{{user.email}}', subject: 'Your Daily Digest — {{date}}', body: '{{digest.output}}' } },
    { id: uid(), type: 'notify',     config: { title: 'Digest sent', message: 'Your daily summary is in your inbox', urgency: 'Normal' } },
  ];
  if (p.includes('meeting') || p.includes('calendar') || p.includes('prep')) return [
    { id: uid(), type: 'schedule',   config: { cron_label: 'Every day at 9am', timezone: 'UTC' } },
    { id: uid(), type: 'agent_task', config: { agent: 'Freemi (CEO)', instruction: 'Find upcoming meetings and research each attendee', output_var: 'brief' } },
    { id: uid(), type: 'send_email', config: { to: '{{user.email}}', subject: 'Meeting prep — {{date}}', body: '{{brief.output}}' } },
  ];
  if (p.includes('weekly') || p.includes('report') || p.includes('pulse')) return [
    { id: uid(), type: 'schedule',   config: { cron_label: 'Every Friday 5pm', timezone: 'UTC' } },
    { id: uid(), type: 'agent_task', config: { agent: 'Freemi (CEO)', instruction: 'Compile weekly KPIs: revenue, pipeline, open tasks and team performance', output_var: 'report' } },
    { id: uid(), type: 'slack_message', config: { channel: '#team', message: '{{report.output}}', mention: '@here' } },
    { id: uid(), type: 'create_task', config: { title: 'Review weekly report', assignee: 'Freemi (CEO)', priority: 'high', due_in: 'End of day' } },
  ];
  if (p.includes('support') || p.includes('ticket') || p.includes('customer')) return [
    { id: uid(), type: 'webhook',    config: { path: '/webhook/support-ticket', method: 'POST' } },
    { id: uid(), type: 'agent_task', config: { agent: 'Nova (Support)', instruction: 'Analyse the ticket, find the best resolution and draft a reply', output_var: 'reply' } },
    { id: uid(), type: 'condition',  config: { field: '{{reply.complexity}}', operator: 'equals', value: 'simple', on_false: 'Continue anyway' } },
    { id: uid(), type: 'send_email', config: { to: '{{trigger.email}}', subject: 'Re: Your support request', body: '{{reply.output}}' } },
    { id: uid(), type: 'create_task', config: { title: 'Follow up: {{trigger.subject}}', assignee: 'Nova (Support)', priority: 'medium', due_in: '1 day' } },
  ];
  if (p.includes('stripe') || p.includes('payment') || p.includes('churn')) return [
    { id: uid(), type: 'stripe_event', config: { event: 'Churn (cancelled)' } },
    { id: uid(), type: 'agent_task',   config: { agent: 'Aria (Sales)', instruction: 'Write a personalised win-back message based on their usage history', output_var: 'winback' } },
    { id: uid(), type: 'wait',         config: { duration: '1 hour' } },
    { id: uid(), type: 'send_email',   config: { to: '{{trigger.email}}', subject: "We'd love to have you back", body: '{{winback.output}}' } },
  ];
  return [
    { id: uid(), type: 'schedule',   config: { cron_label: 'Every day at 9am', timezone: 'UTC' } },
    { id: uid(), type: 'agent_task', config: { agent: 'Freemi (CEO)', instruction: prompt, output_var: 'result' } },
    { id: uid(), type: 'notify',     config: { title: 'Workflow done', message: '{{result.output}}', urgency: 'Normal' } },
  ];
}

function inferName(prompt) {
  const p = prompt.toLowerCase();
  if (p.includes('daily') || p.includes('morning') || p.includes('digest')) return 'Daily Task Digest';
  if (p.includes('lead') || p.includes('crm')) return 'Lead Follow-Up';
  if (p.includes('email') && p.includes('inbox')) return 'Email Inbox Manager';
  if (p.includes('meeting') || p.includes('calendar')) return 'Meeting Prep Brief';
  if (p.includes('weekly') || p.includes('report')) return 'Weekly Business Pulse';
  if (p.includes('support') || p.includes('ticket')) return '24/7 Support Agent';
  if (p.includes('stripe') || p.includes('churn')) return 'Win-Back Campaign';
  return prompt.split(' ').slice(0, 4).map(w => w[0]?.toUpperCase() + w.slice(1)).join(' ');
}

// ── Building animation ────────────────────────────────────────────────────────
function BuildingState({ label, onDone }) {
  const steps = ['Parsing your description…', 'Identifying trigger & actions…', 'Wiring up data flow…', 'Activating workflow…'];
  const [step, setStep] = useState(0);
  useEffect(() => {
    const timers = steps.map((_, i) => setTimeout(() => setStep(i), i * 700));
    const done = setTimeout(onDone, steps.length * 700 + 300);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
  }, []);
  return (
    <div className="flex flex-col items-center justify-center flex-1 gap-6">
      <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg,#5B5FFF,#2563EB)', boxShadow: '0 8px 32px rgba(91,95,255,0.35)' }}>
        <Sparkles size={26} color="#fff" strokeWidth={1.8} />
      </motion.div>
      <div className="text-center">
        <p className="text-base font-semibold mb-1.5" style={{ color: '#0A0F1E' }}>
          Building <span style={{ color: '#5B5FFF' }}>"{label}"</span>
        </p>
        <AnimatePresence mode="wait">
          <motion.p key={step} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="text-sm font-medium" style={{ color: '#94A3B8' }}>{steps[step]}</motion.p>
        </AnimatePresence>
      </div>
      <div className="flex gap-2">
        {steps.map((_, i) => (
          <motion.div key={i} animate={{ width: i <= step ? 22 : 8 }} transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="rounded-full h-2" style={{ background: i <= step ? '#5B5FFF' : '#E2E8F0', minWidth: 8 }} />
        ))}
      </div>
    </div>
  );
}

// ── Token badge ───────────────────────────────────────────────────────────────
function TokenInput({ value, onChange, placeholder, multiline = false }) {
  const parts = (value || '').split(/({{[^}]+}})/g);
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <div className="relative">
      <Tag
        value={value || ''}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        className="w-full text-sm rounded-xl px-3 py-2.5 outline-none resize-none font-mono"
        style={{ background: '#F8FAFF', border: '1.5px solid rgba(91,95,255,0.12)', color: '#0A0F1E', lineHeight: 1.6 }}
      />
    </div>
  );
}

// ── Branded field input ───────────────────────────────────────────────────────
function BrandInput({ value, onChange, placeholder, multiline, accentColor }) {
  const [focused, setFocused] = useState(false);
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Tag
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      placeholder={placeholder}
      rows={multiline ? 3 : undefined}
      className="w-full text-sm outline-none resize-none font-medium"
      style={{
        background: focused ? '#fff' : 'rgba(248,250,255,0.8)',
        border: `1.5px solid ${focused ? (accentColor || '#5B5FFF') + '40' : 'rgba(0,0,0,0.08)'}`,
        borderRadius: 12,
        padding: multiline ? '10px 14px' : '10px 14px',
        color: '#0A0F1E',
        lineHeight: 1.6,
        boxShadow: focused ? `0 0 0 3px ${(accentColor || '#5B5FFF')}10` : 'none',
        transition: 'all 150ms ease',
        fontFamily: value?.includes('{{') ? 'monospace' : 'inherit',
      }}
    />
  );
}

// ── Step config form ──────────────────────────────────────────────────────────
function StepConfigForm({ step, onChange, accentColor }) {
  const type = typeById(step.type);
  if (!type) return null;
  return (
    <div className="space-y-4">
      {type.fields.map(field => (
        <div key={field.key}>
          <label className="flex items-center gap-1.5 mb-2">
            <span className="text-[11px] font-bold" style={{ color: '#64748B' }}>{field.label}</span>
            {field.label.toLowerCase().includes('optional') && (
              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: '#F1F5F9', color: '#94A3B8' }}>optional</span>
            )}
          </label>
          {field.type === 'select' ? (
            <div className="relative">
              <select
                value={step.config?.[field.key] || ''}
                onChange={e => onChange({ ...step, config: { ...step.config, [field.key]: e.target.value } })}
                className="w-full text-sm font-medium outline-none appearance-none"
                style={{
                  background: 'rgba(248,250,255,0.8)',
                  border: '1.5px solid rgba(0,0,0,0.08)',
                  borderRadius: 12,
                  padding: '10px 36px 10px 14px',
                  color: step.config?.[field.key] ? '#0A0F1E' : '#94A3B8',
                  cursor: 'pointer',
                }}>
                <option value="">Choose…</option>
                {field.options.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
              <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: '#94A3B8' }} />
            </div>
          ) : (
            <BrandInput
              multiline={field.type === 'textarea'}
              value={step.config?.[field.key] || ''}
              placeholder={field.placeholder}
              accentColor={accentColor}
              onChange={v => onChange({ ...step, config: { ...step.config, [field.key]: v } })}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// ── Step row (left panel) ─────────────────────────────────────────────────────
function StepRow({ step, index, isSelected, isTrigger, onSelect, onDelete, totalSteps, isDragOver, onDragStart, onDragOver, onDrop }) {
  const [hovered, setHovered] = useState(false);
  const type = typeById(step.type);
  if (!type) return null;
  const Icon = type.icon;
  const configured = isStepConfigured(step);
  const summary = Object.values(step.config || {}).filter(v => v && !v.startsWith('{')).slice(0, 2).join(' · ') || '—';

  return (
    <div className="relative" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
      <div
        draggable={!isTrigger}
        onDragStart={e => { if (!isTrigger) { e.dataTransfer.effectAllowed = 'move'; onDragStart(step.id); } }}
        onDragOver={e => { e.preventDefault(); onDragOver(step.id); }}
        onDrop={e => { e.preventDefault(); onDrop(step.id); }}
        onDragLeave={() => onDragOver(null)}
        onClick={() => onSelect(step.id)}
        className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all"
        style={{
          cursor: isTrigger ? 'pointer' : 'grab',
          background: isDragOver ? `${type.color}0D` : isSelected ? `${type.color}08` : hovered ? 'rgba(0,0,0,0.025)' : 'transparent',
          border: isDragOver ? `1.5px dashed ${type.color}` : isSelected ? `1.5px solid ${type.color}25` : '1.5px solid transparent',
          transform: isDragOver ? 'scale(1.01)' : 'none',
          transition: 'all 150ms ease',
        }}>

        {/* Drag handle / step number */}
        <div className="flex-shrink-0 w-4 flex items-center justify-center">
          {isTrigger ? (
            <div className="w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black"
              style={{ background: isSelected ? type.color : '#E2E8F0', color: isSelected ? '#fff' : '#94A3B8' }}>
              1
            </div>
          ) : (
            <GripVertical size={14} style={{ color: hovered ? '#CBD5E1' : 'transparent', transition: 'color 150ms' }} />
          )}
        </div>

        {/* Icon */}
        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${type.color}15` }}>
          <Icon size={14} style={{ color: type.color }} />
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            {isTrigger && (
              <span className="text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: `${type.color}18`, color: type.color }}>TRIGGER</span>
            )}
            <span className="text-xs font-semibold truncate" style={{ color: '#0A0F1E' }}>{type.label}</span>
          </div>
          <p className="text-[10px] truncate font-medium" style={{ color: '#94A3B8' }}>{summary}</p>
        </div>

        {/* Right: delete on hover, else validation dot */}
        <div className="flex-shrink-0 w-5 flex items-center justify-center">
          {!isTrigger && hovered ? (
            <button
              onClick={e => { e.stopPropagation(); onDelete(step.id); }}
              className="p-0.5 rounded-md transition-colors"
              style={{ color: '#EF4444', background: '#FEF2F2' }}>
              <X size={11} />
            </button>
          ) : (
            configured
              ? <CheckCircle2 size={12} style={{ color: '#10B981' }} />
              : <AlertCircle size={12} style={{ color: '#F59E0B' }} />
          )}
        </div>
      </div>

      {/* Connector line */}
      {index < totalSteps - 1 && (
        <div className="flex" style={{ paddingLeft: 38 }}>
          <div style={{ width: 1, height: 10, background: '#E2E8F0' }} />
        </div>
      )}
    </div>
  );
}

// ── Add step picker ───────────────────────────────────────────────────────────
function AddStepPicker({ onAdd, onClose }) {
  const [search, setSearch] = useState('');
  const filtered = ACTION_TYPES.filter(t =>
    t.label.toLowerCase().includes(search.toLowerCase()) ||
    t.desc.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }}
      className="rounded-2xl overflow-hidden"
      style={{ background: '#fff', border: '1.5px solid rgba(91,95,255,0.14)', boxShadow: '0 16px 48px rgba(91,95,255,0.14)' }}>
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
        <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#C7D0E8' }}>Add action step</span>
        <button onClick={onClose} style={{ color: '#CBD5E1' }}><X size={14} /></button>
      </div>
      <div className="px-3 pt-2.5 pb-1">
        <input
          autoFocus
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search steps…"
          className="w-full text-xs rounded-xl px-3 py-2 outline-none"
          style={{ background: '#F8FAFF', border: '1.5px solid rgba(91,95,255,0.10)', color: '#0A0F1E' }}
        />
      </div>
      <div className="p-3 grid grid-cols-2 gap-2 max-h-72 overflow-y-auto">
        {filtered.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => onAdd(t.id)}
              className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl text-left transition-all"
              style={{ background: '#F8FAFF', border: '1px solid rgba(0,0,0,0.05)' }}
              onMouseEnter={e => { e.currentTarget.style.background = `${t.color}0D`; e.currentTarget.style.borderColor = `${t.color}30`; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#F8FAFF'; e.currentTarget.style.borderColor = 'rgba(0,0,0,0.05)'; }}>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: `${t.color}18` }}>
                <Icon size={13} style={{ color: t.color }} />
              </div>
              <div>
                <p className="text-xs font-semibold" style={{ color: '#0A0F1E' }}>{t.label}</p>
                <p className="text-[10px] font-medium mt-0.5" style={{ color: '#94A3B8' }}>{t.desc}</p>
              </div>
            </button>
          );
        })}
      </div>
    </motion.div>
  );
}

// ── Two-panel workflow editor ─────────────────────────────────────────────────
function WorkflowEditor({ workflow, onSave, onCancel }) {
  const [name, setName] = useState(workflow?.name || '');
  const [editingName, setEditingName] = useState(!workflow?.name);
  const [steps, setSteps] = useState(workflow?.steps || [{ id: uid(), type: 'schedule', config: {} }]);
  const [selectedId, setSelectedId] = useState(workflow?.steps?.[0]?.id || null);
  const [showPicker, setShowPicker] = useState(false);
  const [testState, setTestState] = useState(null); // null | 'running' | 'done'

  const [dragId, setDragId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);

  const selectedStep = steps.find(s => s.id === selectedId);
  const selectedType = selectedStep ? typeById(selectedStep.type) : null;

  function updateStep(updated) {
    setSteps(prev => prev.map(s => s.id === updated.id ? updated : s));
  }
  function deleteStep(id) {
    const remaining = steps.filter(s => s.id !== id);
    setSteps(remaining);
    if (selectedId === id) setSelectedId(remaining[0]?.id || null);
  }
  function addStep(typeId) {
    const newStep = { id: uid(), type: typeId, config: {} };
    setSteps(prev => [...prev, newStep]);
    setSelectedId(newStep.id);
    setShowPicker(false);
  }
  function handleStepDrop(targetId) {
    if (!dragId || dragId === targetId) { setDragId(null); setDragOverId(null); return; }
    // Keep trigger locked at index 0
    setSteps(prev => {
      const trigger = prev[0];
      const rest = prev.slice(1);
      const fromIdx = rest.findIndex(s => s.id === dragId);
      const toIdx = rest.findIndex(s => s.id === targetId);
      if (fromIdx === -1) return prev; // dragging trigger — ignore
      if (toIdx === -1) return prev;
      const reordered = [...rest];
      const [moved] = reordered.splice(fromIdx, 1);
      reordered.splice(toIdx, 0, moved);
      return [trigger, ...reordered];
    });
    setDragId(null); setDragOverId(null);
  }

  function handleTest() {
    setTestState('running');
    setTimeout(() => setTestState('done'), 2200);
  }

  const configuredCount = steps.filter(isStepConfigured).length;
  const isValid = name.trim() && steps.length >= 1;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)', background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(12px)' }}>
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-1.5 rounded-lg transition-colors flex items-center gap-1 text-xs font-medium"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.background = '#F1F5F9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
            <ChevronLeft size={15} /> Back
          </button>
          <div style={{ width: 1, height: 16, background: '#E2E8F0' }} />
          {editingName ? (
            <input autoFocus value={name} onChange={e => setName(e.target.value)}
              onBlur={() => { if (name.trim()) setEditingName(false); }}
              onKeyDown={e => { if (e.key === 'Enter' && name.trim()) setEditingName(false); }}
              placeholder="Workflow name…"
              className="text-base font-bold outline-none bg-transparent"
              style={{ color: '#0A0F1E', borderBottom: '2px solid #5B5FFF', minWidth: 200 }} />
          ) : (
            <button onClick={() => setEditingName(true)} className="flex items-center gap-2 group">
              <span className="text-base font-bold" style={{ color: '#0A0F1E' }}>{name}</span>
              <Pencil size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: '#94A3B8' }} />
            </button>
          )}
          {/* Step progress */}
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: '#F1F5F9', color: '#64748B' }}>
            {configuredCount}/{steps.length} configured
          </span>
        </div>
        <div className="flex items-center gap-2">
          {/* Test button */}
          <button onClick={handleTest} disabled={testState === 'running'}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{ background: '#F1F5F9', color: '#64748B' }}>
            {testState === 'running'
              ? <><RefreshCw size={12} className="animate-spin" /> Testing…</>
              : testState === 'done'
              ? <><CheckCircle2 size={12} style={{ color: '#10B981' }} /> Test passed</>
              : <><Play size={12} /> Test run</>
            }
          </button>
          <button onClick={onCancel} className="px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors"
            style={{ color: '#94A3B8', background: '#F1F5F9' }}>Cancel</button>
          <button
            onClick={() => onSave({ id: workflow?.id || uid(), name: name.trim(), steps, active: workflow?.active ?? true })}
            disabled={!isValid}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all"
            style={{
              background: isValid ? 'linear-gradient(135deg,#5B5FFF,#6B63FF)' : '#E2E8F0',
              color: isValid ? '#fff' : '#94A3B8',
              boxShadow: isValid ? '0 4px 14px rgba(91,95,255,0.30)' : 'none',
            }}>
            <Check size={13} /> Save workflow
          </button>
        </div>
      </div>

      {/* Two-panel body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left panel — step list */}
        <div className="w-72 flex-shrink-0 flex flex-col overflow-hidden"
          style={{ borderRight: '1px solid rgba(0,0,0,0.07)', background: 'rgba(248,250,255,0.8)' }}>
          <div className="px-4 pt-4 pb-2">
            <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: '#C7D0E8' }}>Steps</p>
          </div>
          <div className="flex-1 overflow-y-auto px-3 pb-3">
            {steps.map((step, i) => (
              <StepRow
                key={step.id}
                step={step}
                index={i}
                isSelected={selectedId === step.id}
                isTrigger={i === 0}
                isDragOver={dragOverId === step.id}
                onSelect={setSelectedId}
                onDelete={deleteStep}
                totalSteps={steps.length}
                onDragStart={id => setDragId(id)}
                onDragOver={id => { if (id !== dragId) setDragOverId(id); }}
                onDrop={handleStepDrop}
              />
            ))}

            {/* Add step */}
            <div className="mt-2">
              {showPicker
                ? <AddStepPicker onAdd={addStep} onClose={() => setShowPicker(false)} />
                : (
                  <button onClick={() => setShowPicker(true)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all"
                    style={{ background: 'transparent', color: '#5B5FFF', border: '1.5px dashed rgba(91,95,255,0.25)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.05)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <Plus size={13} /> Add step
                  </button>
                )
              }
            </div>
          </div>
        </div>

        {/* Right panel — config inspector */}
        <div className="flex-1 overflow-y-auto" style={{ background: 'rgba(248,250,255,0.5)' }}>
          <AnimatePresence mode="wait">
            {selectedStep && selectedType ? (
              <motion.div
                key={selectedStep.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -6 }}
                transition={{ duration: 0.18 }}
                className="h-full flex flex-col">

                {/* Colored top accent bar */}
                <div className="h-1 flex-shrink-0" style={{ background: `linear-gradient(90deg, ${selectedType.color}, ${selectedType.color}88)` }} />

                {/* Step identity header */}
                <div className="px-7 pt-6 pb-5 flex-shrink-0"
                  style={{ borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${selectedType.color}20, ${selectedType.color}10)`,
                          border: `1.5px solid ${selectedType.color}25`,
                        }}>
                        <selectedType.icon size={20} style={{ color: selectedType.color }} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          {steps.indexOf(selectedStep) === 0 ? (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{ background: `${selectedType.color}18`, color: selectedType.color }}>
                              Trigger
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                              style={{ background: 'rgba(91,95,255,0.08)', color: '#5B5FFF' }}>
                              Step {steps.indexOf(selectedStep) + 1}
                            </span>
                          )}
                        </div>
                        <h2 className="text-lg font-bold" style={{ color: '#0A0F1E', letterSpacing: '-0.01em' }}>
                          {selectedType.label}
                        </h2>
                        <p className="text-xs font-medium mt-0.5" style={{ color: '#94A3B8' }}>
                          {selectedType.desc}
                        </p>
                      </div>
                    </div>
                    {steps.indexOf(selectedStep) > 0 && (
                      <button onClick={() => deleteStep(selectedStep.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex-shrink-0 mt-1"
                        style={{ color: '#94A3B8', background: 'transparent' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = '#94A3B8'; e.currentTarget.style.background = 'transparent'; }}>
                        <Trash2 size={12} /> Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Fields */}
                <div className="flex-1 overflow-y-auto px-7 py-5">
                  <StepConfigForm step={selectedStep} onChange={updateStep} accentColor={selectedType.color} />

                  {/* Data output tokens */}
                  {isStepConfigured(selectedStep) && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                      className="mt-6 rounded-2xl p-4"
                      style={{
                        background: 'linear-gradient(135deg, rgba(91,95,255,0.04), rgba(99,102,241,0.02))',
                        border: '1.5px solid rgba(91,95,255,0.10)',
                      }}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="w-4 h-4 rounded-md flex items-center justify-center"
                          style={{ background: 'rgba(91,95,255,0.12)' }}>
                          <Zap size={9} style={{ color: '#5B5FFF' }} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#5B5FFF' }}>
                          Pass to next steps
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {[
                          '{{prev.output}}',
                          '{{prev.status}}',
                          selectedStep.config?.output_var ? `{{${selectedStep.config.output_var}.output}}` : null,
                        ].filter(Boolean).map(token => (
                          <span key={token}
                            className="text-[10px] font-mono px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                            style={{
                              background: 'rgba(91,95,255,0.08)',
                              color: '#5B5FFF',
                              border: '1px solid rgba(91,95,255,0.15)',
                            }}
                            onMouseEnter={e => e.currentTarget.style.background = 'rgba(91,95,255,0.14)'}
                            onMouseLeave={e => e.currentTarget.style.background = 'rgba(91,95,255,0.08)'}>
                            {token}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center h-full gap-3 px-8 text-center">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
                  style={{ background: 'rgba(91,95,255,0.06)', border: '1.5px dashed rgba(91,95,255,0.15)' }}>
                  <Eye size={20} style={{ color: '#C7D0E8' }} strokeWidth={1.5} />
                </div>
                <p className="text-sm font-semibold" style={{ color: '#CBD5E1' }}>Select a step to configure</p>
                <p className="text-xs font-medium" style={{ color: '#E2E8F0' }}>Click any step on the left to edit its settings</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// ── Workflow list card ────────────────────────────────────────────────────────
const MOCK_RUNS = {
  'wf-001': { lastRun: '2 hours ago', runs: 14, success: 13, status: 'ok' },
  'wf-002': { lastRun: '18 min ago', runs: 7, success: 7, status: 'ok' },
};

function WorkflowCard({ wf, onEdit, onToggle, onDelete }) {
  const trigger = wf.steps?.[0];
  const triggerType = typeById(trigger?.type);
  const TriggerIcon = triggerType?.icon || Zap;
  const actionCount = (wf.steps?.length || 1) - 1;
  const run = MOCK_RUNS[wf.id];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, scale: 0.98 }}
      className="rounded-2xl transition-shadow mb-3 cursor-pointer group"
      onClick={() => onEdit(wf)}
      style={{
        background: '#fff',
        border: wf.active ? `1px solid rgba(91,95,255,0.12)` : '1px solid rgba(0,0,0,0.07)',
        boxShadow: '0 2px 12px rgba(91,95,255,0.04)',
      }}
      onMouseEnter={e => e.currentTarget.style.boxShadow = '0 6px 24px rgba(91,95,255,0.12)'}
      onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(91,95,255,0.04)'}>

      {/* Top row */}
      <div className="flex items-center gap-3.5 px-5 pt-4 pb-3">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: `${triggerType?.color || '#5B5FFF'}12` }}>
          <TriggerIcon size={18} style={{ color: triggerType?.color || '#5B5FFF' }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="text-sm font-bold truncate" style={{ color: '#0A0F1E' }}>{wf.name}</p>
            {!wf.active && (
              <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded"
                style={{ background: '#F1F5F9', color: '#94A3B8' }}>Paused</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>{triggerType?.label}</span>
            <span style={{ color: '#E2E8F0', fontSize: 10 }}>·</span>
            <span className="text-[10px] font-semibold" style={{ color: '#94A3B8' }}>{actionCount} action{actionCount !== 1 ? 's' : ''}</span>
          </div>
        </div>

        {/* Step icons preview */}
        <div className="hidden sm:flex items-center gap-1.5 mr-2">
          {wf.steps?.slice(0, 5).map((step, i) => {
            const t = typeById(step.type);
            const Icon = t?.icon;
            return Icon ? (
              <div key={i} className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${t.color}12`, border: `1px solid ${t.color}20` }}>
                <Icon size={12} style={{ color: t.color }} />
              </div>
            ) : null;
          })}
          {(wf.steps?.length || 0) > 5 && (
            <span className="text-[9px] font-bold" style={{ color: '#94A3B8' }}>+{wf.steps.length - 5}</span>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
          <button onClick={() => onToggle(wf.id)}>
            {wf.active
              ? <ToggleRight size={24} style={{ color: '#5B5FFF' }} />
              : <ToggleLeft size={24} style={{ color: '#CBD5E1' }} />}
          </button>
          <button onClick={() => onDelete(wf.id)}
            className="p-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            style={{ color: '#CBD5E1' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = '#FEF2F2'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#CBD5E1'; e.currentTarget.style.background = 'transparent'; }}>
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Stats row */}
      {run && (
        <div className="flex items-center gap-4 px-5 py-2.5"
          style={{ borderTop: '1px solid rgba(0,0,0,0.04)', background: 'rgba(248,250,255,0.6)' }}>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: run.status === 'ok' ? '#10B981' : '#EF4444' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#64748B' }}>Last run {run.lastRun}</span>
          </div>
          <span style={{ color: '#E2E8F0', fontSize: 10 }}>·</span>
          <div className="flex items-center gap-1">
            <Activity size={10} style={{ color: '#94A3B8' }} />
            <span className="text-[10px] font-semibold" style={{ color: '#64748B' }}>{run.runs} runs</span>
          </div>
          <span style={{ color: '#E2E8F0', fontSize: 10 }}>·</span>
          <span className="text-[10px] font-semibold" style={{ color: '#10B981' }}>
            {Math.round((run.success / run.runs) * 100)}% success
          </span>
        </div>
      )}
    </motion.div>
  );
}

// ── Integration registry ──────────────────────────────────────────────────────
const INTEGRATIONS = {
  gmail:     { id: 'gmail',     label: 'Gmail',       logo: '📧', color: '#EA4335', desc: 'Send and receive emails from your connected inbox' },
  hubspot:   { id: 'hubspot',   label: 'HubSpot',     logo: '🟠', color: '#FF7A59', desc: 'Read CRM contacts, deals and events' },
  salesforce:{ id: 'salesforce',label: 'Salesforce',  logo: '☁️', color: '#00A1E0', desc: 'Access your Salesforce CRM data' },
  pipedrive: { id: 'pipedrive', label: 'Pipedrive',   logo: '🟢', color: '#17A76C', desc: 'Read and update Pipedrive deals' },
  attio:     { id: 'attio',     label: 'Attio',       logo: '🔷', color: '#6B63FF', desc: 'Connect your Attio workspace' },
  slack:     { id: 'slack',     label: 'Slack',       logo: '💬', color: '#4A154B', desc: 'Post messages to channels and DMs' },
  stripe:    { id: 'stripe',    label: 'Stripe',      logo: '💳', color: '#635BFF', desc: 'Receive payment and subscription events' },
  typeform:  { id: 'typeform',  label: 'Typeform',    logo: '📝', color: '#262627', desc: 'Trigger on form submissions' },
  tally:     { id: 'tally',     label: 'Tally',       logo: '📋', color: '#1F2937', desc: 'Trigger on Tally form submissions' },
  notion:    { id: 'notion',    label: 'Notion',      logo: '⬜', color: '#000',    desc: 'Read and update Notion databases' },
};

// Which step types require which integrations
const STEP_INTEGRATIONS = {
  email:        ['gmail'],
  send_email:   ['gmail'],
  new_record:   [], // dynamically determined by config.source
  slack_message:['slack'],
  stripe_event: ['stripe'],
  form_submit:  [], // dynamically by config.source
  http_request: [], // no integration needed
  webhook:      [], // no integration needed
  schedule:     [], // no integration needed
  agent_task:   [], // no integration needed
  condition:    [], // no integration needed
  create_task:  [], // no integration needed
  wait:         [], // no integration needed
  notify:       [], // no integration needed
  loop:         [], // no integration needed
};

const CRM_SOURCE_MAP = { HubSpot: 'hubspot', Salesforce: 'salesforce', Pipedrive: 'pipedrive', Attio: 'attio', Notion: 'notion' };
const FORM_SOURCE_MAP = { Typeform: 'typeform', Tally: 'tally' };

function getRequiredIntegrations(steps) {
  const needed = new Set();
  for (const step of steps) {
    const base = STEP_INTEGRATIONS[step.type] || [];
    base.forEach(i => needed.add(i));
    if (step.type === 'new_record' && step.config?.source) {
      const key = CRM_SOURCE_MAP[step.config.source];
      if (key) needed.add(key);
    }
    if (step.type === 'form_submit' && step.config?.source) {
      const key = FORM_SOURCE_MAP[step.config.source];
      if (key) needed.add(key);
    }
  }
  return [...needed].map(id => INTEGRATIONS[id]).filter(Boolean);
}

// ── Connect view ──────────────────────────────────────────────────────────────
function ConnectView({ required, onContinue, onBack, workflowName }) {
  const [connected, setConnected] = useState({});
  const [connecting, setConnecting] = useState({});

  function handleConnect(id) {
    setConnecting(prev => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setConnecting(prev => ({ ...prev, [id]: false }));
      setConnected(prev => ({ ...prev, [id]: true }));
    }, 1600);
  }

  const connectedCount = required.filter(i => connected[i.id]).length;
  const allConnected = connectedCount === required.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top nav */}
      <div className="flex items-center gap-3 px-8 py-4 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(91,95,255,0.07)' }}>
        <button onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-semibold transition-colors"
          style={{ color: '#94A3B8' }}
          onMouseEnter={e => e.currentTarget.style.color = '#5B5FFF'}
          onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
          <ChevronLeft size={14} /> Back
        </button>
        <div style={{ width: 1, height: 14, background: '#E2E8F0' }} />
        <span className="text-xs font-semibold" style={{ color: '#94A3B8' }}>
          New workflow
        </span>
        <span style={{ color: '#E2E8F0' }}>›</span>
        <span className="text-xs font-bold" style={{ color: '#5B5FFF' }}>Connect apps</span>
        <span style={{ color: '#E2E8F0' }}>›</span>
        <span className="text-xs font-semibold" style={{ color: '#CBD5E1' }}>Build</span>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md">

          {/* Icon + heading */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 20 }}
              className="relative w-16 h-16 mx-auto mb-5">
              {/* Outer glow ring */}
              <div className="absolute inset-0 rounded-2xl"
                style={{ background: 'linear-gradient(135deg,#5B5FFF,#6B63FF)', opacity: 0.15, transform: 'scale(1.18)', borderRadius: 20 }} />
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative"
                style={{ background: 'linear-gradient(135deg,#5B5FFF,#6B63FF)', boxShadow: '0 8px 32px rgba(91,95,255,0.35)' }}>
                <Zap size={26} color="#fff" strokeWidth={2} />
              </div>
            </motion.div>

            <h2 className="heading-serif text-2xl font-bold mb-2" style={{ color: '#0A0F1E', letterSpacing: '-0.02em' }}>
              One last step
            </h2>
            <p className="text-sm font-medium leading-relaxed" style={{ color: '#64748B' }}>
              <span className="font-bold" style={{ color: '#5B5FFF' }}>"{workflowName}"</span> needs access to{' '}
              {required.length === 1 ? 'this app' : `these ${required.length} apps`} to run
            </p>
          </div>

          {/* Progress bar */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#C7D0E8' }}>
                Connections
              </span>
              <span className="text-[10px] font-bold" style={{ color: connectedCount === required.length ? '#10B981' : '#94A3B8' }}>
                {connectedCount}/{required.length} connected
              </span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#F1F5F9' }}>
              <motion.div
                animate={{ width: `${(connectedCount / required.length) * 100}%` }}
                transition={{ type: 'spring', stiffness: 200, damping: 30 }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg,#5B5FFF,#6B63FF)' }}
              />
            </div>
          </div>

          {/* Integration cards */}
          <div className="space-y-2.5 mb-7">
            {required.map((integration, idx) => {
              const isConnected = connected[integration.id];
              const isConnecting = connecting[integration.id];
              return (
                <motion.div
                  key={integration.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + idx * 0.07 }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all"
                  style={{
                    background: isConnected ? 'rgba(16,185,129,0.04)' : 'rgba(255,255,255,0.95)',
                    border: isConnected
                      ? '1.5px solid rgba(16,185,129,0.25)'
                      : '1.5px solid rgba(91,95,255,0.10)',
                    boxShadow: isConnected
                      ? '0 2px 16px rgba(16,185,129,0.08)'
                      : '0 2px 12px rgba(91,95,255,0.06)',
                  }}>

                  {/* Logo */}
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0 relative"
                    style={{
                      background: isConnected ? 'rgba(16,185,129,0.08)' : `${integration.color}10`,
                      border: `1.5px solid ${isConnected ? 'rgba(16,185,129,0.2)' : integration.color + '20'}`,
                    }}>
                    {integration.logo}
                    {isConnected && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                        style={{ background: '#10B981', border: '2px solid #fff' }}>
                        <Check size={8} color="#fff" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-sm font-bold" style={{ color: isConnected ? '#0A0F1E' : '#0A0F1E' }}>
                        {integration.label}
                      </p>
                      {isConnected && (
                        <span className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-full"
                          style={{ background: 'rgba(16,185,129,0.12)', color: '#10B981' }}>
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] font-medium" style={{ color: '#94A3B8' }}>
                      {integration.desc}
                    </p>
                  </div>

                  {/* Action */}
                  {isConnected ? (
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                    </div>
                  ) : (
                    <button
                      onClick={() => handleConnect(integration.id)}
                      disabled={isConnecting}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold flex-shrink-0 transition-all"
                      style={{
                        background: isConnecting
                          ? '#F8FAFF'
                          : 'linear-gradient(135deg,#5B5FFF,#6B63FF)',
                        color: isConnecting ? '#94A3B8' : '#fff',
                        border: isConnecting ? '1.5px solid rgba(91,95,255,0.12)' : 'none',
                        boxShadow: isConnecting ? 'none' : '0 4px 14px rgba(91,95,255,0.30)',
                        minWidth: 90,
                        justifyContent: 'center',
                      }}>
                      {isConnecting
                        ? <><RefreshCw size={11} className="animate-spin" style={{ marginRight: 4 }} />Connecting</>
                        : 'Connect →'}
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="space-y-2.5">
            <motion.button
              onClick={onContinue}
              disabled={!allConnected}
              whileHover={allConnected ? { scale: 1.01 } : {}}
              whileTap={allConnected ? { scale: 0.98 } : {}}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl text-sm font-bold transition-all"
              style={{
                background: allConnected
                  ? 'linear-gradient(135deg,#5B5FFF,#6B63FF)'
                  : 'rgba(0,0,0,0.04)',
                color: allConnected ? '#fff' : '#CBD5E1',
                boxShadow: allConnected ? '0 6px 20px rgba(91,95,255,0.35)' : 'none',
                cursor: allConnected ? 'pointer' : 'not-allowed',
              }}>
              <Sparkles size={15} />
              Build workflow
            </motion.button>

            <button
              onClick={onContinue}
              className="w-full py-2.5 rounded-2xl text-xs font-semibold transition-colors"
              style={{ color: '#94A3B8' }}
              onMouseEnter={e => e.currentTarget.style.color = '#64748B'}
              onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
              Skip connections for now — I'll set them up later
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// ── Quick chips ───────────────────────────────────────────────────────────────
const CHIPS = [
  { emoji: '📧', text: 'Manage my email inbox automatically' },
  { emoji: '🎯', text: 'Follow up with new CRM leads' },
  { emoji: '☀️', text: 'Send me a daily task digest at 9am' },
  { emoji: '📊', text: 'Send a weekly business pulse report' },
  { emoji: '🎧', text: 'Auto-resolve support tickets' },
  { emoji: '💳', text: 'Win back churned Stripe customers' },
];

// ── Starter workflows ─────────────────────────────────────────────────────────
const STARTER_WORKFLOWS = [
  {
    id: 'wf-001', name: 'Daily Task Digest', active: true,
    steps: [
      { id: 's1', type: 'schedule',   config: { cron_label: 'Every day at 9am', timezone: 'UTC' } },
      { id: 's2', type: 'agent_task', config: { agent: 'Freemi (CEO)', instruction: "Summarize yesterday's completed tasks and today's open priorities", output_var: 'digest' } },
      { id: 's3', type: 'send_email', config: { to: '{{user.email}}', subject: 'Your Daily Task Digest', body: '{{digest.output}}' } },
    ],
  },
  {
    id: 'wf-002', name: 'New Lead Follow-Up', active: true,
    steps: [
      { id: 's1', type: 'new_record', config: { source: 'HubSpot', event: 'New contact' } },
      { id: 's2', type: 'agent_task', config: { agent: 'Aria (Sales)', instruction: 'Research this lead and write a personalised intro email', output_var: 'outreach' } },
      { id: 's3', type: 'condition',  config: { field: '{{outreach.confidence}}', operator: 'greater than', value: '70', on_false: 'Stop workflow' } },
      { id: 's4', type: 'wait',       config: { duration: '5 minutes' } },
      { id: 's5', type: 'send_email', config: { to: '{{trigger.email}}', subject: 'Quick question', body: '{{outreach.output}}' } },
    ],
  },
];

// ── Main view ─────────────────────────────────────────────────────────────────
export default function AutomationsView() {
  const { agents: companyAgents } = useCompany();
  const [workflows, setWorkflows] = useState(STARTER_WORKFLOWS);
  const [view, setView] = useState('list'); // 'create' | 'connect' | 'building' | 'editor' | 'list'
  const [desc, setDesc] = useState('');
  const [focused, setFocused] = useState(false);
  const [buildingLabel, setBuildingLabel] = useState('');
  const [pendingWorkflow, setPendingWorkflow] = useState(null);
  const [pendingRequired, setPendingRequired] = useState([]);
  const [editingWorkflow, setEditingWorkflow] = useState(null);
  const textareaRef = useRef();

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 160) + 'px';
  }, [desc]);

  function handleCreate() {
    const text = desc.trim();
    if (!text) return;
    const name = inferName(text);
    const steps = inferSteps(text);
    const wf = { id: uid(), name, steps, active: true };
    const required = getRequiredIntegrations(steps);
    setPendingWorkflow(wf);
    setBuildingLabel(name);
    setDesc('');
    if (required.length > 0) {
      setPendingRequired(required);
      setView('connect');
    } else {
      setView('building');
    }
  }

  function handleConnectContinue() {
    setPendingRequired([]);
    setView('building');
  }

  function handleBuildDone() {
    setView('editor');
    setEditingWorkflow(pendingWorkflow);
  }

  function handleSave(wf) {
    setWorkflows(prev => {
      const exists = prev.find(w => w.id === wf.id);
      return exists ? prev.map(w => w.id === wf.id ? wf : w) : [wf, ...prev];
    });
    setEditingWorkflow(null);
    setPendingWorkflow(null);
    setView('list');
  }

  function handleCancelEditor() {
    setEditingWorkflow(null);
    setPendingWorkflow(null);
    setView(workflows.length > 0 ? 'list' : 'create');
  }

  function handleToggle(id) { setWorkflows(prev => prev.map(w => w.id === id ? { ...w, active: !w.active } : w)); }
  function handleDelete(id) { setWorkflows(prev => prev.filter(w => w.id !== id)); }

  const bg = { background: 'linear-gradient(160deg,#EEF2FF 0%,#F0F7FF 45%,#FAFCFF 100%)' };

  if (view === 'connect') {
    return (
      <div className="h-full flex flex-col" style={bg}>
        <ConnectView
          required={pendingRequired}
          workflowName={pendingWorkflow?.name}
          onContinue={handleConnectContinue}
          onBack={() => { setPendingWorkflow(null); setPendingRequired([]); setView('create'); }}
        />
      </div>
    );
  }

  if (view === 'building') {
    return (
      <div className="h-full flex flex-col" style={bg}>
        <BuildingState label={buildingLabel} onDone={handleBuildDone} />
      </div>
    );
  }

  if (view === 'editor') {
    return (
      <div className="h-full flex flex-col overflow-hidden" style={bg}>
        <WorkflowEditor workflow={editingWorkflow} onSave={handleSave} onCancel={handleCancelEditor} />
      </div>
    );
  }

  if (view === 'list') {
    const activeCount = workflows.filter(w => w.active).length;
    const totalRuns = Object.values(MOCK_RUNS).reduce((s, r) => s + r.runs, 0);
    return (
      <div className="h-full flex flex-col overflow-hidden" style={bg}>
        <div className="flex items-center justify-between px-8 py-5 flex-shrink-0">
          <div>
            <h1 className="heading-serif text-2xl font-bold" style={{ color: '#0A0F1E' }}>Workflows</h1>
            <p className="text-sm mt-0.5 font-medium" style={{ color: '#64748B' }}>
              {workflows.length} workflow{workflows.length !== 1 ? 's' : ''} · {activeCount} active · {totalRuns} total runs
            </p>
          </div>
          <button onClick={() => setView('create')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{ background: 'linear-gradient(135deg,#5B5FFF,#6B63FF)', color: '#fff', boxShadow: '0 4px 14px rgba(91,95,255,0.30)' }}>
            <Plus size={15} /> New Workflow
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-8 pb-8">
          <AnimatePresence>
            {workflows.map(wf => (
              <WorkflowCard key={wf.id} wf={wf}
                onEdit={wf => { setEditingWorkflow(wf); setView('editor'); }}
                onToggle={handleToggle} onDelete={handleDelete} />
            ))}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // Create view
  return (
    <div className="h-full flex flex-col overflow-hidden" style={bg}>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-8 overflow-y-auto">
        <motion.div initial={{ opacity: 0, scale: 0.8, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }} className="mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#5B5FFF,#2563EB)', boxShadow: '0 8px 32px rgba(91,95,255,0.35)' }}>
            <Sparkles size={28} color="#fff" strokeWidth={1.8} />
          </div>
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.08 }}
          className="heading-serif font-bold tracking-tight text-center mb-2"
          style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: '#0A0F1E', letterSpacing: '-0.02em' }}>
          Describe your workflow
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4, delay: 0.15 }}
          className="text-sm mb-8 text-center font-medium" style={{ color: '#94A3B8' }}>
          Write what it should do — Freemi will build the steps for you to review
        </motion.p>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.18 }}
          className="w-full max-w-2xl rounded-2xl mb-5"
          style={{
            background: 'rgba(255,255,255,0.97)',
            border: focused ? '1.5px solid rgba(91,95,255,0.28)' : '1.5px solid rgba(91,95,255,0.09)',
            boxShadow: focused ? '0 0 0 4px rgba(91,95,255,0.07),0 8px 32px rgba(91,95,255,0.10)' : '0 4px 24px rgba(91,95,255,0.06)',
            transition: 'border-color 200ms,box-shadow 200ms',
          }}>
          <div className="px-5 pt-5 pb-2">
            <textarea ref={textareaRef} value={desc} onChange={e => setDesc(e.target.value)}
              onKeyDown={e => { if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleCreate(); }}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              placeholder="e.g. Every morning, summarise open tasks and email me a digest…"
              className="w-full text-sm outline-none resize-none bg-transparent leading-relaxed font-medium"
              style={{ color: '#0A0F1E', caretColor: '#5B5FFF', minHeight: 72 }} />
          </div>
          <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: '1px solid rgba(0,0,0,0.04)' }}>
            <span className="text-[11px] font-medium" style={{ color: '#CBD5E1' }}>⌘↵ to submit</span>
            <button onClick={handleCreate} disabled={!desc.trim()}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all disabled:opacity-40"
              style={{
                background: desc.trim() ? 'linear-gradient(135deg,#5B5FFF,#2563EB)' : '#E2E8F0',
                boxShadow: desc.trim() ? '0 4px 14px rgba(91,95,255,0.40)' : 'none',
                cursor: desc.trim() ? 'pointer' : 'not-allowed',
              }}>
              <ArrowUp size={14} style={{ color: desc.trim() ? '#fff' : '#94A3B8' }} />
            </button>
          </div>
        </motion.div>

        {/* Chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="flex flex-wrap justify-center gap-2 max-w-2xl">
          {CHIPS.map(chip => (
            <button key={chip.text}
              onClick={() => setDesc(chip.text)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all"
              style={{ background: 'rgba(255,255,255,0.9)', border: '1px solid rgba(91,95,255,0.12)', color: '#64748B' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(91,95,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.25)'; e.currentTarget.style.color = '#5B5FFF'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.9)'; e.currentTarget.style.borderColor = 'rgba(91,95,255,0.12)'; e.currentTarget.style.color = '#64748B'; }}>
              <span>{chip.emoji}</span> {chip.text}
            </button>
          ))}
        </motion.div>

        {workflows.length > 0 && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}
            onClick={() => setView('list')}
            className="mt-6 text-xs font-semibold transition-colors"
            style={{ color: '#94A3B8' }}
            onMouseEnter={e => e.currentTarget.style.color = '#5B5FFF'}
            onMouseLeave={e => e.currentTarget.style.color = '#94A3B8'}>
            View {workflows.length} existing workflow{workflows.length !== 1 ? 's' : ''} →
          </motion.button>
        )}
      </div>
    </div>
  );
}
