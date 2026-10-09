import { useEffect, useMemo, useState } from 'react';
import './admin.css';
import { deleteCommunityVideo, getAdminAccess, getAdminSession, loadCommunityVideos, sendAdminOtp, signOutAdmin, verifyAdminOtp } from './supabase-admin.mjs';

const navItems = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'submissions', label: 'Video submissions', icon: 'video', countKey: 'pending' },
  { id: 'members', label: 'Members', icon: 'users' },
  { id: 'content', label: 'Site content', icon: 'edit' },
  { id: 'safety', label: 'Reports & safety', icon: 'shield', countKey: 'reports' },
  { id: 'activity', label: 'Activity log', icon: 'activity' },
];

const initialMembers = [];
const initialContent = [];
const initialReports = [];
const initialActivity = [];

function Icon({ name, size = 18, stroke = 1.8 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    video: <><path d="m16 13 5.2 3.4a.5.5 0 0 0 .8-.4V8a.5.5 0 0 0-.8-.4L16 11" /><rect x="2" y="6" width="14" height="12" rx="2" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8" /></>,
    edit: <><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" /></>,
    shield: <><path d="M12 22s8-3.8 8-10V5l-8-3-8 3v7c0 6.2 8 10 8 10Z" /><path d="m9 12 2 2 4-4" /></>,
    activity: <><path d="M3 12h4l3-8 4 16 3-8h4" /></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-2.5V20a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.6-1H6v-2.5h.2a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6V5h2.5v.2a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v2.5H21a1.7 1.7 0 0 0-1.6 1Z" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    arrow: <><path d="M5 12h14" /><path d="m13 6 6 6-6 6" /></>,
    down: <path d="m6 9 6 6 6-6" />,
    up: <><path d="M12 19V5" /><path d="m6 11 6-6 6 6" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    x: <><path d="M6 6l12 12M18 6 6 18" /></>,
    trash: <><path d="M4 7h16M10 11v6M14 11v6" /><path d="m6 7 1 13h10l1-13M9 7V4h6v3" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.5" /></>,
    dots: <><circle cx="5" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" /><circle cx="19" cy="12" r="1" fill="currentColor" stroke="none" /></>,
    filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
    external: <><path d="M14 4h6v6M20 4l-9 9" /><path d="M19 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h6" /></>,
    lock: <><rect x="4" y="10" width="16" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  };
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round">{paths[name] || paths.activity}</svg>;
}

function Avatar({ initials, tone = 'peach', small = false }) {
  return <span className={`admin-avatar ${tone} ${small ? 'small' : ''}`}>{initials}</span>;
}

function mapCommunityVideo(row, index) {
  const creator = row.tutor_name || 'Community contributor';
  const initials = creator.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();
  return {
    id: `supabase-${row.id}`,
    rawId: row.id,
    source: 'supabase',
    title: row.phrase || 'Untitled community video',
    creator,
    initials,
    submitted: 'Live library',
    duration: '—',
    category: 'Community library',
    status: 'Published',
    tone: ['blue', 'mint', 'lavender', 'peach'][index % 4],
    thumb: row.media_url || '',
    flags: 0,
  };
}

function AdminGateShell({ children }) {
  return <main className="admin-gate-shell"><div className="admin-gate-brand"><span className="admin-brand-mark">B<span /></span><span>BRIDGE<span>it</span></span></div>{children}</main>;
}

function AdminAuthGate({ onAccess }) {
  const [email, setEmail] = useState('kingonaire@gmail.com');
  const [code, setCode] = useState('');
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async event => {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      if (!sent) {
        await sendAdminOtp(email);
        setSent(true);
      } else {
        const next = await verifyAdminOtp(email, code);
        if (!next.isAdmin) throw new Error('This email is not on the BRIDGEit admin allowlist.');
        onAccess(next);
      }
    } catch (submitError) {
      setError(submitError.message || 'We could not verify that code. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return <AdminGateShell><section className="admin-gate-card" aria-labelledby="admin-gate-title"><div className="admin-eyebrow">PRIVATE WORKSPACE</div><h1 id="admin-gate-title">Admin sign in</h1><p>Use the email OTP connected to Supabase to access moderation tools.</p><form className="admin-gate-form" onSubmit={submit}><label>Email address<input type="email" value={email} onChange={event => setEmail(event.target.value)} disabled={sent || busy} required /></label>{sent && <label>8-digit verification code<input type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{8}" maxLength="8" value={code} onChange={event => setCode(event.target.value.replace(/\D/g, '').slice(0, 8))} placeholder="00000000" required /></label>}{error && <p className="admin-gate-error" role="alert">{error}</p>}<button className="admin-primary-button" type="submit" disabled={busy || (sent && code.length !== 8)}>{busy ? 'Checking…' : sent ? 'Verify and enter' : 'Send verification code'}</button></form>{sent && <button className="admin-gate-link" type="button" onClick={() => { setSent(false); setCode(''); setError(''); }}>Use a different email</button>}</section></AdminGateShell>;
}

function AdminDashboard() {
  const [access, setAccess] = useState({ status: 'checking' });
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    let active = true;
    getAdminAccess(getAdminSession()).then(next => {
      if (active) setAccess({ status: 'ready', ...next });
    });
    return () => { active = false; };
  }, [retry]);

  if (access.status === 'checking') return <AdminGateShell><section className="admin-gate-card admin-gate-loading"><span className="admin-gate-spinner" /><p>Checking your admin access…</p></section></AdminGateShell>;
  if (!access.authenticated) return <AdminAuthGate onAccess={next => setAccess({ status: 'ready', ...next })} />;
  if (access.error) return <AdminGateShell><section className="admin-gate-card"><div className="admin-eyebrow">ADMIN ACCESS</div><h1>We couldn’t verify your access.</h1><p>{access.error.message}</p><button className="admin-primary-button" onClick={() => { signOutAdmin(); setRetry(value => value + 1); }}>Try again</button></section></AdminGateShell>;
  if (!access.isAdmin) return <AdminGateShell><section className="admin-gate-lock"><span className="admin-confirm-icon"><Icon name="lock" size={21} /></span><div><div className="admin-eyebrow">ACCESS RESTRICTED</div><h1>This workspace is for admins.</h1><p>{access.user?.email || 'This account'} is signed in but is not on the BRIDGEit admin allowlist.</p><button className="admin-secondary-button" onClick={() => { signOutAdmin(); setRetry(value => value + 1); }}>Sign out</button></div></section></AdminGateShell>;
  return <AdminWorkspace access={access} />;
}

function AdminWorkspace({ access }) {
  const [activeView, setActiveView] = useState('overview');
  const [videos, setVideos] = useState([]);
  const [videoConnection, setVideoConnection] = useState({ status: 'loading', label: 'Connecting to Supabase' });
  const [members, setMembers] = useState(initialMembers);
  const [content, setContent] = useState(initialContent);
  const [reports, setReports] = useState(initialReports);
  const [activity, setActivity] = useState(initialActivity);
  const [videoFilter, setVideoFilter] = useState('Needs review');
  const [search, setSearch] = useState('');
  const [mobileNav, setMobileNav] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState('');
  const adminEmail = access.user?.email || 'admin';
  const adminName = access.user?.user_metadata?.name || adminEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, letter => letter.toUpperCase());
  const adminInitials = adminName.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase();

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 3200);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    let active = true;
    setVideoConnection({ status: 'loading', label: 'Connecting to Supabase' });
    loadCommunityVideos(access.session).then(rows => {
      if (!active) return;
      setVideos(rows.map(mapCommunityVideo));
      setVideoConnection({ status: 'live', label: 'Supabase connected' });
    }).catch(error => {
      if (!active) return;
      setVideos([]);
      setVideoConnection({ status: 'error', label: 'Supabase unavailable', error });
    });
    return () => { active = false; };
  }, [access.session]);

  const pendingCount = videos.filter(video => video.status === 'Needs review').length;
  const reportCount = reports.length;
  const activeNav = navItems.find(item => item.id === activeView);
  const pageLabel = activeNav?.label || 'Overview';

  const addActivity = (action, target, icon = 'activity', tone = 'green') => {
    setActivity(items => [{ id: Date.now(), action, target, time: 'Just now', actor: 'You', icon, tone }, ...items].slice(0, 8));
  };

  const changeVideoStatus = (video, nextStatus) => {
    setVideos(items => items.map(item => item.id === video.id ? { ...item, status: nextStatus } : item));
    addActivity(nextStatus === 'Published' ? 'Published a video' : 'Moved a video to review', `“${video.title}” by ${video.creator}`, nextStatus === 'Published' ? 'check' : 'activity', nextStatus === 'Published' ? 'green' : 'yellow');
    setToast(nextStatus === 'Published' ? 'Video published to the community.' : 'Video moved back to review.');
  };

  const deleteVideo = async () => {
    const video = modal?.video;
    if (!video) return;
    try {
      if (video.source === 'supabase') await deleteCommunityVideo(video.rawId, access.session);
      setVideos(items => items.filter(item => item.id !== video.id));
      addActivity('Removed a video', `“${video.title}” by ${video.creator}`, 'trash', 'red');
      setModal(null);
      setToast('Video submission deleted from Supabase.');
    } catch (error) {
      setToast(error.message || 'Video submission could not be deleted.');
    }
  };

  const saveContent = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const selected = modal?.content;
    if (!selected) return;
    const title = String(data.get('title') || '').trim();
    const description = String(data.get('description') || '').trim();
    const state = String(data.get('state') || 'Published');
    setContent(items => selected.id === 'new'
      ? [{ ...selected, id: `content-${Date.now()}`, title, description, state, updated: 'Edited just now', color: 'green' }, ...items]
      : items.map(item => item.id === selected.id ? { ...item, title, description, state, updated: 'Edited just now' } : item));
    addActivity('Updated site content', selected.section, 'edit', 'blue');
    setModal(null);
    setToast(`${selected.section} saved as ${state.toLowerCase()}.`);
  };

  const toggleMember = (member) => {
    const nextStatus = member.status === 'Suspended' ? 'Active' : 'Suspended';
    setMembers(items => items.map(item => item.id === member.id ? { ...item, status: nextStatus } : item));
    addActivity(nextStatus === 'Suspended' ? 'Suspended a member' : 'Restored a member', member.name, 'shield', nextStatus === 'Suspended' ? 'yellow' : 'green');
    setToast(`${member.name} is now ${nextStatus.toLowerCase()}.`);
  };

  const filteredVideos = useMemo(() => {
    const query = search.toLowerCase().trim();
    return videos.filter(video => (videoFilter === 'All' || video.status === videoFilter) && (!query || `${video.title} ${video.creator} ${video.category}`.toLowerCase().includes(query)));
  }, [search, videoFilter, videos]);

  const filteredMembers = useMemo(() => {
    const query = search.toLowerCase().trim();
    return members.filter(member => !query || `${member.name} ${member.email} ${member.role}`.toLowerCase().includes(query));
  }, [members, search]);

  const goTo = (view) => {
    setActiveView(view);
    setSearch('');
    setMobileNav(false);
  };

  return <div className="admin-shell">
    <a className="admin-skip-link" href="#admin-main">Skip to admin content</a>
    <aside className={`admin-sidebar ${mobileNav ? 'open' : ''}`}>
      <div className="admin-brand-wrap">
        <a className="admin-brand" href="/" aria-label="Back to BRIDGEit home">
          <span className="admin-brand-mark">B<span /></span>
          <span>BRIDGE<span>it</span></span>
        </a>
        <span className="admin-brand-subtitle">Admin console</span>
      </div>
      <div className="admin-nav-group">
        <span className="admin-nav-label">WORKSPACE</span>
        <nav aria-label="Admin navigation">
          {navItems.map(item => <button key={item.id} className={activeView === item.id ? 'active' : ''} onClick={() => goTo(item.id)}>
            <Icon name={item.icon} size={17} /><span>{item.label}</span>
            {item.countKey === 'pending' && pendingCount > 0 && <em>{pendingCount}</em>}
            {item.countKey === 'reports' && reportCount > 0 && <em className="alert-count">{reportCount}</em>}
          </button>)}
        </nav>
      </div>
      <div className="admin-nav-group admin-secondary-nav">
        <span className="admin-nav-label">SYSTEM</span>
        <nav aria-label="System navigation">
          <button onClick={() => setToast('Settings are ready for the next Supabase connection.') }><Icon name="settings" size={17} /><span>Settings</span></button>
          <a href="/" ><Icon name="external" size={17} /><span>View live site</span></a>
        </nav>
      </div>
      <div className="admin-sidebar-footer">
        <div className="admin-sidebar-note"><Icon name="lock" size={15} /><span>Admin actions are logged for accountability.</span></div>
        <button className="admin-profile" onClick={() => setToast(`Signed in as ${adminEmail}.`)}>
          <Avatar initials={adminInitials} tone="green" small /><span><strong>{adminName}</strong><small>{adminEmail}</small></span><Icon name="down" size={14} />
        </button>
      </div>
    </aside>
    {mobileNav && <button className="admin-nav-scrim" aria-label="Close navigation" onClick={() => setMobileNav(false)} />}

    <div className="admin-main-shell">
      <header className="admin-topbar">
        <div className="admin-topbar-left"><button className="admin-mobile-menu" onClick={() => setMobileNav(true)} aria-label="Open navigation"><Icon name="menu" size={21} /></button><div className="admin-breadcrumb"><span>BRIDGEit admin</span><b>/</b><strong>{pageLabel}</strong></div></div>
        <div className="admin-topbar-right">
          <div className={`admin-saved-indicator ${videoConnection.status}`}><span /> {videoConnection.label}</div>
          <div className="admin-notifications-wrap"><button className="admin-icon-button" aria-label="Open notifications" onClick={() => setNotificationsOpen(open => !open)}><Icon name="bell" size={18} />{(pendingCount > 0 || reportCount > 0) && <i />}</button>{notificationsOpen && <div className="admin-notifications"><strong>Notifications</strong><p><b>{pendingCount} video submissions</b> are waiting for review.</p><button onClick={() => { setNotificationsOpen(false); goTo('submissions'); }}>Open moderation queue <Icon name="arrow" size={14} /></button></div>}</div>
          <span className="admin-topbar-divider" /><button className="admin-top-profile" onClick={() => setToast(`Signed in as ${adminEmail}.`)}><Avatar initials={adminInitials} tone="green" small /><span>{adminName}</span><Icon name="down" size={13} /></button>
        </div>
      </header>

      <main id="admin-main" className="admin-main" tabIndex="-1">
        <div className="admin-main-heading">
          <div><div className="admin-eyebrow">ADMIN WORKSPACE <span>•</span> LIVE</div><h1>{activeView === 'overview' ? <>Good morning, {adminName} <span className="admin-heading-spark">✦</span></> : pageLabel}</h1><p>{activeView === 'overview' ? 'A clear view of what needs your attention across BRIDGEit today.' : `Manage ${pageLabel.toLowerCase()} and keep the BRIDGEit experience thoughtful and safe.`}</p></div>
          {activeView === 'overview' && <button className="admin-primary-button" onClick={() => goTo('submissions')}><Icon name="video" size={16} /> Review submissions <span className="admin-button-count">{pendingCount}</span></button>}
          {activeView === 'content' && <button className="admin-primary-button" onClick={() => setModal({ type: 'content', content: { id: 'new', section: 'New page section', title: '', description: '', state: 'Draft' } })}><Icon name="plus" size={16} /> Add content</button>}
        </div>

        {activeView === 'overview' && <Overview pendingCount={pendingCount} videos={videos} members={members} reports={reports} activity={activity} onReview={() => goTo('submissions')} onSafety={() => goTo('safety')} onActivity={() => goTo('activity')} />}
        {activeView === 'submissions' && <Submissions videos={filteredVideos} filter={videoFilter} setFilter={setVideoFilter} search={search} setSearch={setSearch} emptyMessage={videoConnection.status === 'live' ? 'No community videos are stored in Supabase yet.' : undefined} onApprove={video => changeVideoStatus(video, 'Published')} onReview={video => changeVideoStatus(video, 'Needs review')} onDelete={video => setModal({ type: 'delete', video })} onPreview={video => setModal({ type: 'preview', video })} />}
        {activeView === 'members' && <Members members={filteredMembers} search={search} setSearch={setSearch} onToggle={toggleMember} onView={member => setModal({ type: 'member', member })} />}
        {activeView === 'content' && <Content content={content} onEdit={item => setModal({ type: 'content', content: item })} />}
        {activeView === 'safety' && <Safety reports={reports} onResolve={report => { setReports(items => items.filter(item => item.id !== report.id)); addActivity('Resolved a report', report.detail, 'shield', 'green'); setToast('Report resolved and added to the activity log.'); }} />}
        {activeView === 'activity' && <Activity activity={activity} />}
      </main>
      <footer className="admin-footer"><span>BRIDGEit admin console</span><span>Video moderation via Supabase · Site copy preview stays on this device</span><a href="/">Return to BRIDGEit <Icon name="arrow" size={13} /></a></footer>
    </div>

    {modal?.type === 'delete' && <ConfirmModal video={modal.video} onClose={() => setModal(null)} onConfirm={deleteVideo} />}
    {modal?.type === 'preview' && <PreviewModal video={modal.video} onClose={() => setModal(null)} />}
    {modal?.type === 'member' && <MemberModal member={modal.member} onClose={() => setModal(null)} onToggle={() => { toggleMember(modal.member); setModal(null); }} />}
    {modal?.type === 'content' && <ContentEditor content={modal.content} onClose={() => setModal(null)} onSave={saveContent} />}
    {toast && <div className="admin-toast" role="status"><span><Icon name="check" size={15} /></span>{toast}<button onClick={() => setToast('')} aria-label="Dismiss notification"><Icon name="x" size={14} /></button></div>}
  </div>;
}

function Overview({ pendingCount, videos, members, reports, activity, onReview, onSafety, onActivity }) {
  const published = videos.filter(video => video.status === 'Published').length;
  return <>
    <section className="admin-stats-grid" aria-label="Site overview stats">
      <StatCard label="Pending review" value={pendingCount} detail={pendingCount ? 'Live Supabase queue' : 'No pending submissions'} tone="peach" icon="video" action={onReview} />
      <StatCard label="Published videos" value={published} detail={videos.length ? 'Live Supabase library' : 'No community videos yet'} tone="blue" icon="check" />
      <StatCard label="Admin-visible members" value={members.length} detail={members.length ? 'Loaded from connected source' : 'No member source connected'} tone="lime" icon="users" />
      <StatCard label="Open reports" value={reports.length} detail={reports.length ? 'Needs attention' : 'No open reports'} tone="lavender" icon="shield" action={onSafety} />
    </section>
    <div className="admin-dashboard-grid">
      <section className="admin-panel admin-queue-panel">
        <div className="admin-section-heading"><div><div className="admin-eyebrow">NEEDS YOUR EYES</div><h2>Moderation queue</h2><p>The newest community submissions, ready for a quick decision.</p></div><button className="admin-text-button" onClick={onReview}>View all <Icon name="arrow" size={14} /></button></div>
        <div className="admin-queue-list">{videos.filter(video => video.status === 'Needs review').slice(0, 3).map(video => <QueueRow key={video.id} video={video} />)}</div>
        <button className="admin-queue-footer" onClick={onReview}>Review {pendingCount} submissions <Icon name="arrow" size={14} /></button>
      </section>
      <section className="admin-panel admin-pulse-panel">
        <div className="admin-section-heading"><div><div className="admin-eyebrow">COMMUNITY PULSE</div><h2>This week</h2></div><button className="admin-icon-button subtle" aria-label="More pulse options"><Icon name="dots" size={18} /></button></div>
        <div className="admin-empty-state admin-pulse-empty"><span><Icon name="activity" size={20} /></span><strong>No activity data yet</strong><p>Community analytics will appear once connected sources have events.</p></div>
      </section>
    </div>
    <div className="admin-dashboard-grid lower">
      <section className="admin-panel admin-activity-panel"><div className="admin-section-heading"><div><div className="admin-eyebrow">RECENTLY LOGGED</div><h2>Activity</h2></div><button className="admin-text-button" onClick={onActivity}>See full log <Icon name="arrow" size={14} /></button></div>{activity.length ? <ActivityList activity={activity.slice(0, 4)} /> : <div className="admin-empty-state"><span><Icon name="activity" size={20} /></span><strong>No admin activity yet</strong><p>Actions taken in this workspace will appear here.</p></div>}</section>
      <section className="admin-panel admin-safety-panel"><div className="admin-section-heading"><div><div className="admin-eyebrow">SAFETY CENTRE</div><h2>Keep BRIDGEit kind.</h2><p>Reports and member safety actions are kept here.</p></div><span className="admin-safety-icon"><Icon name="shield" size={19} /></span></div><div className="admin-safety-callout"><strong>{reports.length} open {reports.length === 1 ? 'report' : 'reports'}</strong><span>Reviewing quickly helps the community feel held.</span></div><button className="admin-secondary-button full" onClick={onSafety}>Open safety centre <Icon name="arrow" size={14} /></button></section>
    </div>
  </>;
}

function StatCard({ label, value, detail, tone, icon, action }) {
  return <button className={`admin-stat-card ${tone}`} onClick={action} disabled={!action}><span className="admin-stat-icon"><Icon name={icon} size={17} /></span><span className="admin-stat-copy"><strong>{value}</strong><span>{label}</span><small>{detail}</small></span>{action && <Icon name="arrow" size={14} />}</button>;
}

function QueueRow({ video }) {
  return <div className="admin-queue-row"><div className="admin-video-thumb"><video src={video.thumb} muted playsInline preload="metadata" /></div><Avatar initials={video.initials} tone={video.tone} small /><div className="admin-queue-copy"><strong>{video.title}</strong><span>{video.creator} <i>·</i> {video.submitted}</span></div><span className="admin-duration">{video.duration}</span><span className="admin-status peach">Needs review</span><Icon name="dots" size={17} /></div>;
}

function Submissions({ videos, filter, setFilter, search, setSearch, emptyMessage, onApprove, onReview, onDelete, onPreview }) {
  const filters = ['Needs review', 'Published', 'Removed', 'All'];
  return <section className="admin-workspace-section"><div className="admin-filter-bar"><div className="admin-tabs" role="tablist" aria-label="Video status filter">{filters.map(item => <button key={item} className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} role="tab" aria-selected={filter === item}>{item}<span>{item === 'All' ? videos.length : item === 'Needs review' ? videos.filter(v => v.status === 'Needs review').length : item === 'Published' ? videos.filter(v => v.status === 'Published').length : videos.filter(v => v.status === 'Removed').length}</span></button>)}</div><div className="admin-toolbar-actions"><label className="admin-search"><Icon name="search" size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search submissions" aria-label="Search submissions" /></label><button className="admin-filter-button"><Icon name="filter" size={15} /> Filters</button></div></div><div className="admin-panel admin-table-panel"><div className="admin-table-heading"><div><h2>{filter === 'All' ? 'All videos' : filter}</h2><p>{videos.length} {videos.length === 1 ? 'submission' : 'submissions'} in this view.</p></div><button className="admin-secondary-button" onClick={() => setSearch('')}><Icon name="calendar" size={15} /> Last 30 days <Icon name="down" size={13} /></button></div><div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Submission</th><th>Creator</th><th>Submitted</th><th>Status</th><th>Flags</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{videos.length ? videos.map(video => <tr key={video.id}><td><button className="admin-table-video" onClick={() => onPreview(video)}><span className="admin-table-thumb"><video src={video.thumb} muted playsInline preload="metadata" /></span><span><strong>{video.title}</strong><small>{video.category} <i>·</i> {video.duration}</small></span></button></td><td><span className="admin-table-person"><Avatar initials={video.initials} tone={video.tone} small /><span>{video.creator}</span></span></td><td><span className="admin-muted-cell">{video.submitted}</span></td><td><span className={`admin-status ${statusTone(video.status)}`}>{video.status}</span></td><td><span className={video.flags ? 'admin-flagged' : 'admin-muted-cell'}>{video.flags || '—'}{video.flags ? ' flag' + (video.flags > 1 ? 's' : '') : ''}</span></td><td><div className="admin-row-actions">{video.status === 'Needs review' && <button className="admin-action-approve" onClick={() => onApprove(video)}><Icon name="check" size={14} /> Approve</button>}{video.status === 'Published' && <button className="admin-action-link" onClick={() => onReview(video)}>Unpublish</button>}<button className="admin-icon-button subtle" onClick={() => onDelete(video)} aria-label={`Delete ${video.title}`}><Icon name="trash" size={15} /></button></div></td></tr>) : <tr><td colSpan="6"><div className="admin-empty-state"><span><Icon name="search" size={20} /></span><strong>No submissions found</strong><p>{emptyMessage || 'Try a different search or status filter.'}</p></div></td></tr>}</tbody></table></div></div></section>;
}

function Members({ members, search, setSearch, onToggle, onView }) {
  return <section className="admin-workspace-section"><div className="admin-filter-bar"><div><div className="admin-eyebrow">COMMUNITY DIRECTORY</div><h2 className="admin-inline-heading">Members <span>{members.length} loaded</span></h2></div><div className="admin-toolbar-actions"><label className="admin-search"><Icon name="search" size={16} /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Search members" aria-label="Search members" /></label><button className="admin-secondary-button"><Icon name="filter" size={15} /> Filter</button></div></div><div className="admin-panel admin-table-panel"><div className="admin-table-heading"><div><h2>All members</h2><p>Member records will appear here when the member source is connected.</p></div><button className="admin-secondary-button" onClick={() => setSearch('')}><Icon name="users" size={15} /> Export list</button></div><div className="admin-table-wrap"><table className="admin-table members-table"><thead><tr><th>Member</th><th>Role</th><th>Joined</th><th>Last active</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{members.length ? members.map(member => <tr key={member.id}><td><button className="admin-table-person admin-person-button" onClick={() => onView(member)}><Avatar initials={member.initials} tone={member.tone} /><span><strong>{member.name}</strong><small>{member.email}</small></span></button></td><td><span className="admin-role">{member.role}</span></td><td><span className="admin-muted-cell">{member.joined}</span></td><td><span className="admin-muted-cell">{member.lastSeen}</span></td><td><span className={`admin-status ${member.status === 'Active' ? 'mint' : 'yellow'}`}>{member.status}</span></td><td><div className="admin-row-actions"><button className="admin-action-link" onClick={() => onView(member)}>View</button><button className="admin-icon-button subtle" onClick={() => onToggle(member)} aria-label={`${member.status === 'Active' ? 'Suspend' : 'Restore'} ${member.name}`}><Icon name="dots" size={16} /></button></div></td></tr>) : <tr><td colSpan="6"><div className="admin-empty-state"><span><Icon name="users" size={20} /></span><strong>No member records</strong><p>Connect your member source to manage accounts here.</p></div></td></tr>}</tbody></table></div></div></section>;
}

function Content({ content, onEdit }) {
  return <section className="admin-workspace-section"><div className="admin-content-intro"><div><div className="admin-eyebrow">PUBLISHING CONTROL</div><h2>Shape what members see.</h2><p>Edit public copy and keep important pages current. Every change is tracked in the activity log.</p></div><div className="admin-publish-status"><span /> Local content preview</div></div><div className="admin-content-grid">{content.length ? content.map(item => <article className={`admin-content-card ${item.color}`} key={item.id}><div className="admin-content-card-top"><span className="admin-content-section">{item.section}</span><span className={`admin-status ${item.state === 'Published' ? 'mint' : 'yellow'}`}>{item.state}</span></div><h3>{item.title || 'Untitled section'}</h3><p>{item.description || 'Add a short description for this section.'}</p><div className="admin-content-card-footer"><small>{item.updated}</small><button className="admin-secondary-button" onClick={() => onEdit(item)}><Icon name="edit" size={14} /> Edit</button></div></article>) : <div className="admin-empty-state admin-content-empty"><span><Icon name="edit" size={20} /></span><strong>No site content records</strong><p>Connect a content source before editing public pages.</p></div>}</div><section className="admin-content-settings admin-panel"><div className="admin-section-heading"><div><div className="admin-eyebrow">SITE SETTINGS</div><h2>Preview safeguards</h2><p>These controls are available for the local content preview.</p></div><Icon name="shield" size={20} /></div><div className="admin-setting-row"><div><strong>Review before publishing</strong><span>Require a second admin approval for homepage changes.</span></div><button className="admin-toggle on" aria-label="Review before publishing enabled"><span /></button></div><div className="admin-setting-row"><div><strong>Show draft banner</strong><span>Make draft status visible to the team on preview.</span></div><button className="admin-toggle on" aria-label="Show draft banner enabled"><span /></button></div></section></section>;
}

function Safety({ reports, onResolve }) {
  return <section className="admin-workspace-section"><div className="admin-safety-header"><div><div className="admin-eyebrow">COMMUNITY CARE</div><h2>Reports & safety</h2><p>Review concerns, protect members, and keep the tone of the community intact.</p></div><div className="admin-safety-summary"><strong>{reports.length}</strong><span>open reports</span></div></div><div className="admin-panel admin-reports-panel"><div className="admin-table-heading"><div><h2>Open reports</h2><p>Reports are private and only visible to admins.</p></div><button className="admin-secondary-button"><Icon name="shield" size={15} /> Safety guidelines</button></div><div className="admin-report-list">{reports.length ? reports.map(report => <div className="admin-report-row" key={report.id}><span className={`admin-report-icon ${report.tone}`}><Icon name={report.subject === 'Member profile' ? 'users' : 'video'} size={17} /></span><div className="admin-report-copy"><strong>{report.detail}</strong><span>{report.subject} <i>·</i> {report.reporter} <i>·</i> {report.submitted}</span></div><span className={`admin-status ${report.severity === 'Priority' ? 'red' : 'peach'}`}>{report.severity}</span><div className="admin-row-actions"><button className="admin-action-approve" onClick={() => onResolve(report)}><Icon name="check" size={14} /> Resolve</button><button className="admin-icon-button subtle" aria-label="More report options"><Icon name="dots" size={16} /></button></div></div>) : <div className="admin-empty-state"><span><Icon name="shield" size={20} /></span><strong>All clear for now</strong><p>No open reports need your attention.</p></div>}</div></div><div className="admin-safety-guidance"><span><Icon name="lock" size={16} /></span><div><strong>Privacy-first moderation</strong><p>Only the admin team can see report details. Resolved actions stay in the activity log for accountability.</p></div></div></section>;
}

function Activity({ activity }) {
  return <section className="admin-workspace-section"><div className="admin-filter-bar"><div><div className="admin-eyebrow">ACCOUNTABILITY</div><h2 className="admin-inline-heading">Activity log <span>Everything admins do in one place.</span></h2></div><button className="admin-secondary-button"><Icon name="calendar" size={15} /> Last 30 days <Icon name="down" size={13} /></button></div><div className="admin-panel admin-full-activity"><ActivityList activity={activity} detailed /></div></section>;
}

function ActivityList({ activity, detailed = false }) {
  if (!activity.length) return <div className="admin-empty-state"><span><Icon name="activity" size={20} /></span><strong>No admin activity yet</strong><p>Actions taken in this workspace will appear here.</p></div>;
  return <div className={`admin-activity-list ${detailed ? 'detailed' : ''}`}>{activity.map(item => <div className="admin-activity-row" key={item.id}><span className={`admin-activity-icon ${item.tone}`}><Icon name={item.icon} size={15} /></span><div><strong>{item.action}</strong><span>{item.target}</span></div><small>{item.time}</small><em>{item.actor}</em></div>)}</div>;
}

function ConfirmModal({ video, onClose, onConfirm }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="admin-modal confirm-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title"><button className="admin-modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="x" size={18} /></button><span className="admin-confirm-icon"><Icon name="trash" size={21} /></span><div><div className="admin-eyebrow">DELETE SUBMISSION</div><h2 id="delete-title">Remove this video?</h2><p>You’re about to permanently delete <strong>“{video.title}”</strong> by {video.creator}. This action can’t be undone.</p></div><div className="admin-modal-preview"><span className="admin-table-thumb"><video src={video.thumb} muted autoPlay loop playsInline /></span><span><strong>{video.title}</strong><small>{video.category} <i>·</i> {video.duration}</small></span></div><div className="admin-modal-actions"><button className="admin-secondary-button" onClick={onClose}>Keep video</button><button className="admin-danger-button" onClick={onConfirm}><Icon name="trash" size={15} /> Delete video</button></div></section></div>;
}

function PreviewModal({ video, onClose }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="admin-modal preview-modal" role="dialog" aria-modal="true" aria-labelledby="preview-title"><button className="admin-modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="x" size={18} /></button><div className="admin-preview-video"><video src={video.thumb} controls autoPlay muted playsInline /></div><div className="admin-preview-copy"><div><div className="admin-eyebrow">VIDEO SUBMISSION <span>•</span> {video.status.toUpperCase()}</div><h2 id="preview-title">{video.title}</h2><p>{video.category} <i>·</i> {video.duration} <i>·</i> submitted {video.submitted}</p></div><Avatar initials={video.initials} tone={video.tone} /><strong>{video.creator}</strong></div><button className="admin-secondary-button full" onClick={onClose}>Close preview</button></section></div>;
}

function MemberModal({ member, onClose, onToggle }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="admin-modal member-modal" role="dialog" aria-modal="true" aria-labelledby="member-title"><button className="admin-modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="x" size={18} /></button><Avatar initials={member.initials} tone={member.tone} /><div><div className="admin-eyebrow">MEMBER PROFILE</div><h2 id="member-title">{member.name}</h2><p>{member.email}</p></div><dl className="admin-member-details"><div><dt>Role</dt><dd>{member.role}</dd></div><div><dt>Joined</dt><dd>{member.joined}</dd></div><div><dt>Status</dt><dd><span className={`admin-status ${member.status === 'Active' ? 'mint' : 'yellow'}`}>{member.status}</span></dd></div></dl><div className="admin-modal-actions"><button className="admin-secondary-button" onClick={onClose}>Close</button><button className={member.status === 'Active' ? 'admin-danger-button' : 'admin-primary-button'} onClick={onToggle}>{member.status === 'Active' ? <><Icon name="shield" size={15} /> Suspend member</> : <><Icon name="check" size={15} /> Restore member</>}</button></div></section></div>;
}

function ContentEditor({ content, onClose, onSave }) {
  return <div className="admin-modal-backdrop" role="presentation" onMouseDown={event => event.target === event.currentTarget && onClose()}><section className="admin-modal content-editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><button className="admin-modal-close" onClick={onClose} aria-label="Close dialog"><Icon name="x" size={18} /></button><div className="admin-eyebrow">CONTENT EDITOR</div><h2 id="editor-title">Edit {content.section}</h2><p className="admin-modal-lede">Changes are saved locally in this prototype and can be published when ready.</p><form onSubmit={onSave}><label>Headline<input name="title" defaultValue={content.title} placeholder="Add a headline" required /></label><label>Description<textarea name="description" defaultValue={content.description} placeholder="Add a short description" required /></label><label>Publishing status<select name="state" defaultValue={content.state || 'Draft'}><option>Published</option><option>Draft</option></select></label><div className="admin-modal-actions"><button type="button" className="admin-secondary-button" onClick={onClose}>Cancel</button><button type="submit" className="admin-primary-button"><Icon name="check" size={15} /> Save changes</button></div></form></section></div>;
}

function statusTone(status) {
  if (status === 'Published') return 'mint';
  if (status === 'Removed') return 'red';
  return 'peach';
}

export default AdminDashboard;
