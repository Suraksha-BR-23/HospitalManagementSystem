import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientsAPI, pharmacyAPI } from '../../utils/api';

const emptyItem = { name:'', quantity:1, price:0 };

export default function PharmacyBilling() {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [bills, setBills] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ patient_id:'', items:[{...emptyItem}], payment_mode:'cash' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setPatients(patientsAPI.list());
    setBills(pharmacyAPI.list().map(b => {
      const pat = patientsAPI.list().find(p => p.id === b.patient_id);
      return { ...b, patient_name: pat?.full_name||'Unknown' };
    }));
  }, []);

  const addItem = () => setForm(f => ({ ...f, items:[...f.items, {...emptyItem}] }));
  const removeItem = (i) => setForm(f => ({ ...f, items: f.items.filter((_,j)=>j!==i) }));
  const updateItem = (i, key, val) => setForm(f => {
    const items = [...f.items]; items[i]={...items[i],[key]:val}; return {...f, items};
  });
  const total = form.items.reduce((s,m) => s + (parseFloat(m.price||0)*parseInt(m.quantity||0)), 0);

  const handleSubmit = (e) => {
    e.preventDefault(); setError('');
    if (!form.patient_id) { setError('Select a patient'); return; }
    if (form.items.some(m => !m.name)) { setError('Fill all medicine names'); return; }
    try {
      const res = pharmacyAPI.createBill(form);
      setSuccess('Pharmacy bill created!');
      setTimeout(() => navigate('/billing', { state: { pharmacy_bill_id: res.id, patient_id: parseInt(form.patient_id), medicine_charges: res.total_amount } }), 1000);
    } catch (err) { setError(err.message||'Failed'); }
  };

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h1>Pharmacy</h1><p>Manage medicine bills and stock</p></div>
        <button className="btn btn-accent" onClick={() => setShowForm(!showForm)}>+ New Medicine Bill</button>
      </div>

      {showForm && (
        <div className="card" style={{marginBottom:24,maxWidth:700}}>
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>Create Medicine Bill</h3>
          {error && <div style={{background:'#fde8e8',color:'#8b1a1a',padding:'12px 16px',borderRadius:8,marginBottom:16}}>{error}</div>}
          {success && <div style={{background:'#d4f7e0',color:'#155724',padding:'12px 16px',borderRadius:8,marginBottom:16}}>{success}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Patient</label>
              <select value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})} required>
                <option value="">-- Select patient --</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            <div style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:10}}>
                <label style={{fontWeight:600,fontSize:'0.85rem',textTransform:'uppercase',letterSpacing:'0.03em'}}>Medicines</label>
                <button type="button" className="btn btn-outline btn-sm" onClick={addItem}>+ Add Item</button>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'3fr 1fr 1fr auto',gap:4,marginBottom:6}}>
                <span style={{fontSize:'0.78rem',color:'var(--text-muted)',padding:'0 8px'}}>Medicine Name</span>
                <span style={{fontSize:'0.78rem',color:'var(--text-muted)',padding:'0 8px'}}>Qty</span>
                <span style={{fontSize:'0.78rem',color:'var(--text-muted)',padding:'0 8px'}}>Price (₹)</span>
                <span></span>
              </div>
              {form.items.map((m,i) => (
                <div key={i} style={{display:'grid',gridTemplateColumns:'3fr 1fr 1fr auto',gap:8,marginBottom:8,alignItems:'center'}}>
                  <input placeholder="e.g. Paracetamol 500mg" value={m.name} onChange={e=>updateItem(i,'name',e.target.value)} style={{padding:'8px 12px',border:'2px solid var(--border)',borderRadius:8,fontFamily:'DM Sans'}} required />
                  <input type="number" min="1" value={m.quantity} onChange={e=>updateItem(i,'quantity',e.target.value)} style={{padding:'8px 12px',border:'2px solid var(--border)',borderRadius:8,fontFamily:'DM Sans'}} />
                  <input type="number" min="0" step="0.01" value={m.price} onChange={e=>updateItem(i,'price',e.target.value)} style={{padding:'8px 12px',border:'2px solid var(--border)',borderRadius:8,fontFamily:'DM Sans'}} />
                  {form.items.length > 1 && <button type="button" onClick={()=>removeItem(i)} style={{background:'var(--danger)',color:'white',border:'none',borderRadius:6,padding:'8px 10px',cursor:'pointer'}}>✕</button>}
                </div>
              ))}
              <div style={{textAlign:'right',fontWeight:700,fontSize:'1.1rem',color:'var(--primary)',marginTop:8}}>Total: ₹{total.toFixed(2)}</div>
            </div>
            <div className="form-group">
              <label>Payment Mode</label>
              <select value={form.payment_mode} onChange={e=>setForm({...form,payment_mode:e.target.value})}>
                <option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="insurance">Insurance</option>
              </select>
            </div>
            <div className="flex gap-8">
              <button className="btn btn-primary" type="submit">Generate Bill & Go to Billing</button>
              <button className="btn btn-outline" type="button" onClick={()=>setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h3 style={{marginBottom:20,color:'var(--primary)'}}>Pharmacy Bills</h3>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Bill ID</th><th>Patient</th><th>Items</th><th>Total</th><th>Mode</th><th>Date</th></tr></thead>
            <tbody>
              {bills.length === 0
                ? <tr><td colSpan={6} className="text-center" style={{color:'var(--text-muted)',padding:32}}>No pharmacy bills yet</td></tr>
                : bills.map(b => (
                  <tr key={b.id}>
                    <td><code style={{fontSize:'0.78rem'}}>{b.bill_id}</code></td>
                    <td><strong>{b.patient_name}</strong></td>
                    <td><span className="badge badge-info">{b.items?.length||0} item(s)</span></td>
                    <td><strong>₹{b.total_amount?.toFixed(2)}</strong></td>
                    <td style={{textTransform:'capitalize'}}>{b.payment_mode}</td>
                    <td>{b.created_at?.slice(0,10)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
