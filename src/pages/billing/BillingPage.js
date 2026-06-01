import React, { useEffect, useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useReactToPrint } from 'react-to-print';
import { patientsAPI, billingAPI, admissionsAPI } from '../../utils/api';

function InvoicePrint({ invoice }) {
  if (!invoice) return null;
  const lineItems = [
    { label:'Consultation Charges', amount: invoice.consultation_charges },
    { label:'Bed Charges', amount: invoice.bed_charges },
    { label:'Medicine Charges', amount: invoice.medicine_charges },
    { label:'Other Charges', amount: invoice.other_charges },
  ].filter(i => i.amount > 0);
  return (
    <div style={{ fontFamily:'DM Sans,sans-serif', padding:48, background:'white', maxWidth:680 }}>
      <div style={{ display:'flex', justifyContent:'space-between', borderBottom:'3px solid #0a4d68', paddingBottom:20, marginBottom:30 }}>
        <div><div style={{fontSize:'2rem'}}>🏥</div><h2 style={{color:'#0a4d68',fontFamily:'DM Serif Display',marginTop:8}}>MediCare Hospital</h2><p style={{color:'#5a7184',fontSize:'0.85rem'}}>Quality Care, Always</p></div>
        <div style={{textAlign:'right'}}><h2 style={{color:'#0a4d68',fontFamily:'DM Serif Display',fontSize:'1.8rem'}}>INVOICE</h2><p style={{color:'#5a7184'}}><strong>Bill ID:</strong> {invoice.bill_id}</p><p style={{color:'#5a7184'}}><strong>Date:</strong> {invoice.created_at?.slice(0,10)}</p></div>
      </div>
      <div style={{marginBottom:28}}>
        <h4 style={{color:'#5a7184',fontSize:'0.8rem',textTransform:'uppercase',marginBottom:10}}>Patient Details</h4>
        <p><strong>{invoice.patient_name}</strong></p>
        <p style={{color:'#5a7184'}}>Age: {invoice.patient_age} | Gender: {invoice.patient_gender} | Blood: {invoice.patient_blood_group}</p>
        <p style={{color:'#5a7184'}}>Phone: {invoice.patient_phone}</p>
      </div>
      {invoice.admission && (
        <div style={{background:'#f0f4f8',padding:14,borderRadius:10,marginBottom:24}}>
          <h4 style={{color:'#5a7184',fontSize:'0.78rem',textTransform:'uppercase',marginBottom:8}}>Admission Details</h4>
          <p style={{fontSize:'0.9rem'}}>Bed: <strong>{invoice.admission.bed_number}</strong> | Ward: <strong>{invoice.admission.ward}</strong> | Days: <strong>{invoice.admission.days_stayed}</strong></p>
          <p style={{fontSize:'0.9rem',color:'#5a7184'}}>Admitted: {invoice.admission.admission_date} → Discharged: {invoice.admission.discharge_date}</p>
        </div>
      )}
      <table style={{width:'100%',borderCollapse:'collapse',marginBottom:20}}>
        <thead><tr style={{background:'#f0f4f8'}}><th style={{padding:'12px 16px',textAlign:'left',fontWeight:600,fontSize:'0.85rem'}}>Description</th><th style={{padding:'12px 16px',textAlign:'right',fontWeight:600,fontSize:'0.85rem'}}>Amount</th></tr></thead>
        <tbody>
          {lineItems.map((item,i) => (
            <tr key={i}><td style={{padding:'10px 16px',borderBottom:'1px solid #d1dce8'}}>{item.label}</td><td style={{padding:'10px 16px',textAlign:'right',borderBottom:'1px solid #d1dce8'}}>₹{item.amount.toFixed(2)}</td></tr>
          ))}
          {invoice.discount > 0 && <tr><td style={{padding:'10px 16px',borderBottom:'1px solid #d1dce8',color:'#2dc653'}}>Discount</td><td style={{padding:'10px 16px',textAlign:'right',borderBottom:'1px solid #d1dce8',color:'#2dc653'}}>-₹{invoice.discount.toFixed(2)}</td></tr>}
        </tbody>
      </table>
      <div style={{background:'#0a4d68',color:'white',padding:'20px 24px',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
        <span style={{fontSize:'1.1rem',fontWeight:600}}>Total Amount</span>
        <span style={{fontSize:'2rem',fontFamily:'DM Serif Display'}}>₹{invoice.total_amount?.toFixed(2)}</span>
      </div>
      <div style={{display:'flex',justifyContent:'space-between',color:'#5a7184',fontSize:'0.9rem'}}>
        <span>Payment Method: <strong style={{textTransform:'capitalize'}}>{invoice.payment_method}</strong></span>
        <span>Status: <strong style={{color: invoice.payment_status==='paid'?'#2dc653':'#f4a261',textTransform:'capitalize'}}>{invoice.payment_status}</strong></span>
      </div>
      <div style={{textAlign:'center',marginTop:40,color:'#5a7184',fontSize:'0.8rem',borderTop:'1px solid #d1dce8',paddingTop:16}}>Thank you for choosing MediCare Hospital. Get well soon! 💙</div>
    </div>
  );
}

export default function BillingPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const printRef = useRef();
  const state = location.state || {};
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const [patients, setPatients] = useState([]);
  const [allBills, setAllBills] = useState([]);
  const [stage, setStage] = useState('list');
  const [generatedBill, setGeneratedBill] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState('');
  const [admissions, setAdmissions] = useState([]);

  const [form, setForm] = useState({
    patient_id: state.patient_id || '',
    admission_id: '',
    consultation_charges: 0,
    bed_charges: state.bed_charges || 0,
    medicine_charges: state.medicine_charges || 0,
    other_charges: 0,
    discount: 0,
    payment_method: 'cash'
  });

  useEffect(() => {
    setPatients(patientsAPI.list());
    setAllBills(billingAPI.list());
    if (state.patient_id) {
      const patAdmissions = admissionsAPI.list().filter(a => a.patient_id === parseInt(state.patient_id) && a.status === 'discharged');
      setAdmissions(patAdmissions);
    }
  }, []);

  const handlePatientChange = (pid) => {
    setForm(f => ({ ...f, patient_id: pid, admission_id:'' }));
    const patAdmissions = admissionsAPI.list().filter(a => a.patient_id === parseInt(pid) && a.status === 'discharged');
    setAdmissions(patAdmissions);
  };

  const handleAdmissionSelect = (admId) => {
    if (!admId) { setForm(f=>({...f,admission_id:'',bed_charges:0})); return; }
    const adm = admissionsAPI.get(admId);
    setForm(f => ({ ...f, admission_id: admId, bed_charges: adm.total_bed_charges || 0 }));
  };

  const total = ['consultation_charges','bed_charges','medicine_charges','other_charges'].reduce((s,k)=>s+parseFloat(form[k]||0),0) - parseFloat(form.discount||0);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!form.patient_id) { setError('Please select a patient'); return; }
    setError('');
    try {
      const bill = billingAPI.generate(form);
      setGeneratedBill(bill); setStage('payment');
    } catch (err) { setError(err.message||'Failed'); }
  };

  const handleConfirmPayment = () => {
    billingAPI.confirm(generatedBill.id);
    const inv = billingAPI.invoice(generatedBill.id);
    setInvoice(inv); setStage('invoice');
    setAllBills(billingAPI.list());
  };

  const viewInvoice = (id) => {
    const inv = billingAPI.invoice(id);
    setInvoice(inv); setStage('invoice');
  };

  const statusBadge = (s) => <span className={`badge ${s==='paid'?'badge-success':'badge-warning'}`}>{s}</span>;
  const f = (key) => ({ value: form[key], onChange: e => setForm({...form,[key]:e.target.value}) });

  return (
    <div>
      <div className="page-header flex justify-between items-center">
        <div><h1>Billing & Invoice</h1><p>Generate and manage patient invoices</p></div>
        <div className="flex gap-8">
          {stage !== 'list' && <button className="btn btn-outline" onClick={() => setStage('list')}>← All Bills</button>}
          {stage === 'list' && <button className="btn btn-accent" onClick={() => { setStage('generate'); setError(''); }}>+ Generate Bill</button>}
        </div>
      </div>

      {stage === 'list' && (
        <div className="card">
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>All Bills</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Bill ID</th><th>Patient</th><th>Consultation</th><th>Bed</th><th>Medicine</th><th>Total</th><th>Status</th><th>Actions</th></tr></thead>
              <tbody>
                {allBills.length === 0
                  ? <tr><td colSpan={8} className="text-center" style={{color:'var(--text-muted)',padding:32}}>No bills yet. <span className="link" onClick={()=>setStage('generate')}>Create one →</span></td></tr>
                  : allBills.map(b => (
                    <tr key={b.id}>
                      <td><code style={{fontSize:'0.78rem'}}>{b.bill_id}</code></td>
                      <td><strong>{b.patient_name}</strong></td>
                      <td>₹{b.consultation_charges}</td>
                      <td>₹{b.bed_charges}</td>
                      <td>₹{b.medicine_charges}</td>
                      <td><strong>₹{b.total_amount?.toFixed(2)}</strong></td>
                      <td>{statusBadge(b.payment_status)}</td>
                      <td><button className="btn btn-outline btn-sm" onClick={() => viewInvoice(b.id)}>View Invoice</button></td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {stage === 'generate' && (
        <div className="card" style={{maxWidth:620}}>
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>Generate Bill</h3>
          {error && <div style={{background:'#fde8e8',color:'#8b1a1a',padding:'12px 16px',borderRadius:8,marginBottom:20}}>{error}</div>}
          <form onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Patient</label>
              <select value={form.patient_id} onChange={e=>handlePatientChange(e.target.value)} required>
                <option value="">-- Select patient --</option>
                {patients.map(p=><option key={p.id} value={p.id}>{p.full_name}</option>)}
              </select>
            </div>
            {admissions.length > 0 && (
              <div className="form-group">
                <label>Link to Admission (optional)</label>
                <select value={form.admission_id} onChange={e=>handleAdmissionSelect(e.target.value)}>
                  <option value="">-- No admission --</option>
                  {admissions.map(a=><option key={a.id} value={a.id}>{a.adm_id} — {a.ward} Ward — ₹{a.total_bed_charges}</option>)}
                </select>
              </div>
            )}
            <div className="form-row">
              <div className="form-group"><label>Consultation (₹)</label><input type="number" step="0.01" min="0" {...f('consultation_charges')} /></div>
              <div className="form-group"><label>Bed Charges (₹)</label><input type="number" step="0.01" min="0" {...f('bed_charges')} /></div>
            </div>
            <div className="form-row">
              <div className="form-group"><label>Medicine (₹)</label><input type="number" step="0.01" min="0" {...f('medicine_charges')} /></div>
              <div className="form-group"><label>Other Charges (₹)</label><input type="number" step="0.01" min="0" {...f('other_charges')} /></div>
            </div>
            <div className="form-group"><label>Discount (₹)</label><input type="number" step="0.01" min="0" {...f('discount')} /></div>
            <div style={{background:'var(--bg)',padding:16,borderRadius:10,marginBottom:20}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'1.1rem',fontWeight:700}}><span>Total Amount</span><span style={{color:'var(--primary)'}}>₹{Math.max(0,total).toFixed(2)}</span></div>
            </div>
            <div className="form-group">
              <label>Payment Method</label>
              <select {...f('payment_method')}>
                <option value="cash">Cash</option><option value="card">Card</option><option value="upi">UPI</option><option value="insurance">Insurance</option>
              </select>
            </div>
            <button className="btn btn-primary" type="submit">Generate Bill</button>
          </form>
        </div>
      )}

      {stage === 'payment' && generatedBill && (
        <div className="card" style={{maxWidth:500}}>
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>Confirm Payment</h3>
          <div style={{background:'var(--bg)',padding:20,borderRadius:10,marginBottom:24}}>
            {[['Bill ID',<code>{generatedBill.bill_id}</code>],['Consultation',`₹${generatedBill.consultation_charges}`],['Bed Charges',`₹${generatedBill.bed_charges}`],['Medicine',`₹${generatedBill.medicine_charges}`],['Discount',`-₹${generatedBill.discount}`],['Payment',<span style={{textTransform:'capitalize'}}>{generatedBill.payment_method}</span>]].map(([l,v],i)=>(
              <div key={i} style={{display:'flex',justifyContent:'space-between',marginBottom:10,paddingBottom:10,borderBottom:'1px solid var(--border)'}}><span style={{color:'var(--text-muted)'}}>{l}</span><span>{v}</span></div>
            ))}
          </div>
          <div style={{background:'var(--primary)',color:'white',padding:'20px 24px',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <span>Total Amount</span><span style={{fontSize:'2rem',fontFamily:'DM Serif Display'}}>₹{generatedBill.total_amount?.toFixed(2)}</span>
          </div>
          <button className="btn btn-success w-full" onClick={handleConfirmPayment}>✓ Confirm Payment Received</button>
        </div>
      )}

      {stage === 'invoice' && invoice && (
        <div>
          <div style={{marginBottom:16,display:'flex',gap:12}}>
            <button className="btn btn-accent" onClick={handlePrint}>📄 Print / Download PDF</button>
            <button className="btn btn-outline" onClick={() => { setStage('generate'); setForm({ patient_id:'',admission_id:'',consultation_charges:0,bed_charges:0,medicine_charges:0,other_charges:0,discount:0,payment_method:'cash' }); setGeneratedBill(null); setInvoice(null); }}>New Bill</button>
          </div>
          <div ref={printRef}><InvoicePrint invoice={invoice} /></div>
        </div>
      )}
    </div>
  );
}
