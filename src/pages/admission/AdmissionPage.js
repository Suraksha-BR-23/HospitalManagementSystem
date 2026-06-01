import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { admissionsAPI, bedsAPI, patientsAPI, doctorsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function DischargeSummary({ adm }) {
  if (!adm) return null;
  return (
    <div style={{ fontFamily:'DM Sans,sans-serif', padding:40, background:'white', maxWidth:680 }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #0a4d68', paddingBottom:20, marginBottom:28 }}>
        <div><div style={{fontSize:'2rem'}}>🏥</div><h2 style={{color:'#0a4d68',fontFamily:'DM Serif Display',marginTop:8}}>MediCare Hospital</h2><p style={{color:'#5a7184',fontSize:'0.85rem'}}>Quality Care, Always</p></div>
        <div style={{textAlign:'right'}}><h2 style={{color:'#0a4d68',fontFamily:'DM Serif Display',fontSize:'1.5rem'}}>DISCHARGE SUMMARY</h2><p style={{color:'#5a7184',fontSize:'0.85rem'}}>{adm.adm_id}</p><p style={{color:'#5a7184',fontSize:'0.85rem'}}>Discharged: {adm.discharge_date}</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24,marginBottom:24}}>
        <div><h4 style={{color:'#5a7184',fontSize:'0.75rem',textTransform:'uppercase',marginBottom:8}}>Patient Information</h4>
          <p><strong>{adm.patient_name}</strong></p>
          <p style={{color:'#5a7184',fontSize:'0.9rem'}}>Age: {adm.patient_age} | Blood: {adm.patient_blood_group}</p>
        </div>
        <div><h4 style={{color:'#5a7184',fontSize:'0.75rem',textTransform:'uppercase',marginBottom:8}}>Attending Doctor</h4>
          <p><strong>{adm.doctor_name}</strong></p>
          <p style={{color:'#5a7184',fontSize:'0.9rem'}}>Bed: {adm.bed_number} | Ward: {adm.ward}</p>
        </div>
      </div>
      <div style={{background:'#f0f4f8',padding:16,borderRadius:10,marginBottom:24}}>
        <h4 style={{color:'#5a7184',fontSize:'0.75rem',textTransform:'uppercase',marginBottom:10}}>Diagnosis</h4>
        <p>{adm.diagnosis}</p>
        {adm.notes && <p style={{marginTop:8,color:'#5a7184'}}><em>{adm.notes}</em></p>}
      </div>
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:20}}>
        <thead><tr style={{background:'#f0f4f8'}}><th style={{padding:'10px 16px',textAlign:'left',fontSize:'0.82rem'}}>Description</th><th style={{padding:'10px 16px',textAlign:'right',fontSize:'0.82rem'}}>Amount</th></tr></thead>
        <tbody>
          <tr><td style={{padding:'10px 16px',borderBottom:'1px solid #d1dce8'}}>Admission Date</td><td style={{padding:'10px 16px',textAlign:'right',borderBottom:'1px solid #d1dce8'}}>{adm.admission_date}</td></tr>
          <tr><td style={{padding:'10px 16px',borderBottom:'1px solid #d1dce8'}}>Discharge Date</td><td style={{padding:'10px 16px',textAlign:'right',borderBottom:'1px solid #d1dce8'}}>{adm.discharge_date}</td></tr>
          <tr><td style={{padding:'10px 16px',borderBottom:'1px solid #d1dce8'}}>Days Stayed</td><td style={{padding:'10px 16px',textAlign:'right',borderBottom:'1px solid #d1dce8'}}>{adm.days_stayed} day(s)</td></tr>
          <tr><td style={{padding:'10px 16px',borderBottom:'1px solid #d1dce8'}}>Bed Type ({adm.ward})</td><td style={{padding:'10px 16px',textAlign:'right',borderBottom:'1px solid #d1dce8'}}>₹{adm.bed_rate}/day</td></tr>
        </tbody>
      </table>
      <div style={{background:'#0a4d68',color:'white',padding:'20px 24px',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
        <span style={{fontSize:'1.1rem',fontWeight:600}}>Total Bed Charges</span>
        <span style={{fontSize:'2rem',fontFamily:'DM Serif Display'}}>₹{adm.total_bed_charges?.toLocaleString()}</span>
      </div>
      {adm.discharge_notes && <div style={{marginTop:16,padding:14,border:'1px solid #d1dce8',borderRadius:10}}><strong>Discharge Notes: </strong>{adm.discharge_notes}</div>}
      <div style={{textAlign:'center',marginTop:32,color:'#5a7184',fontSize:'0.8rem',borderTop:'1px solid #d1dce8',paddingTop:16}}>Get well soon! Thank you for choosing MediCare Hospital 💙</div>
    </div>
  );
}

export default function AdmissionPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState('list');
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [beds, setBeds] = useState([]);
  const [dischargeModal, setDischargeModal] = useState(null);
  const [dischargeForm, setDischargeForm] = useState({ discharge_date: '', discharge_notes: '' });
  const [dischargeSummary, setDischargeSummary] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const [form, setForm] = useState({ patient_id:'', doctor_id:'', bed_id:'', admission_date: new Date().toISOString().split('T')[0], diagnosis:'', notes:'' });

  const fetch = () => {
    setAdmissions(admissionsAPI.list());
    setPatients(patientsAPI.list());
    setDoctors(doctorsAPI.list());
    setBeds(bedsAPI.list());
  };
  useEffect(() => { fetch(); }, []);

  const availableBeds = beds.filter(b => b.status === 'available');
  const filtered = filterStatus === 'all' ? admissions : admissions.filter(a => a.status === filterStatus);

  const handleAdmit = (e) => {
    e.preventDefault(); setError(''); setSuccess('');
    try {
      admissionsAPI.admit(form);
      setSuccess('Patient admitted successfully!');
      setTab('list'); fetch();
      setForm({ patient_id:'', doctor_id:'', bed_id:'', admission_date: new Date().toISOString().split('T')[0], diagnosis:'', notes:'' });
    } catch (err) { setError(err.message); }
  };

  const handleDischarge = () => {
    setError('');
    if (!dischargeForm.discharge_date) { setError('Please select discharge date'); return; }
    try {
      const result = admissionsAPI.discharge(dischargeModal.id, dischargeForm);
      const full = admissionsAPI.get(result.id);
      setDischargeModal(null);
      setDischargeSummary(full);
      setTab('summary');
      fetch();
    } catch (err) { setError(err.message); }
  };

  const f = (key) => ({ value: form[key], onChange: e => setForm({...form, [key]: e.target.value}) });
  const selectedBed = beds.find(b => b.id === parseInt(form.bed_id));

  const statusBadge = (s) => {
    const m = { admitted:'badge-warning', discharged:'badge-success' };
    return <span className={`badge ${m[s]||'badge-info'}`}>{s}</span>;
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h1>Admissions & Beds</h1><p>Manage patient admissions and bed assignments</p></div>
        <div className="flex gap-8">
          <div style={{ background:'white', border:'1px solid var(--border)', borderRadius:10, padding:'8px 16px', fontSize:'0.85rem' }}>
            🛏️ Available: <strong style={{color:'var(--success)'}}>{availableBeds.length}</strong> / Total: <strong>{beds.length}</strong>
          </div>
          {user?.role !== 'patient' && <button className="btn btn-accent" onClick={() => { setTab('admit'); setError(''); setSuccess(''); }}>+ Admit Patient</button>}
        </div>
      </div>

      <div style={{ display:'flex', gap:8, marginBottom:24, borderBottom:'2px solid var(--border)', paddingBottom:0 }}>
        {[['list','📋 Admissions'],['beds','🛏️ Bed Status'],tab==='admit'&&['admit','➕ New Admission'],tab==='summary'&&['summary','📄 Discharge Summary']].filter(Boolean).map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding:'10px 20px', border:'none', borderBottom: tab===t ? '3px solid var(--accent)' : '3px solid transparent', background:'none', fontFamily:'DM Sans', fontWeight: tab===t ? 600 : 400, color: tab===t ? 'var(--primary)' : 'var(--text-muted)', cursor:'pointer', fontSize:'0.9rem' }}>{l}</button>
        ))}
      </div>

      {tab === 'list' && (
        <>
          <div className="filter-bar">
            <select className="search-input" style={{flex:'none',width:180}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}>
              <option value="all">All Admissions</option>
              <option value="admitted">Currently Admitted</option>
              <option value="discharged">Discharged</option>
            </select>
          </div>
          <div className="card">
            <div className="table-wrapper">
              <table>
                <thead><tr><th>Adm ID</th><th>Patient</th><th>Doctor</th><th>Bed / Ward</th><th>Admitted</th><th>Status</th><th>Charges</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.length === 0
                    ? <tr><td colSpan={8} className="text-center" style={{color:'var(--text-muted)',padding:32}}>No admissions found</td></tr>
                    : filtered.map(a => (
                      <tr key={a.id}>
                        <td><code style={{fontSize:'0.78rem'}}>{a.adm_id}</code></td>
                        <td><strong>{a.patient_name}</strong></td>
                        <td>{a.doctor_name}</td>
                        <td><span className="badge badge-info">{a.bed_number}</span> <span style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{a.ward}</span></td>
                        <td>{a.admission_date}</td>
                        <td>{statusBadge(a.status)}</td>
                        <td style={{fontWeight:600}}>{a.status==='discharged' ? `₹${a.total_bed_charges?.toLocaleString()}` : `₹${a.bed_rate}/day`}</td>
                        <td>
                          {a.status === 'admitted' && user?.role !== 'patient' && (
                            <button className="btn btn-warning btn-sm" onClick={() => { setDischargeModal(a); setDischargeForm({ discharge_date: new Date().toISOString().split('T')[0], discharge_notes:'' }); setError(''); }}>
                              Discharge
                            </button>
                          )}
                          {a.status === 'discharged' && (
                            <button className="btn btn-outline btn-sm" onClick={() => { setDischargeSummary(admissionsAPI.get(a.id)); setTab('summary'); }}>Summary</button>
                          )}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {tab === 'beds' && (
        <div>
          {['General','Private','ICU','Emergency'].map(ward => {
            const wardBeds = beds.filter(b => b.ward === ward);
            return (
              <div key={ward} className="card" style={{marginBottom:20}}>
                <h3 style={{marginBottom:16,color:'var(--primary)'}}>{ward} Ward</h3>
                <div style={{display:'flex',flexWrap:'wrap',gap:10}}>
                  {wardBeds.map(b => (
                    <div key={b.id} style={{
                      padding:'12px 16px', borderRadius:10, border:`2px solid ${b.status==='available'?'var(--success)':'var(--danger)'}`,
                      background: b.status==='available'?'#d4f7e0':'#fde8e8', minWidth:120, textAlign:'center'
                    }}>
                      <div style={{fontSize:'1.4rem'}}>{b.status==='available'?'🛏️':'🔴'}</div>
                      <div style={{fontWeight:700, marginTop:4}}>{b.number}</div>
                      <div style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>₹{b.rate}/day</div>
                      <div style={{fontSize:'0.75rem',fontWeight:600,color:b.status==='available'?'#155724':'#8b1a1a',marginTop:4,textTransform:'capitalize'}}>{b.status}</div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'admit' && (
        <div className="card" style={{maxWidth:640}}>
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>Admit New Patient</h3>
          {error && <div style={{background:'#fde8e8',color:'#8b1a1a',padding:'12px 16px',borderRadius:8,marginBottom:20}}>{error}</div>}
          {success && <div style={{background:'#d4f7e0',color:'#155724',padding:'12px 16px',borderRadius:8,marginBottom:20}}>{success}</div>}
          <form onSubmit={handleAdmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Patient</label>
                <select {...f('patient_id')} required>
                  <option value="">-- Select patient --</option>
                  {patients.map(p => <option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Attending Doctor</label>
                <select {...f('doctor_id')} required>
                  <option value="">-- Select doctor --</option>
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.full_name} — {d.specialization}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Assign Bed</label>
              <select {...f('bed_id')} required>
                <option value="">-- Select available bed --</option>
                {availableBeds.map(b => <option key={b.id} value={b.id}>{b.number} — {b.ward} Ward (₹{b.rate}/day)</option>)}
              </select>
            </div>
            {selectedBed && (
              <div style={{background:'#d0f4f8',border:'1px solid var(--accent)',borderRadius:8,padding:12,marginBottom:16,fontSize:'0.9rem'}}>
                🛏️ <strong>{selectedBed.ward} Ward</strong> — Bed {selectedBed.number} — ₹{selectedBed.rate}/day
              </div>
            )}
            <div className="form-group"><label>Admission Date</label><input type="date" {...f('admission_date')} required /></div>
            <div className="form-group"><label>Diagnosis / Reason for Admission</label><textarea {...f('diagnosis')} placeholder="Primary diagnosis..." required /></div>
            <div className="form-group"><label>Additional Notes</label><textarea {...f('notes')} placeholder="Notes, allergies, special instructions..." /></div>
            <div className="flex gap-8">
              <button className="btn btn-primary" type="submit">Admit Patient</button>
              <button className="btn btn-outline" type="button" onClick={() => setTab('list')}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {tab === 'summary' && dischargeSummary && (
        <div>
          <div style={{marginBottom:16}}><button className="btn btn-accent" onClick={handlePrint}>📄 Print Discharge Summary</button></div>
          <div ref={printRef}><DischargeSummary adm={dischargeSummary} /></div>
        </div>
      )}

      {dischargeModal && (
        <div className="modal-overlay" onClick={() => setDischargeModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <h3>Discharge Patient</h3>
            <p style={{color:'var(--text-muted)',marginBottom:20}}>Patient: <strong>{dischargeModal.patient_name}</strong> | Bed: <strong>{dischargeModal.bed_number}</strong> ({dischargeModal.ward})</p>
            {error && <div style={{background:'#fde8e8',color:'#8b1a1a',padding:'10px 14px',borderRadius:8,marginBottom:16,fontSize:'0.9rem'}}>{error}</div>}
            <div className="form-group">
              <label>Discharge Date</label>
              <input type="date" value={dischargeForm.discharge_date} min={dischargeModal.admission_date}
                onChange={e => setDischargeForm({...dischargeForm, discharge_date: e.target.value})} />
            </div>
            {dischargeForm.discharge_date && (() => {
              const days = Math.max(1, Math.ceil((new Date(dischargeForm.discharge_date) - new Date(dischargeModal.admission_date)) / (1000*60*60*24)));
              const charges = days * dischargeModal.bed_rate;
              return (
                <div style={{background:'#fff8e1',border:'1px solid var(--warning)',borderRadius:8,padding:14,marginBottom:16}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{color:'var(--text-muted)'}}>Days stayed</span><strong>{days} day(s)</strong></div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}><span style={{color:'var(--text-muted)'}}>Rate per day</span><strong>₹{dischargeModal.bed_rate}</strong></div>
                  <div style={{display:'flex',justifyContent:'space-between',fontSize:'1.1rem',borderTop:'1px solid var(--warning)',paddingTop:8,marginTop:8}}><strong>Total Bed Charges</strong><strong style={{color:'var(--primary)'}}>₹{charges.toLocaleString()}</strong></div>
                </div>
              );
            })()}
            <div className="form-group"><label>Discharge Notes</label><textarea value={dischargeForm.discharge_notes} onChange={e=>setDischargeForm({...dischargeForm,discharge_notes:e.target.value})} placeholder="Final condition, follow-up instructions..." /></div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setDischargeModal(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={handleDischarge}>Confirm Discharge</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
