// ─── MediCare HMS — localStorage API (No backend required) ───────────────────
const get = (key, fallback = []) => {
  try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
};
const set = (key, value) => localStorage.setItem(key, JSON.stringify(value));
const nextId = (arr) => (arr.length ? Math.max(...arr.map(x => x.id ?? 0)) + 1 : 1);
const uid = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// ─── Seed ────────────────────────────────────────────────────────────────────
const seedDefaults = () => {
  if (get('hms_seeded', false)) return;
  set('hms_users', [
    { id: 1, email: 'admin@hospital.com',  password: 'admin123',  role: 'admin',      name: 'Administrator' },
    { id: 2, email: 'pharma@hospital.com', password: 'pharma123', role: 'pharmacist', name: 'Pharmacist' },
  ]);
  set('hms_doctors', []);
  set('hms_patients', []);
  set('hms_appointments', []);
  set('hms_prescriptions', []);
  set('hms_pharmacy_bills', []);
  set('hms_billing', []);
  set('hms_admissions', []);
  set('hms_beds', [
    ...Array.from({length:5}, (_,i) => ({ id: i+1, number:`G-10${i+1}`, ward:'General',    type:'general',   rate:500,  status:'available' })),
    ...Array.from({length:4}, (_,i) => ({ id: i+6, number:`P-20${i+1}`, ward:'Private',    type:'private',   rate:1500, status:'available' })),
    ...Array.from({length:3}, (_,i) => ({ id: i+10,number:`I-30${i+1}`, ward:'ICU',        type:'icu',       rate:3500, status:'available' })),
    ...Array.from({length:2}, (_,i) => ({ id: i+13,number:`E-40${i+1}`, ward:'Emergency',  type:'emergency', rate:2000, status:'available' })),
  ]);
  set('hms_seeded', true);
};
seedDefaults();

// ─── AUTH ────────────────────────────────────────────────────────────────────
export const authAPI = {
  login(email, password, role) {
    const users = get('hms_users');
    const user = users.find(u => u.email === email && u.role === role);
    if (!user) throw new Error(`No ${role} account found with this email`);
    if (user.password !== password) throw new Error('Incorrect password');
    const token = btoa(`${user.id}:${user.role}:${Date.now()}`);
    const extra = {};
    if (role === 'doctor') {
      const doc = get('hms_doctors').find(d => d.user_id === user.id);
      if (doc) { extra.name = doc.full_name; extra.doctor_id = doc.id; }
    } else if (role === 'patient') {
      const pat = get('hms_patients').find(p => p.user_id === user.id);
      if (pat) { extra.name = pat.full_name; extra.patient_id = pat.id; }
    } else { extra.name = user.name; }
    return { token, role: user.role, email: user.email, ...extra };
  },
  registerPatient(data) {
    const users = get('hms_users');
    if (users.find(u => u.email === data.email)) throw new Error('Email already registered');
    const newUser = { id: nextId(users), email: data.email, password: data.password, role: 'patient', name: data.full_name };
    users.push(newUser); set('hms_users', users);
    const patients = get('hms_patients');
    const { confirm_password, password, ...rest } = data;
    const newPat = { id: nextId(patients), user_id: newUser.id, ...rest };
    patients.push(newPat); set('hms_patients', patients);
    return { message: 'Patient registered successfully' };
  },
  registerDoctor(data) {
    const users = get('hms_users');
    if (users.find(u => u.email === data.email)) throw new Error('Email already registered');
    const newUser = { id: nextId(users), email: data.email, password: data.password || 'doctor@123', role: 'doctor', name: data.full_name };
    users.push(newUser); set('hms_users', users);
    const doctors = get('hms_doctors');
    const newDoc = {
      id: nextId(doctors), user_id: newUser.id,
      full_name: data.full_name, email: data.email, phone_number: data.phone_number,
      specialization: data.specialization, qualification: data.qualification,
      experience: parseInt(data.experience), consultation_fee: parseFloat(data.consultation_fee),
      available_days: Array.isArray(data.available_days) ? data.available_days.join(',') : data.available_days,
      available_timing: data.available_timing,
    };
    doctors.push(newDoc); set('hms_doctors', doctors);
    return { message: 'Doctor registered successfully' };
  },
  forgotPassword(email) {
    if (!get('hms_users').find(u => u.email === email)) throw new Error('Email not found');
    return { message: 'Reset link sent' };
  },
};

// ─── DOCTORS ─────────────────────────────────────────────────────────────────
export const doctorsAPI = {
  list({ search='', specialization='' } = {}) {
    let docs = get('hms_doctors');
    if (search) docs = docs.filter(d => d.full_name.toLowerCase().includes(search.toLowerCase()));
    if (specialization) docs = docs.filter(d => d.specialization === specialization);
    return docs;
  },
  getById(id) { return get('hms_doctors').find(d => d.id === parseInt(id)); },
  dashboard(id) {
    const doc = get('hms_doctors').find(d => d.id === parseInt(id));
    if (!doc) throw new Error('Doctor not found');
    const appts = get('hms_appointments').filter(a => a.doctor_id === doc.id);
    const upcoming = appts.filter(a => a.status === 'scheduled');
    const patientIds = [...new Set(appts.map(a => a.patient_id))];
    return {
      ...doc, total_appointments: appts.length, patient_count: patientIds.length,
      upcoming_appointments: upcoming.map(a => {
        const pat = get('hms_patients').find(p => p.id === a.patient_id);
        return { ...a, patient_name: pat?.full_name || 'Unknown' };
      }),
    };
  },
  update(id, data) {
    const docs = get('hms_doctors');
    const idx = docs.findIndex(d => d.id === parseInt(id));
    if (idx === -1) throw new Error('Doctor not found');
    docs[idx] = { ...docs[idx], ...data }; set('hms_doctors', docs); return docs[idx];
  },
  delete(id) { set('hms_doctors', get('hms_doctors').filter(d => d.id !== parseInt(id))); },
};

// ─── PATIENTS ────────────────────────────────────────────────────────────────
export const patientsAPI = {
  list() { return get('hms_patients'); },
  get(id) {
    const pat = get('hms_patients').find(p => p.id === parseInt(id));
    if (!pat) throw new Error('Patient not found');
    const appts = get('hms_appointments').filter(a => a.patient_id === pat.id).map(a => {
      const doc = get('hms_doctors').find(d => d.id === a.doctor_id);
      return { ...a, doctor_name: doc?.full_name || 'Unknown' };
    });
    const bills = get('hms_billing').filter(b => b.patient_id === pat.id);
    const admissions = get('hms_admissions').filter(a => a.patient_id === pat.id);
    return { ...pat, appointment_history: appts, billing_history: bills, admissions };
  },
  update(id, data) {
    const patients = get('hms_patients');
    const idx = patients.findIndex(p => p.id === parseInt(id));
    if (idx === -1) throw new Error('Patient not found');
    patients[idx] = { ...patients[idx], ...data }; set('hms_patients', patients); return patients[idx];
  },
};

// ─── APPOINTMENTS ────────────────────────────────────────────────────────────
const TIME_SLOTS = ['09:00 AM','09:30 AM','10:00 AM','10:30 AM','11:00 AM','11:30 AM',
  '12:00 PM','02:00 PM','02:30 PM','03:00 PM','03:30 PM','04:00 PM','04:30 PM','05:00 PM'];

export const appointmentsAPI = {
  list({ patient_id, doctor_id, date } = {}) {
    let appts = get('hms_appointments');
    if (patient_id) appts = appts.filter(a => a.patient_id === parseInt(patient_id));
    if (doctor_id)  appts = appts.filter(a => a.doctor_id  === parseInt(doctor_id));
    if (date)       appts = appts.filter(a => a.date === date);
    return appts.map(a => {
      const pat = get('hms_patients').find(p => p.id === a.patient_id);
      const doc = get('hms_doctors').find(d => d.id === a.doctor_id);
      return { ...a, patient_name: pat?.full_name||'Unknown', doctor_name: doc?.full_name||'Unknown', specialization: doc?.specialization||'' };
    });
  },
  slots(doctor_id, date) {
    const taken = get('hms_appointments').filter(a => a.doctor_id===parseInt(doctor_id) && a.date===date && a.status!=='cancelled').map(a=>a.time_slot);
    return TIME_SLOTS.filter(s => !taken.includes(s));
  },
  book({ doctor_id, patient_id, date, time_slot, reason }) {
    const appts = get('hms_appointments');
    if (appts.find(a => a.doctor_id===parseInt(doctor_id) && a.date===date && a.time_slot===time_slot && a.status!=='cancelled'))
      throw new Error('This slot is already booked');
    const newAppt = { id: nextId(appts), doctor_id: parseInt(doctor_id), patient_id: parseInt(patient_id), date, time_slot, reason: reason||'', status: 'scheduled', created_at: new Date().toISOString() };
    appts.push(newAppt); set('hms_appointments', appts); return newAppt;
  },
  updateStatus(id, status) {
    const appts = get('hms_appointments');
    const idx = appts.findIndex(a => a.id === parseInt(id));
    appts[idx].status = status; set('hms_appointments', appts); return appts[idx];
  },
  reschedule(id, { date, time_slot }) {
    const appts = get('hms_appointments');
    const idx = appts.findIndex(a => a.id === parseInt(id));
    appts[idx].date = date; appts[idx].time_slot = time_slot; set('hms_appointments', appts); return appts[idx];
  },
};

// ─── PRESCRIPTIONS ───────────────────────────────────────────────────────────
export const prescriptionsAPI = {
  list({ patient_id, doctor_id } = {}) {
    let rx = get('hms_prescriptions');
    if (patient_id) rx = rx.filter(p => p.patient_id === parseInt(patient_id));
    if (doctor_id)  rx = rx.filter(p => p.doctor_id  === parseInt(doctor_id));
    return rx.map(p => {
      const pat = get('hms_patients').find(x => x.id === p.patient_id);
      const doc = get('hms_doctors').find(x => x.id === p.doctor_id);
      return { ...p, patient_name: pat?.full_name||'Unknown', doctor_name: doc?.full_name||'Unknown' };
    });
  },
  create(data) {
    const rx = get('hms_prescriptions');
    const newRx = { id: nextId(rx), rx_id: `RX-${uid()}`, ...data, doctor_id: parseInt(data.doctor_id), patient_id: parseInt(data.patient_id), created_at: new Date().toISOString() };
    rx.push(newRx); set('hms_prescriptions', rx); return newRx;
  },
  delete(id) { set('hms_prescriptions', get('hms_prescriptions').filter(p => p.id !== parseInt(id))); },
};

// ─── BEDS & ADMISSIONS ───────────────────────────────────────────────────────
export const bedsAPI = {
  list() { return get('hms_beds'); },
  available() { return get('hms_beds').filter(b => b.status === 'available'); },
  update(id, data) {
    const beds = get('hms_beds');
    const idx = beds.findIndex(b => b.id === parseInt(id));
    beds[idx] = { ...beds[idx], ...data }; set('hms_beds', beds); return beds[idx];
  },
  stats() {
    const beds = get('hms_beds');
    return { total: beds.length, available: beds.filter(b=>b.status==='available').length, occupied: beds.filter(b=>b.status==='occupied').length };
  },
};

export const admissionsAPI = {
  list() {
    return get('hms_admissions').map(a => {
      const pat = get('hms_patients').find(p => p.id === a.patient_id);
      const doc = get('hms_doctors').find(d => d.id === a.doctor_id);
      const bed = get('hms_beds').find(b => b.id === a.bed_id);
      return { ...a, patient_name: pat?.full_name||'Unknown', doctor_name: doc?.full_name||'Unknown', bed_number: bed?.number||'?', ward: bed?.ward||'?', bed_rate: bed?.rate||0 };
    });
  },
  admit({ patient_id, doctor_id, bed_id, admission_date, diagnosis, notes }) {
    const admissions = get('hms_admissions');
    const active = admissions.find(a => a.patient_id===parseInt(patient_id) && a.status==='admitted');
    if (active) throw new Error('Patient already has an active admission');
    const bed = get('hms_beds').find(b => b.id===parseInt(bed_id));
    if (!bed || bed.status !== 'available') throw new Error('Bed is not available');
    const newAdm = {
      id: nextId(admissions), adm_id: `ADM-${uid()}`,
      patient_id: parseInt(patient_id), doctor_id: parseInt(doctor_id), bed_id: parseInt(bed_id),
      admission_date, diagnosis, notes: notes||'', status: 'admitted',
      created_at: new Date().toISOString(), discharge_date: null, total_bed_charges: null,
    };
    admissions.push(newAdm); set('hms_admissions', admissions);
    bedsAPI.update(bed_id, { status: 'occupied' });
    return newAdm;
  },
  discharge(id, { discharge_date, discharge_notes }) {
    const admissions = get('hms_admissions');
    const idx = admissions.findIndex(a => a.id === parseInt(id));
    if (idx === -1) throw new Error('Admission not found');
    const adm = admissions[idx];
    const bed = get('hms_beds').find(b => b.id === adm.bed_id);
    const rate = bed?.rate || 0;
    const days = Math.max(1, Math.ceil((new Date(discharge_date) - new Date(adm.admission_date)) / (1000*60*60*24)));
    const total_bed_charges = days * rate;
    admissions[idx] = { ...adm, status: 'discharged', discharge_date, discharge_notes: discharge_notes||'', days_stayed: days, total_bed_charges };
    set('hms_admissions', admissions);
    bedsAPI.update(adm.bed_id, { status: 'available' });
    return admissions[idx];
  },
  get(id) {
    const adm = get('hms_admissions').find(a => a.id === parseInt(id));
    if (!adm) throw new Error('Not found');
    const pat = get('hms_patients').find(p => p.id === adm.patient_id);
    const doc = get('hms_doctors').find(d => d.id === adm.doctor_id);
    const bed = get('hms_beds').find(b => b.id === adm.bed_id);
    return { ...adm, patient_name: pat?.full_name||'Unknown', patient_age: pat?.age||'', patient_blood_group: pat?.blood_group||'', doctor_name: doc?.full_name||'Unknown', bed_number: bed?.number||'?', ward: bed?.ward||'?', bed_type: bed?.type||'', bed_rate: bed?.rate||0 };
  },
};

// ─── PHARMACY ────────────────────────────────────────────────────────────────
export const pharmacyAPI = {
  list() { return get('hms_pharmacy_bills'); },
  createBill({ patient_id, items, payment_mode }) {
    const bills = get('hms_pharmacy_bills');
    const total_amount = items.reduce((s, m) => s + (parseFloat(m.price)*parseInt(m.quantity)), 0);
    const newBill = { id: nextId(bills), bill_id: `PH-${uid()}`, patient_id: parseInt(patient_id), items, total_amount, payment_mode, created_at: new Date().toISOString() };
    bills.push(newBill); set('hms_pharmacy_bills', bills);
    return newBill;
  },
};

// ─── BILLING ─────────────────────────────────────────────────────────────────
export const billingAPI = {
  list() {
    return get('hms_billing').map(b => {
      const pat = get('hms_patients').find(p => p.id === b.patient_id);
      return { ...b, patient_name: pat?.full_name||'Unknown' };
    });
  },
  generate({ patient_id, admission_id, consultation_charges, bed_charges, medicine_charges, other_charges, discount, payment_method }) {
    const bills = get('hms_billing');
    const sub = [consultation_charges, bed_charges, medicine_charges, other_charges].reduce((s,v)=>s+parseFloat(v||0), 0);
    const total = Math.max(0, sub - parseFloat(discount||0));
    const newBill = {
      id: nextId(bills), bill_id: `BILL-${uid()}`,
      patient_id: parseInt(patient_id), admission_id: admission_id ? parseInt(admission_id) : null,
      consultation_charges: parseFloat(consultation_charges||0),
      bed_charges: parseFloat(bed_charges||0),
      medicine_charges: parseFloat(medicine_charges||0),
      other_charges: parseFloat(other_charges||0),
      discount: parseFloat(discount||0),
      total_amount: parseFloat(total.toFixed(2)),
      payment_method, payment_status: 'pending',
      created_at: new Date().toISOString(),
    };
    bills.push(newBill); set('hms_billing', bills); return newBill;
  },
  confirm(id) {
    const bills = get('hms_billing');
    const idx = bills.findIndex(b => b.id === parseInt(id));
    bills[idx].payment_status = 'paid'; set('hms_billing', bills); return bills[idx];
  },
  invoice(id) {
    const bill = get('hms_billing').find(b => b.id === parseInt(id));
    if (!bill) throw new Error('Bill not found');
    const pat = get('hms_patients').find(p => p.id === bill.patient_id);
    let adm = null;
    if (bill.admission_id) adm = admissionsAPI.get(bill.admission_id);
    return { ...bill, patient_name: pat?.full_name||'Unknown', patient_age: pat?.age||'', patient_gender: pat?.gender||'', patient_phone: pat?.phone_number||'', patient_blood_group: pat?.blood_group||'', admission: adm };
  },
  stats() {
    const bills = get('hms_billing');
    return {
      total_revenue: bills.filter(b=>b.payment_status==='paid').reduce((s,b)=>s+b.total_amount,0),
      pending: bills.filter(b=>b.payment_status==='pending').length,
      paid: bills.filter(b=>b.payment_status==='paid').length,
    };
  },
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────
export const reportsAPI = {
  patientReport() {
    const patients = get('hms_patients');
    const appts = get('hms_appointments');
    return patients.map(p => {
      const pAppts = appts.filter(a => a.patient_id === p.id);
      return { ...p, total_appointments: pAppts.length, last_visit: pAppts.length ? pAppts[pAppts.length-1].date : 'N/A' };
    });
  },
  billingReport() {
    return get('hms_billing').map(b => {
      const pat = get('hms_patients').find(p => p.id === b.patient_id);
      return { ...b, patient_name: pat?.full_name||'Unknown' };
    });
  },
  revenueReport() {
    const bills = get('hms_billing').filter(b => b.payment_status === 'paid');
    const byMonth = {};
    bills.forEach(b => {
      const m = b.created_at.slice(0,7);
      byMonth[m] = (byMonth[m]||0) + b.total_amount;
    });
    return Object.entries(byMonth).map(([month, revenue]) => ({ month, revenue })).sort((a,b)=>a.month.localeCompare(b.month));
  },
};
