const { createElement: h, useState } = React;

const navItems = [
  ['Overview', '◈'], ['Chit groups', '◎'], ['Members', '◌'], ['Collections', '↗'],
  ['Auctions', '◇'], ['Ledger', '▤'], ['Reports', '▥'], ['Settings', '⚙']
];
const stats = [
  ['Total funds under management', '₹ 48,50,000', '↑ 12.8%', 'accent-blue'],
  ['Collections this month', '₹ 8,42,500', '↑ 6.4%', 'accent-yellow'],
  ['Active members', '128', '↑ 4.2%', 'accent-coral'],
  ['On-time payment rate', '94.6%', '↑ 2.1%', 'accent-green']
];

function Sidebar({ active, onNavigate }) {
  return h('aside', { className: 'sidebar' },
    h('div', { className: 'brand' }, h('span', { className: 'brand-mark' }, 'C'), h('span', null, 'ChitMate')),
    h('div', { className: 'workspace-switcher' }, h('span', { className: 'workspace-dot' }), h('span', null, h('small', null, 'Workspace'), h('strong', null, 'Northstar Finance')), h('span', { className: 'chevron' }, '⌄')),
    h('nav', { className: 'primary-nav', 'aria-label': 'Primary navigation' },
      h('p', { className: 'nav-label' }, 'Workspace'),
      navItems.slice(0, 5).map(([name, icon]) => h('button', { key: name, className: `nav-item ${active === name ? 'active' : ''}`, onClick: () => onNavigate(name) }, h('span', { className: 'nav-icon' }, icon), name, name === 'Chit groups' && h('span', { className: 'nav-count' }, '4'))),
      h('p', { className: 'nav-label secondary-label' }, 'Manage'),
      navItems.slice(5).map(([name, icon]) => h('button', { key: name, className: `nav-item ${active === name ? 'active' : ''}`, onClick: () => onNavigate(name) }, h('span', { className: 'nav-icon' }, icon), name))
    ),
    h('div', { className: 'sidebar-footer' }, h('div', { className: 'help-icon' }, '?'), h('div', null, h('strong', null, 'Need a hand?'), h('span', null, 'Visit the help center')), h('span', { className: 'arrow' }, '↗'))
  );
}

function StatCard({ stat }) {
  return h('article', { className: `stat-card ${stat[3]}` },
    h('div', { className: 'stat-top' }, h('span', null, stat[0]), h('span', { className: 'stat-symbol' }, '↗')),
    h('strong', null, stat[1]),
    h('div', { className: 'stat-foot' }, h('span', { className: 'positive' }, stat[2]), h('span', null, 'vs last month'))
  );
}

function Cashflow() {
  return h('section', { className: 'panel cashflow-panel' },
    h('div', { className: 'panel-heading' }, h('div', null, h('h2', null, 'Cash flow'), h('p', null, 'Inflow and outflow across all groups')), h('select', { 'aria-label': 'Cash flow period' }, h('option', null, 'Last 6 months'))),
    h('div', { className: 'chart-area' }, h('div', { className: 'chart-y' }, ['₹ 10L', '₹ 7.5L', '₹ 5L', '₹ 2.5L', '₹ 0'].map((label) => h('span', { key: label }, label))), h('div', { className: 'chart' }, h('div', { className: 'grid-line line-1' }), h('div', { className: 'grid-line line-2' }), h('div', { className: 'grid-line line-3' }), h('div', { className: 'grid-line line-4' }), h('svg', { viewBox: '0 0 720 220', preserveAspectRatio: 'none', role: 'img', 'aria-label': 'Cash flow chart' }, h('path', { className: 'area-fill', d: 'M0 180 C40 155 65 170 110 135 S175 100 225 125 S275 90 330 100 S385 130 430 84 S490 65 540 82 S600 20 650 53 S690 35 720 20 V220 H0Z' }), h('path', { className: 'line-actual', d: 'M0 180 C40 155 65 170 110 135 S175 100 225 125 S275 90 330 100 S385 130 430 84 S490 65 540 82 S600 20 650 53 S690 35 720 20' }), h('path', { className: 'line-target', d: 'M0 192 C55 175 70 150 120 158 S190 130 240 140 S315 110 360 125 S420 90 470 106 S540 65 600 77 S675 49 720 58' })), h('div', { className: 'chart-labels' }, ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'].map((month) => h('span', { key: month }, month))))),
    h('div', { className: 'chart-legend' }, h('span', null, h('i', { className: 'legend-dot actual' }), 'Collections'), h('span', null, h('i', { className: 'legend-dot target' }), 'Disbursements'), h('span', { className: 'chart-total' }, '₹ 8.42L', h('small', null, 'collected this month')))
  );
}

function Auction() {
  return h('section', { className: 'panel upcoming-panel' },
    h('div', { className: 'panel-heading' }, h('div', null, h('h2', null, 'Upcoming auction'), h('p', null, 'Next scheduled event')), h('button', { className: 'more-button' }, '•••')),
    h('div', { className: 'auction-banner' }, h('span', { className: 'auction-kicker' }, 'NEXT AUCTION'), h('strong', null, '₹ 5,00,000'), h('div', { className: 'auction-meta' }, h('span', null, 'Group Alpha · Round 06'), h('span', { className: 'auction-date' }, '18 Sep 2024'))),
    h('div', { className: 'countdown' }, h('div', null, h('strong', null, '06'), h('span', null, 'Days')), h('b', null, ':'), h('div', null, h('strong', null, '14'), h('span', null, 'Hours')), h('b', null, ':'), h('div', null, h('strong', null, '32'), h('span', null, 'Minutes'))),
    h('button', { className: 'button button-dark full-button' }, 'View auction details →')
  );
}

function Activity({ activity }) {
  return h('section', { className: 'panel activity-panel' },
    h('div', { className: 'panel-heading' }, h('div', null, h('h2', null, 'Recent activity'), h('p', null, 'Latest updates from your workspace')), h('button', { className: 'text-button' }, 'View all →')),
    h('div', { className: 'activity-list' }, activity.map((item, index) => h('div', { className: 'activity-row', key: `${item.name}-${index}` }, h('span', { className: `activity-avatar ${item.tone}` }, item.initials), h('div', null, h('strong', null, item.name), h('span', null, item.detail)), h('b', { className: item.amount === 'New' ? 'status-pill blue' : 'amount positive' }, item.amount))))
  );
}

function MemberModal({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [group, setGroup] = useState('Group Alpha');
  const submit = (event) => { event.preventDefault(); if (name.trim()) onAdd(name.trim(), group); };
  return h('div', { className: 'modal-backdrop open', onClick: (event) => event.target === event.currentTarget && onClose() }, h('div', { className: 'modal', role: 'dialog', 'aria-modal': 'true' }, h('button', { className: 'modal-close', onClick: onClose, 'aria-label': 'Close' }, '×'), h('p', { className: 'eyebrow' }, 'New member'), h('h2', null, 'Add a member'), h('p', { className: 'modal-copy' }, 'Create a member profile to start tracking contributions.'), h('form', { onSubmit: submit }, h('label', null, 'Full name', h('input', { required: true, autoFocus: true, value: name, onChange: (event) => setName(event.target.value), placeholder: 'e.g. Meera Shah' })), h('label', null, 'Assign to group', h('select', { value: group, onChange: (event) => setGroup(event.target.value) }, ['Group Alpha', 'Group Beta', 'Group Gamma', 'Group Delta'].map((item) => h('option', { key: item }, item)))), h('button', { className: 'button button-primary full-button', type: 'submit' }, 'Create member →'))));
}

function Overview({ activity, onAdd }) {
  return h('div', { className: 'page-wrap react-page' },
    h('div', { className: 'page-heading' }, h('div', null, h('p', { className: 'eyebrow' }, 'React workspace · Monday, 09 September 2024'), h('h1', null, 'Good morning, Arjun ', h('span', { className: 'wave' }, '✦')), h('p', { className: 'heading-copy' }, 'Here is what is happening across your chit fund today.')), h('button', { className: 'button button-primary', onClick: onAdd }, '＋ Add member')),
    h('div', { className: 'stat-grid' }, stats.map((stat) => h(StatCard, { key: stat[0], stat }))),
    h('div', { className: 'dashboard-grid' }, h(Cashflow), h(Auction)),
    h('div', { className: 'lower-grid' }, h(Activity, { activity }), h('section', { className: 'panel reminders-panel' }, h('div', { className: 'panel-heading' }, h('div', null, h('h2', null, 'Reminders'), h('p', null, 'Things that need your attention')), h('span', { className: 'reminder-count' }, '3')), h('div', { className: 'reminder-list' }, ['5 overdue payments', 'Verify 2 new members', 'Monthly report ready'].map((item, index) => h('button', { className: 'reminder-item', key: item }, h('span', { className: `reminder-icon ${['coral', 'yellow', 'blue'][index]}` }, ['!', '◷', '▤'][index]), h('span', null, h('strong', null, item), h('small', null, 'Review workspace update')), h('span', null, '→'))))))
  );
}

function App() {
  const [active, setActive] = useState('Overview');
  const [showMember, setShowMember] = useState(false);
  const [activity, setActivity] = useState([
    { initials: 'RK', name: 'Ravi Kumar paid installment', detail: 'Group Alpha · 15 minutes ago', amount: '+ ₹ 25,000', tone: 'teal' },
    { initials: 'PN', name: 'Priya Nair joined Group Delta', detail: 'New member · 42 minutes ago', amount: 'New', tone: 'violet' },
    { initials: 'SM', name: 'Shivam Mehta missed installment', detail: 'Group Beta · 1 hour ago', amount: '₹ 12,500', tone: 'orange' },
    { initials: 'AS', name: 'Auction payout processed', detail: 'Group Gamma · 3 hours ago', amount: '- ₹ 2,10,000', tone: 'green' }
  ]);
  const addMember = (name, group) => { const initials = name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase(); setActivity([{ initials, name: `${name} joined ${group}`, detail: 'New member · Just now', amount: 'New', tone: 'teal' }, ...activity]); setShowMember(false); };
  const content = active === 'Overview' ? h(Overview, { activity, onAdd: () => setShowMember(true) }) : h('div', { className: 'page-wrap' }, h('section', { className: 'react-view-card placeholder-view active-view' }, h('div', { className: 'placeholder-icon' }, '◌'), h('p', { className: 'eyebrow' }, 'React workspace'), h('h1', null, active), h('p', null, 'This view is ready to connect to your member, collection, auction, and ledger APIs.'), h('button', { className: 'button button-primary', onClick: () => setActive('Overview') }, 'Back to overview')));
  return h('div', { className: 'app-shell' }, h(Sidebar, { active, onNavigate: setActive }), h('main', { className: 'main-content' }, h('header', { className: 'topbar' }, h('div', { className: 'breadcrumb' }, h('span', null, 'Workspace'), h('b', null, '/'), h('strong', null, active)), h('div', { className: 'top-actions' }, h('button', { className: 'icon-button', 'aria-label': 'Search' }, '⌕'), h('button', { className: 'icon-button notification-button', 'aria-label': 'Notifications' }, '♢'), h('div', { className: 'profile' }, h('span', { className: 'avatar' }, 'AM'), h('span', { className: 'profile-name' }, 'Arjun Menon')))), content), showMember && h(MemberModal, { onClose: () => setShowMember(false), onAdd: addMember }));
}

ReactDOM.createRoot(document.getElementById('root')).render(h(App));
