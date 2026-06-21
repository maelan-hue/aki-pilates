'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import MonthCalendar from './components/MonthCalendar';

const LogoMark = () => (
  <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#A84B41" strokeWidth="2.2">
    <circle cx="50" cy="50" r="38" />
    <path d="M50 12 C68 12 68 50 50 50 C32 50 32 88 50 88" />
    <path d="M30 35 a8 8 0 1 0 12 12 a10 10 0 1 1 -12 -12" fill="#A84B41" stroke="none" />
    <circle cx="68" cy="50" r="5" fill="#A84B41" stroke="none" />
  </svg>
);

function fmtTime(t) {
  if (!t) return '';
  const [h, m] = t.split(':');
  return `${h}h${m}`;
}

export default function HomePage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({ full_name: '', phone: '', email: '' });
  const [step, setStep] = useState('form'); // 'form' | 'confirm' | 'sending'
  const [error, setError] = useState('');

  useEffect(() => {
    loadClasses();
  }, []);

  async function loadClasses() {
    setLoading(true);
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('class_date', { ascending: true })
      .order('time', { ascending: true });
    if (!error) setClasses(data || []);
    setLoading(false);
  }

  function openSheet(c) {
    setSelected(c);
    setForm({ full_name: '', phone: '', email: '' });
    setStep('form');
    setError('');
    setSheetOpen(true);
  }

  async function submitBooking() {
    if (!form.full_name.trim() || !form.phone.trim()) {
      setError('Merci de renseigner au moins ton nom et ton téléphone.');
      return;
    }
    setStep('sending');
    const { error } = await supabase.from('bookings').insert({
      class_id: selected.id,
      full_name: form.full_name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim() || null,
    });
    if (error) {
      setError("Un souci est survenu, réessaie dans un instant.");
      setStep('form');
      return;
    }
    setStep('confirm');
  }

  return (
    <div className="wrap">
      <div className="nav">
        <div className="brand">
          <div className="brand-mark"><LogoMark /></div>
          <div>
            <div className="brand-name"><b>ĀKI</b><span className="pilates-word">Pilates</span></div>
          </div>
        </div>
        <a className="nav-icon" href="/admin" title="Espace Āki">🔑</a>
      </div>

      <div className="hero">
        <div className="breath"><span>respire</span></div>
        <h1>Prends ton <em>cours</em>,<br />en pleine conscience.</h1>
        <p className="lead">Choisis ton créneau et réserve ta place en 2 minutes.</p>
        <button className="hero-cta" onClick={() => document.querySelector('.mcal').scrollIntoView({ behavior: 'smooth' })}>
          Voir le planning →
        </button>
      </div>

      <div className="intro">
        <div className="intro-card">
          <h2>Le pilates, c'est quoi ?</h2>
          <p>Le Pilates est une méthode de renforcement des muscles profonds. Les muscles profonds sont responsables de la posture. Le but est de prendre conscience de l'importance de l'harmonie entre le corps et l'esprit.</p>
          <div className="intro-divider"></div>
          <p>Développée au début du 20e siècle par Joseph Pilates, sa méthode s'inspire de la gymnastique, du yoga et de la danse, avec un fort accent sur la respiration et le contrôle du mouvement.</p>
        </div>

        <div className="coach-card">
          <div className="coach-photo">A·K</div>
          <div className="coach-info">
            <b>Ana-Kim</b>
            <div className="coach-role">Kinésithérapeute &amp; professeure de pilates</div>
            <p>Sur tapis, elle est là pour créer un équilibre avec votre corps, votre esprit &amp; votre âme.</p>
          </div>
        </div>
      </div>

      <MonthCalendar classes={classes} onSelectDay={setSelectedDay} />

      <div className="section" id="planning">
        <div className="section-head">
          <h2>Planning</h2>
          {selectedDay && (
            <a href="#" onClick={(e) => { e.preventDefault(); setSelectedDay(null); }}>Voir tout</a>
          )}
        </div>

        {loading && <div className="empty-state">Chargement du planning…</div>}
        {!loading && classes.length === 0 && (
          <div className="empty-state">Aucun cours programmé pour le moment. Reviens bientôt !</div>
        )}

        {classes.filter((c) => !selectedDay || c.class_date === selectedDay).map((c) => {
          const full = c.places <= 0;
          let tag;
          if (full) tag = <span className="tag">Complet</span>;
          else if (c.is_formule) tag = <span className="tag low">Formule</span>;
          else if (c.places <= 2) tag = <span className="tag low">{c.places} place{c.places > 1 ? 's' : ''} restante{c.places > 1 ? 's' : ''}</span>;
          else tag = <span className="tag">{c.places} places restantes</span>;

          return (
            <div className="class-card" key={c.id}>
              <div className="class-time">
                <div className="t1">{fmtTime(c.time)}</div>
                <div className="t2">{c.duration} min</div>
              </div>
              <div className="class-divider"></div>
              <div className="class-info">
                <h3>{c.name}</h3>
                <p>{c.day_label} · {c.description}</p>
                <div className="class-tags">{tag}</div>
              </div>
              <div className="class-action">
                <div className="class-price">{c.price}€<small>{c.is_formule ? 'la formule' : 'le cours'}</small></div>
                {full ? (
                  <button className="book-btn full">Complet</button>
                ) : (
                  <button className="book-btn" onClick={() => openSheet(c)}>Réserver</button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="how">
        <h2>Comment ça marche</h2>
        <div className="step">
          <div className="step-num">1</div>
          <div className="step-txt"><h4>Choisis ton cours</h4><p>Tu vois en direct les places disponibles, plus de doute sur si c'est complet.</p></div>
        </div>
        <div className="step">
          <div className="step-num">2</div>
          <div className="step-txt"><h4>Envoie ta demande</h4><p>Tes coordonnées suffisent. Pas de paiement à cette étape.</p></div>
        </div>
        <div className="step">
          <div className="step-num">3</div>
          <div className="step-txt"><h4>Āki confirme et envoie le lien d'acompte</h4><p>Par SMS ou email, avec un lien de paiement sécurisé pour l'acompte.</p></div>
        </div>
        <div className="step">
          <div className="step-num">4</div>
          <div className="step-txt"><h4>C'est confirmé</h4><p>Ta place est validée dès réception de l'acompte.</p></div>
        </div>
      </div>

      <div className="footer">
        <div className="brand-mark" style={{ margin: '0 auto 10px' }}><LogoMark /></div>
        <p>Āki Pilates</p>
        <p className="ig">@pilates.aki</p>
      </div>

      {sheetOpen && (
        <div className="sheet-overlay show" onClick={(e) => { if (e.target === e.currentTarget) setSheetOpen(false); }}>
          <div className="sheet">
            <div className="sheet-handle"></div>
            <div className="sheet-head">
              <h2>Réserver</h2>
              <button className="sheet-close" onClick={() => setSheetOpen(false)}>✕</button>
            </div>

            {step !== 'confirm' ? (
              <div>
                <div className="recap">
                  <div className="ic">🧘</div>
                  <div>
                    <b>{selected?.name}</b>
                    <span>{selected?.day_label} · {fmtTime(selected?.time)}</span>
                  </div>
                </div>

                <div className="field">
                  <label>Prénom et nom</label>
                  <input type="text" placeholder="Camille Dupuis" value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="row2">
                  <div className="field">
                    <label>Téléphone</label>
                    <input type="tel" placeholder="06 12 34 56 78" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>Email</label>
                    <input type="email" placeholder="toi@mail.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                </div>

                <div className="acompte-box">
                  <div className="acompte-row total"><span>Prix</span><span>{selected?.price} €</span></div>
                  <div className="acompte-note">Pas de paiement en ligne pour le moment. Āki te recontacte pour confirmer ta place et t'envoie un lien de paiement pour l'acompte.</div>
                </div>

                {error && <div className="login-error">{error}</div>}

                <button className="pay-btn" disabled={step === 'sending'} onClick={submitBooking}>
                  {step === 'sending' ? 'Envoi…' : 'Envoyer ma demande de réservation'}
                </button>
                <div className="secure">📩 Āki te répond rapidement, par SMS ou email</div>
                <div className="sheet-mention">* En dessous de 4 participants, le cours ne peut pas être assuré. L'acompte sera intégralement remboursé.</div>
              </div>
            ) : (
              <div className="confirm">
                <div className="check">✓</div>
                <h2>Demande envoyée !</h2>
                <p>Ta demande pour {selected?.name} du {selected?.day_label?.toLowerCase()} à {fmtTime(selected?.time)} a bien été transmise.</p>
                <div className="reste">
                  <b>Et maintenant ?</b> Āki te recontacte sous peu pour confirmer ta place et t'envoyer un lien de paiement pour régler l'acompte.
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
