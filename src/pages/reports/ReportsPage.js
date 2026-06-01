import React, { useEffect, useState } from 'react';
import { reportsAPI, billingAPI } from '../../utils/api';

export default function ReportsPage() {
  const [tab, setTab] = useState('patient');
  const [patientReport, setPatientReport] = useState([]);
  const [billingReport, setBillingReport] = useState([]);
  const [revenueReport, setRevenueReport] = useState([]);
  const [stats, setStats] = useState({});

  useEffect(() => {
    setPatientReport(reportsAPI.patientReport());
    setBillingReport(reportsAPI.billingReport());
    setRevenueReport(reportsAPI.revenueReport());
    setStats(billingAPI.stats());
  }, []);

  const maxRevenue = Math.max(...revenueReport.map(r=>r.revenue), 1);

  const tabs = [['patient','👤 Patient Reports'],['billing','🧾 Billing Reports'],['revenue','📈 Revenue']];

  return (
    <div>
      <div className="page-header"><h1>Reports & Analytics</h1><p>Hospital performance insights</p></div>
      <div className="stat-grid" style={{gridTemplateColumns:'repeat(3,1fr)',marginBottom:28}}>
        <div className="stat-card"><div className="stat-icon">💰</div><div className="stat-value">₹{stats.total_revenue?.toLocaleString()}</div><div className="stat-label">Total Revenue</div></div>
        <div className="stat-card" style={{borderLeftColor:'#2dc653'}}><div className="stat-icon">✅</div><div className="stat-value">{stats.paid}</div><div className="stat-label">Bills Paid</div></div>
        <div className="stat-card" style={{borderLeftColor:'#f4a261'}}><div className="stat-icon">⏳</div><div className="stat-value">{stats.pending}</div><div className="stat-label">Bills Pending</div></div>
      </div>

      <div style={{display:'flex',gap:8,marginBottom:24,borderBottom:'2px solid var(--border)'}}>
        {tabs.map(([t,l]) => (
          <button key={t} onClick={()=>setTab(t)} style={{padding:'10px 20px',border:'none',borderBottom:tab===t?'3px solid var(--accent)':'3px solid transparent',background:'none',fontFamily:'DM Sans',fontWeight:tab===t?600:400,color:tab===t?'var(--primary)':'var(--text-muted)',cursor:'pointer',fontSize:'0.9rem'}}>{l}</button>
        ))}
      </div>

      {tab === 'patient' && (
        <div className="card">
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>Patient Report</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Patient</th><th>Age</th><th>Gender</th><th>Blood Group</th><th>Total Appointments</th><th>Last Visit</th></tr></thead>
              <tbody>
                {patientReport.length === 0
                  ? <tr><td colSpan={6} className="text-center" style={{color:'var(--text-muted)',padding:32}}>No patient data</td></tr>
                  : patientReport.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.full_name}</strong><div style={{fontSize:'0.8rem',color:'var(--text-muted)'}}>{p.email}</div></td>
                      <td>{p.age}</td>
                      <td style={{textTransform:'capitalize'}}>{p.gender}</td>
                      <td><span className="badge badge-danger">{p.blood_group}</span></td>
                      <td><span className="badge badge-info">{p.total_appointments}</span></td>
                      <td>{p.last_visit}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'billing' && (
        <div className="card">
          <h3 style={{marginBottom:20,color:'var(--primary)'}}>Billing Report</h3>
          <div className="table-wrapper">
            <table>
              <thead><tr><th>Bill ID</th><th>Patient</th><th>Consultation</th><th>Bed</th><th>Medicine</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
              <tbody>
                {billingReport.length === 0
                  ? <tr><td colSpan={8} className="text-center" style={{color:'var(--text-muted)',padding:32}}>No billing data</td></tr>
                  : billingReport.map(b => (
                    <tr key={b.id}>
                      <td><code style={{fontSize:'0.75rem'}}>{b.bill_id}</code></td>
                      <td><strong>{b.patient_name}</strong></td>
                      <td>₹{b.consultation_charges}</td>
                      <td>₹{b.bed_charges}</td>
                      <td>₹{b.medicine_charges}</td>
                      <td><strong>₹{b.total_amount?.toFixed(2)}</strong></td>
                      <td><span className={`badge ${b.payment_status==='paid'?'badge-success':'badge-warning'}`}>{b.payment_status}</span></td>
                      <td>{b.created_at?.slice(0,10)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'revenue' && (
        <div className="card">
          <h3 style={{marginBottom:24,color:'var(--primary)'}}>Monthly Revenue</h3>
          {revenueReport.length === 0
            ? <p style={{color:'var(--text-muted)',textAlign:'center',padding:32}}>No revenue data yet</p>
            : (
              <div>
                {revenueReport.map((r,i) => (
                  <div key={i} style={{marginBottom:16}}>
                    <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                      <span style={{fontWeight:600}}>{r.month}</span>
                      <span style={{color:'var(--primary)',fontWeight:700}}>₹{r.revenue.toLocaleString()}</span>
                    </div>
                    <div style={{background:'var(--bg)',borderRadius:8,height:28,overflow:'hidden'}}>
                      <div style={{width:`${(r.revenue/maxRevenue)*100}%`,background:'linear-gradient(90deg,var(--accent),var(--primary))',height:'100%',borderRadius:8,transition:'width 0.5s'}}></div>
                    </div>
                  </div>
                ))}
                <div style={{marginTop:24,padding:20,background:'var(--bg)',borderRadius:12,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{color:'var(--text-muted)'}}>Total Collected Revenue</span>
                  <span style={{fontSize:'1.6rem',fontFamily:'DM Serif Display',color:'var(--primary)',fontWeight:700}}>₹{revenueReport.reduce((s,r)=>s+r.revenue,0).toLocaleString()}</span>
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
}
