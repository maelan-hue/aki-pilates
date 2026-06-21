'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

const DAYS = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${h}h${m}`;
}

function dayLabel(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  const day = DAYS[(d.getDay() + 6) % 7];
  return `${day} ${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'long' })}`;
}

export default function AdminPage() {
  const [session, setSession] = useState(undefined); // undefined = loading
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [classes, setClasses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [form, setForm] = useState({
    class_date: '', time: '09:00', name: '', description: '',
    duration: 45, price: 10, places: 5, is_formule: false,
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session) {
      loadClasses();
      loadBookings();
    }
  }, [session]);

  async function loadClasses() {
    const { data } = await supabase.from('classes').select('*')
      .order('class_date', { ascending: true }).order('time', { ascending: true });
    setClasses(data || []);
  }

  async function loadBookings() {
    const { data } = await supabase.from('bookings').select('*, classes(name, day_label, time)')
      .order('created_at', { ascending: false }).limit(30);
    setBookings(data || []);
  }

  async function handleLogin(e) {
    e.preventDefault();
    setLoginError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setLoginError('Email ou mot de passe incorrect.');
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function addClass() {
    if (!form.name.trim() || !form.class_date) {
      alert('Indique au moins une date et un nom de cours.');
      return;
    }
    const { error } = await supabase.from('classes').insert({
      class_date: form.class_date,
      day_label: dayLabel(form.class_date),
      time: form.time,
      name: form.name.trim(),
      description: form.description.trim() || 'Studio Villelongue',
      duration: Number(form.duration) || 45,
      price: Number(form.price) || 10,
      places: Number(form.places) || 0,
      is_formule: form.name.toLowerCase().includes('petit-d'),
    });
    if (error) { alert("Erreur lors de l'ajout : " + error.message); return; }
    setForm({ ...form, name: '', description: '' });
    loadClasses();
  }

  async function deleteClass(id) {
    if (!confirm('Supprimer ce cours du planning ?')) return;
    await supabase.from('classes').delete().eq('id', id);
    loadClasses();
  }

  // ---------- RENDER ----------

  if (session === undefined) {
    return <div className="loading-state">Chargement…</div>;
  }

  if (!session) {
    return (
      <div className="login-box">
        <h2>Espace Āki</h2>
        <p>Connecte-toi pour gérer ton planning.</p>
        <form onSubmit={handleLogin}>
          <div className="field">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="field">
            <label>Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <button className="pay-btn" type="submit">Se connecter</button>
          {loginError && <div className="login-error">{loginError}</div>}
        </form>
      </div>
    );
  }

  return (
    <div className="wrap">
      <div className="admin-header">
        <h2>Mon planning</h2>
        <button className="back-link" onClick={handleLogout}>Se déconnecter</button>
      </div>
      <div className="admin-banner">
        Ajoute, modifie ou retire un cours — il apparaît aussitôt sur le planning visible par tes élèves.
      </div>

      <div className="admin-form">
        <h3>Ajouter un cours</h3>
        <div className="row2">
          <div className="field"><label>Date</label>
            <input type="date" value={form.class_date} onChange={(e) => setForm({ ...form, class_date: e.target.value })} />
          </div>
          <div className="field"><label>Heure</label>
            <input type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>
        <div className="field"><label>Nom du cours</label>
          <input type="text" placeholder="Pilates Reformer" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div className="field"><label>Détail (lieu, niveau...)</label>
          <input type="text" placeholder="Studio Villelongue · tous niveaux" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        </div>
        <div className="row2">
          <div className="field"><label>Durée (min)</label>
            <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })} />
          </div>
          <div className="field"><label>Prix (€)</label>
            <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
          </div>
        </div>
        <div className="field"><label>Places disponibles</label>
          <input type="number" value={form.places} onChange={(e) => setForm({ ...form, places: e.target.value })} />
        </div>
        <button className="add-btn" onClick={addClass}>+ Ajouter au planning</button>
      </div>

      <div className="admin-list">
        <h3>Cours programmés</h3>
        {classes.length === 0 && <div className="empty-state">Tu n'as encore ajouté aucun cours.</div>}
        {classes.map((c) => (
          <div className="admin-item" key={c.id}>
            <div className="ai-time">{fmtTime(c.time)}</div>
            <div className="ai-info">
              <b>{c.name}</b>
              <span>{c.day_label} · {c.duration} min · {c.places} places</span>
            </div>
            <div className="ai-price">{c.price}€</div>
            <button className="del-btn" onClick={() => deleteClass(c.id)}>✕</button>
          </div>
        ))}
      </div>

      <div className="admin-list">
        <h3>Dernières demandes de réservation</h3>
        {bookings.length === 0 && <div className="empty-state">Aucune demande pour le moment.</div>}
        {bookings.map((b) => (
          <div className="admin-item" key={b.id}>
            <div className="ai-info">
              <b>{b.full_name}</b>
              <span>{b.classes?.name} · {b.classes?.day_label} {fmtTime(b.classes?.time)} · {b.phone}{b.email ? ' · ' + b.email : ''}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
