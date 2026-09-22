/* ChitMate Supabase integration layer.
 * Keep the anon key in a deployment secret or config injection step.
 * Never put a service-role key in browser code.
 */
(function () {
  const config = window.CHITMATE_SUPABASE_CONFIG || {};
  const clientFactory = window.supabase;
  const configured = Boolean(clientFactory && config.url && config.anonKey);
  const client = configured ? clientFactory.createClient(config.url, config.anonKey) : null;

  async function requireClient() {
    if (!client) throw new Error('Supabase is not configured. Add CHITMATE_SUPABASE_CONFIG before loading the app.');
    return client;
  }

  window.ChitMateBackend = {
    configured,
    client,
    auth: {
      signIn: async (email, password) => (await requireClient()).auth.signInWithPassword({ email, password }),
      signUp: async (email, password, role) => (await requireClient()).auth.signUp({ email, password, options: { data: { role } } }),
      signOut: async () => (await requireClient()).auth.signOut(),
      currentUser: async () => (await requireClient()).auth.getUser()
    },
    profiles: {
      get: async (userId) => (await requireClient()).from('profiles').select('*').eq('user_id', userId).maybeSingle(),
      save: async (profile) => (await requireClient()).from('profiles').upsert(profile, { onConflict: 'user_id' }).select().single()
    },
    groups: {
      list: async (organizationId) => (await requireClient()).from('chit_groups').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }),
      create: async (group) => (await requireClient()).from('chit_groups').insert(group).select().single(),
      update: async (id, changes) => (await requireClient()).from('chit_groups').update(changes).eq('id', id).select().single()
    },
    members: {
      list: async (organizationId) => (await requireClient()).from('members').select('*, group_members(group_id, payout_cycle, is_winner)').eq('organization_id', organizationId).order('full_name'),
      create: async (member) => (await requireClient()).from('members').insert(member).select().single(),
      updateKyc: async (id, changes) => (await requireClient()).from('members').update(changes).eq('id', id).select().single(),
      uploadKyc: async (path, file) => (await requireClient()).storage.from('kyc-documents').upload(path, file, { upsert: true })
    },
    collections: {
      listCyclePayments: async (cycleId) => (await requireClient()).from('payments').select('*, members(full_name, phone)').eq('cycle_id', cycleId).order('paid_at', { ascending: false }),
      record: async (payment) => (await requireClient()).from('payments').insert(payment).select().single(),
      update: async (id, changes) => (await requireClient()).from('payments').update(changes).eq('id', id).select().single()
    },
    auctions: {
      list: async (groupId) => (await requireClient()).from('auctions').select('*, cycles!inner(group_id, cycle_number, due_date), members(full_name)').eq('cycles.group_id', groupId).order('scheduled_at'),
      record: async (auction) => (await requireClient()).from('auctions').insert(auction).select().single(),
      settle: async (id, result) => (await requireClient()).from('auctions').update({ ...result, status: 'settled', settled_at: new Date().toISOString() }).eq('id', id).select().single()
    },
    ledger: {
      list: async (organizationId, groupId) => { const query = (await requireClient()).from('ledger_entries').select('*').eq('organization_id', organizationId).order('created_at', { ascending: false }); return groupId ? query.eq('group_id', groupId) : query; },
      add: async (entry) => (await requireClient()).from('ledger_entries').insert(entry).select().single()
    },
    realtime: {
      subscribeToPayments: (cycleId, onChange) => client?.channel(`payments-${cycleId}`).on('postgres_changes', { event: '*', schema: 'public', table: 'payments', filter: `cycle_id=eq.${cycleId}` }, onChange).subscribe()
    }
  };
})();
