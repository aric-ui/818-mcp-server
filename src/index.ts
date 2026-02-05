import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.substring(7);
    if (process.env.MCP_AUTH_TOKEN && token !== process.env.MCP_AUTH_TOKEN) {
          return res.status(401).json({ error: 'Unauthorized' });
    }
    next();
};

app.get('/.well-known/mcp.json', (req, res) => {
    res.json({
          version: '1.0',
          name: '818 Shutters & Shades CRM',
          description: 'MCP server for CRM',
          tools: [
            { name: 'search_leads', description: 'Search leads', parameters: { type: 'object', properties: { status: { type: 'string' }, limit: { type: 'number' } } } },
            { name: 'create_lead', description: 'Create lead', parameters: { type: 'object', required: ['name', 'email'], properties: { name: { type: 'string' }, email: { type: 'string' }, phone: { type: 'string' } } } },
            { name: 'get_lead', description: 'Get lead', parameters: { type: 'object', required: ['lead_id'], properties: { lead_id: { type: 'string' } } } },
            { name: 'get_projects', description: 'Get projects', parameters: { type: 'object', properties: { status: { type: 'string' } } } },
            { name: 'create_project', description: 'Create project', parameters: { type: 'object', required: ['lead_id'], properties: { lead_id: { type: 'string' }, customer_name: { type: 'string' } } } },
            { name: 'get_todays_appointments', description: 'Get appointments', parameters: { type: 'object', properties: {} } },
      { name: 'get_team_members', description: 'Get team members with contact info and roles', parameters: { type: 'object', properties: {} } }
                ]
    });
});

app.post('/tools/search_leads', authMiddleware, async (req, res) => {
    try {
          const { status, limit = 20 } = req.body;
          let query = supabase.from('leads').select('*').order('created_at', { ascending: false }).limit(limit);
          if (status) query = query.eq('status', status);
          const { data, error } = await query;
          if (error) throw error;
          res.json({ success: true, leads: data });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/tools/create_lead', authMiddleware, async (req, res) => {
    try {
          const { data, error } = await supabase.from('leads').insert([{ ...req.body, status: 'new', source: 'mcp' }]).select().single();
          if (error) throw error;
          res.json({ success: true, lead: data });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
});

app.post('/tools/get_lead', authMiddleware, async (req, res) => {
    try {
          const { data, error } = await supabase.from('leads').select('*').eq('id', req.body.lead_id).single();
          if (error) throw error;
          res.json({ success: true, lead: data });
    } catch (e) { res.status(404).json({ success: false, error: e.message }); }
});

app.post('/tools/get_projects', authMiddleware, async (req, res) => {
    try {
          let query = supabase.from('projects').select('*').order('created_at', { ascending: false }).limit(20);
          if (req.body.status) query = query.eq('status', req.body.status);
          const { data, error } = await query;
          if (error) throw error;
          res.json({ success: true, projects: data });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/tools/create_project', authMiddleware, async (req, res) => {
    try {
          const { data, error } = await supabase.from('projects').insert([{ ...req.body, status: 'consultation' }]).select().single();
          if (error) throw error;
          res.json({ success: true, project: data });
    } catch (e) { res.status(400).json({ success: false, error: e.message }); }
});

app.post('/tools/get_todays_appointments', authMiddleware, async (req, res) => {
    try {
          const today = new Date().toISOString().split('T')[0];
          const { data, error } = await supabase.from('projects').select('*');
          if (error) throw error;
          res.json({ success: true, appointments: data });
    } catch (e) { res.status(500).json({ success: false, error: e.message }); }
});

app.post('/tools/get_team_members', authMiddleware, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*')
      .order('name');

    if (error) throw error;
    res.json({ success: true, team_members: data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
    console.log('818 MCP Server running on port ' + PORT);
});
