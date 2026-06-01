import React, { useEffect, useState, useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { prescriptionsAPI, patientsAPI, doctorsAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

function RxPrint({ rx }) {
  if (!rx) return null;
  return (
    <div style={{ fontFamily:'DM Sans,sans-serif', padding:40, background:'white', maxWidth:640 }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #0a4d68', paddingBottom:16, marginBottom:24 }}>
        <div><div style={{fontSize:'2rem'}}>🏥</div><h2 style={{color:'#0a4d68',fontFamily:'DM Serif Display',marginTop:6}}>MediCare Hospital</h2></div>
        <div style={{textAlign:'right'}}><div style={{fontSize:'2.5rem'}}>℞</div><p style={{color:'#5a7184',fontSize:'0.82rem'}}>{rx.rx_id}</p><p style={{color:'#5a7184',fontSize:'0.82rem'}}>{rx.created_at?.slice(0,10)}</p></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
        <div><strong>Patient:</strong> {rx.patient_name}<br/><span style={{color:'#5a7184',fontSize:'0.85rem'}}>Diagnosis: {rx.diagnosis}</span></div>
        <div><strong>Doctor:</strong> {rx.doctor_name}</div>
      </div>
      <h4 style={{color:'#5a7184',fontSize:'0.75rem',textTransform:'uppercase',marginBottom:12}}>Medications</h4>
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:20}}>
        <thead><tr style={{background:'#f0f4f8'}}><th style={{padding:'8px 12px',textAlign:'left',fontSize:'0.82rem'}}>Medicine</th><th style={{padding:'8px 12px',textAlign:'left',fontSize:'0.82rem'}}>Dosage</th><th style={{padding:'8px 12px',textAlign:'left',fontSize:'0.82rem'}}>Frequency</th><th style={{padding:'8px 12px',textAlign:'left',fontSize:'0.82rem'}}>Duration</th></tr></thead>
        <tbody>{(rx.medicines||[]).map((m,i) => (
          <tr key={i}><td style={{padding:'8px 12px',borderBottom:'1px solid #d1dce8'}}>{m.name}</td><td style={{padding:'8px 12px',borderBottom:'1px solid #d1dce8'}}>{m.dosage}</td><td style={{padding:'8px 12px',borderBottom:'1px solid #d1dce8'}}>{m.frequency}</td><td style={{padding:'8px 12px',borderBottom:'1px solid #d1dce8'}}>{m.duration}</td></tr>
        ))}</tbody>
      </table>
      {rx.instructions && <div style={{background:'#f0f4f8',padding:14,borderRadius:8}}><strong>Instructions: </strong>{rx.instructions}</div>}
      <div style={{marginTop:32,borderTop:'1px solid #d1dce8',paddingTop:16,display:'flex',justifyContent:'flex-end'}}><div style={{textAlign:'center'}}><div style={{borderTop:'1px solid #0a4d68',paddingTop:8,width:180,marginTop:40,color:'#5a7184',fontSize:'0.8rem'}}>Doctor's Signature</div></div></div>
    </div>
  );
}

const emptyMed = { name:'', dosage:'', frequency:'', duration:'' };

export default function PrescriptionPage() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [printRx, setPrintRx] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const printRef = useRef();
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const [form, setForm] = useState({
    patient_id: user?.patient_id || '',
    doctor_id: user?.doctor_id || '',
    diagnosis: '',
    medicines: [{ ...emptyMed }],
    instructions: '',
  });

  const fetchData = () => {
    const params = {};
    if (user?.role === 'patient') params.patient_id = user.patient_id;
    if (user?.role === 'doctor') params.doctor_id = user.doctor_id;
    setPrescriptions(prescriptionsAPI.list(params));
    setPatients(patientsAPI.list());
    setDoctors(doctorsAPI.list());
  };
  useEffect(() => { fetchData(); }, []);

  const addMed = () => setForm(f => ({ ...f, medicines: [...f.medicines, { ...emptyMed }] }));
  const removeMed = (i) => setForm(f => ({ ...f, medicines: f.medicines.filter((_,j)=>j!==i) }));
  const updateMed = (i, key, val) => setForm(f => {
    const meds = [...f.medicines]; meds[i] = { ...meds[i], [key]: val }; return { ...f, medicines: meds };
  });

  const handleCreate = (e) => {
    e.preventDefault(); setError('');
    if (!form.patient_id || !form.doctor_id) { setError('Select patient and doctor'); return; }
    if (form.medicines.some(m => !m.name)) { setError('Fill all medicine names'); return; }
    try {
      prescriptionsAPI.create(form);
      setSuccess('Prescription created!');
      setShowForm(false); fetchData();
      setForm({ patient_id:'', doctor_id: user?.doctor_id||'', diagnosis:'', medicines:[{...emptyMed}], instructions:'' });
    } catch (err) { setError(err.message); }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this prescription?')) return;
    prescriptionsAPI.delete(id); fetchData();
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h1>Prescriptions</h1><p>Manage medical records and prescription history</p></div>
        {user?.role !== 'patient' && <button className="btn btn-accent" onClick={() => { setShowForm(!showForm); setError(''); setSuccess(''); }}>+ New Prescription</button>}
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:24}}>
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>New Prescription</h3>
          {error && <div style={{background:'#fde8e8',color:'#8b1a1a',padding:'12px 16px',borderRadius:8,marginBottom:16}}>{error}</div>}
          {success && <div style={{background:'#d4f7e0',color:'#155724',padding:'12px 16px',borderRadius:8,marginBottom:16}}>{success}</div>}
          <form onSubmit={handleCreate}>
            <div className="form-row">
              <div className="form-group">
                <label>Patient</label>
                <select value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})} required>
                  <option value="">-- Select patient --</option>
                  {patients.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Doctor</label>
                <select value={form.doctor_id} onChange={e=>setForm({...form,doctor_id:e.target.value})} required disabled={user?.role==='doctor'}>
                  <option value="">-- Select doctor --</option>
                  {doctors.map(d=><option key={d.id} value={d.id}>{d.full_name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group"><label>Diagnosis</label><input value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})} placeholder="Patient's diagnosis" required /></div>
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <label style={{fontWeight:600,fontSize:'0.85rem',textTransform:'uppercase',letterSpacing:'0.03em'}}>Medications</label>
                <button type="button" className="btn btn-outline btn-sm" onClick={addMed}>+ Add Medicine</button>
              </div>
              {form.medicines.map((m,i)=>(
                <div key={i} style={{display:'grid',gridTemplateColumns:'2fr 1fr 1fr 1fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
                  <input placeholder="Medicine name" value={m.name} onChange={e=>updateMed(i,'name',e.target.value)} style={{padding:'8px 12px',border:'2px solid var(--border)',borderRadius:8,fontFamily:'DM Sans'}} required />
                  <input placeholder="Dosage" value={m.dosage} onChange={e=>updateMed(i,'dosage',e.target.value)} style={{padding:'8px 12px',border:'2px solid var(--border)',borderRadius:8,fontFamily:'DM Sans'}} />
                  <input placeholder="Frequency" value={m.frequency} onChange={e=>updateMed(i,'frequency',e.target.value)} style={{padding:'8px 12px',border:'2px solid var(--border)',borderRadius:8,fontFamily:'DM Sans'}} />
                  <input placeholder="Duration" value={m.duration} onChange={e=>updateMed(i,'duration',e.target.value)} style={{padding:'8px 12px',border:'2px solid var(--border)',borderRadius:8,fontFamily:'DM Sans'}} />
                  {form.medicines.length > 1 && <button type="button" onClick={()=>removeMed(i)} style={{background:'var(--danger)',color:'white',border:'none',borderRadius:6,padding:'8px 10px',cursor:'pointer'}}>✕</button>}
                </div>
              ))}
            </div>
            <div className="form-group"><label>Special Instructions</label><textarea value={form.instructions} onChange={e=>setForm({...form,instructions:e.target.value})} placeholder="Take after meals, avoid alcohol..." /></div>
            <div className="flex gap-8">
              <button className="btn btn-primary" type="submit">Save Prescription</button>
              <button className="btn btn-outline" type="button" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Rx ID</th><th>Patient</th><th>Doctor</th><th>Diagnosis</th><th>Medicines</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {prescriptions.length === 0
                ? <tr><td colSpan={7} className="text-center" style={{color:'var(--text-muted)',padding:32}}>No prescriptions found</td></tr>
                : prescriptions.map(rx => (
                  <tr key={rx.id}>
                    <td><code style={{fontSize:'0.75rem'}}>{rx.rx_id}</code></td>
                    <td><strong>{rx.patient_name}</strong></td>
                    <td>{rx.doctor_name}</td>
                    <td>{rx.diagnosis}</td>
                    <td><span className="badge badge-info">{rx.medicines?.length||0} item(s)</span></td>
                    <td>{rx.created_at?.slice(0,10)}</td>
                    <td>
                      <div className="flex gap-8">
                        <button className="btn btn-outline btn-sm" onClick={() => { setPrintRx(rx); setTimeout(handlePrint, 100); }}>Print</button>
                        {user?.role !== 'patient' && <button className="btn btn-danger btn-sm" onClick={() => handleDelete(rx.id)}>Delete</button>}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
      <div style={{display:'none'}}><div ref={printRef}><RxPrint rx={printRx} /></div></div>
    </div>
  );
}
