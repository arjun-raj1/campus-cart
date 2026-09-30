'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addProduct } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export default function SellPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [curStep, setCurStep] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // If loading auth or not logged in, we can optionally render nothing to avoid flicker
  // but keeping it simple, the redirect will happen fast.

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    listingType: 'sell',
    price: '',
    deposit: '',
    description: '',
    seller: '',
    phone: '',
    pickupLocation: 'Main Library Entrance'
  });

  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  
  const fileInputRef = useRef(null);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(''), 3000);
  };

  const validate = (step) => {
    if (step === 1) {
      if (!formData.name.trim()) { showError('Product name is required.'); return false; }
      if (!formData.category) { showError('Please select a category.'); return false; }
      if (!formData.price || formData.price < 0) { showError('Enter a valid price.'); return false; }
      if (formData.listingType === 'rent' && (!formData.deposit || formData.deposit < 0)) { showError('Enter a valid security deposit.'); return false; }
    }
    if (step === 3) {
      if (!formData.seller.trim()) { showError('Your name is required.'); return false; }
      if (!/^\d{10}$/.test(formData.phone.trim())) { showError('Enter valid 10-digit phone.'); return false; }
      if (!formData.pickupLocation) { showError('Please select a campus pickup location.'); return false; }
    }
    return true;
  };

  const nextStep = (step) => {
    if (validate(step)) setCurStep(step + 1);
  };

  const prevStep = (step) => {
    setCurStep(step - 1);
  };

  const handleFile = (file) => {
    if (!file) return;
    setImage(file);
    const fr = new FileReader();
    fr.onload = (e) => setPreview(e.target.result);
    fr.readAsDataURL(file);
  };

  const clearImg = () => {
    setImage(null);
    setPreview('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!validate(3)) return;
    setIsSubmitting(true);
    
    const fd = new FormData();
    fd.append('name', formData.name.trim());
    fd.append('price', formData.price);
    fd.append('category', formData.category);
    fd.append('description', formData.description.trim());
    fd.append('seller', formData.seller.trim());
    fd.append('phone', formData.phone.trim());
    fd.append('listingType', formData.listingType);
    fd.append('deposit', formData.deposit);
    fd.append('pickupLocation', formData.pickupLocation);
    if (image) fd.append('image', image);

    try {
      await addProduct(fd);
      setSuccess(true);
    } catch (err) {
      showError(err.message || 'Cannot reach server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '16px' }}>✅</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Item Listed Successfully!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Your item is now live and secured under CampusCart Trust & Safety rules.</p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/" className="btn btn-primary" style={{ padding: '11px 26px' }}>Browse Marketplace</Link>
          <button onClick={() => {
            setSuccess(false);
            setCurStep(1);
            setFormData({ name: '', category: '', listingType: 'sell', price: '', deposit: '', description: '', seller: '', phone: '', pickupLocation: 'Main Library Entrance' });
            clearImg();
          }} className="btn btn-outline" style={{ padding: '11px 26px' }}>List Another</button>
        </div>
      </div>
    );
  }

  const styles = {
    frow: { marginBottom: '20px' },
    label: { display: 'block', marginBottom: '8px', fontSize: '0.82rem', fontWeight: '600', color: 'var(--text)' },
    input: {
      width: '100%', padding: '12px 14px', background: 'var(--input-bg)', border: '1.5px solid var(--border)',
      borderRadius: '9px', color: 'var(--text)', fontSize: '0.9rem', fontFamily: "'Outfit', sans-serif",
      outline: 'none', transition: 'border 0.3s, box-shadow 0.3s'
    }
  };

  return (
    <>
      <div style={{
        background: 'var(--hero-bg)', borderBottom: '1px solid var(--border)',
        padding: '48px 24px 36px', textAlign: 'center', position: 'relative', overflow: 'hidden',
        transition: 'background 0.3s'
      }}>
        <h1 style={{ fontSize: '2.2rem', fontWeight: '900', position: 'relative', zIndex: 1, textTransform: 'uppercase', letterSpacing: '2px', color: '#fff' }}>
          Securely List an Item
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.95rem', marginTop: '12px', position: 'relative', zIndex: 1 }}>
          Sell or Rent directly to verified students in safe campus zones.
        </p>
      </div>

      <div style={{ maxWidth: '560px', margin: '32px auto 0', paddingInline: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {[1, 2, 3].map((step) => (
            <div key={step} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
              {step < 3 && <div style={{ position: 'absolute', top: '16px', left: '50%', width: '100%', height: '2px', background: 'var(--border)', zIndex: 0 }}></div>}
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%', zIndex: 1,
                background: curStep === step ? 'var(--accent)' : (curStep > step ? 'var(--border)' : 'var(--surface)'),
                borderColor: curStep === step ? 'var(--accent)' : 'var(--border)',
                borderWidth: '2px', borderStyle: 'solid',
                color: curStep === step ? '#fff' : 'var(--text)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.8rem', fontWeight: '700', transition: 'all 0.3s'
              }}>{step}</div>
              <div style={{
                fontSize: '0.7rem', marginTop: '8px', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '1px',
                color: curStep === step ? 'var(--text)' : 'var(--muted)'
              }}>
                {step === 1 ? 'Details' : step === 2 ? 'Photo' : 'Handover'}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: '640px', margin: '28px auto', paddingInline: '24px', paddingBottom: '64px' }}>
        <div className="glass-card" style={{ padding: '32px' }}>
          
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--red)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem', marginBottom: '16px' }}>
              {error}
            </div>
          )}

          {curStep === 1 && (
            <div>
              <div style={styles.frow}>
                <label style={styles.label}>Listing Type <span style={{ color: 'var(--red)' }}>*</span></label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', flex: 1, background: formData.listingType === 'sell' ? 'rgba(16, 185, 129, 0.1)' : 'var(--input-bg)', borderColor: formData.listingType === 'sell' ? 'var(--accent)' : 'var(--border)' }}>
                    <input type="radio" name="listingType" value="sell" checked={formData.listingType === 'sell'} onChange={(e) => setFormData({...formData, listingType: e.target.value})} style={{ accentColor: 'var(--accent)' }}/> Sell Item
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', padding: '12px', border: '1px solid var(--border)', borderRadius: '8px', flex: 1, background: formData.listingType === 'rent' ? 'rgba(16, 185, 129, 0.1)' : 'var(--input-bg)', borderColor: formData.listingType === 'rent' ? 'var(--accent)' : 'var(--border)' }}>
                    <input type="radio" name="listingType" value="rent" checked={formData.listingType === 'rent'} onChange={(e) => setFormData({...formData, listingType: e.target.value})} style={{ accentColor: 'var(--accent)' }}/> Rent Item
                  </label>
                </div>
              </div>
              <div style={styles.frow}>
                <label style={styles.label}>Product Name <span style={{ color: 'var(--red)' }}>*</span></label>
                <input style={styles.input} placeholder="e.g. Lab Coat Size M, Circuit Board Kit…" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div style={styles.frow}>
                <label style={styles.label}>Category <span style={{ color: 'var(--red)' }}>*</span></label>
                <select style={styles.input} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                  <option value="">— Select Category —</option>
                  <option>Mechanical</option>
                  <option>Electrical</option>
                  <option>Electronics</option>
                  <option>Study Materials</option>
                  <option>Safety Gear</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ ...styles.frow, flex: 1 }}>
                  <label style={styles.label}>{formData.listingType === 'rent' ? 'Rental Price / Day' : 'Selling Price'} (₹) <span style={{ color: 'var(--red)' }}>*</span></label>
                  <input style={styles.input} type="number" min="0" placeholder="e.g. 250" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                {formData.listingType === 'rent' && (
                  <div style={{ ...styles.frow, flex: 1 }}>
                    <label style={styles.label}>Refundable Deposit (₹) <span style={{ color: 'var(--red)' }}>*</span></label>
                    <input style={styles.input} type="number" min="0" placeholder="e.g. 500" value={formData.deposit} onChange={e => setFormData({...formData, deposit: e.target.value})} />
                  </div>
                )}
              </div>
              <div style={styles.frow}>
                <label style={styles.label}>Description</label>
                <textarea style={{...styles.input, minHeight: '90px'}} placeholder="Describe condition, age, included accessories…" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <span></span>
                <button className="btn btn-primary" onClick={() => nextStep(1)}>Continue →</button>
              </div>
            </div>
          )}

          {curStep === 2 && (
            <div>
              <div style={styles.frow}>
                <label style={styles.label}>Product Photo (optional)</label>
                {!preview ? (
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={e => e.preventDefault()}
                    onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}
                    style={{
                      border: '2px dashed var(--border)', borderRadius: '12px', padding: '40px 20px',
                      textAlign: 'center', cursor: 'pointer', background: 'var(--input-bg)'
                    }}>
                    <div style={{ fontSize: '2.8rem', marginBottom: '10px', opacity: 0.8 }}>📷</div>
                    <p style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Drag & drop or <b style={{ color: 'var(--text)', textDecoration: 'underline' }}>browse</b> to choose</p>
                  </div>
                ) : (
                  <div style={{ position: 'relative', marginTop: '12px' }}>
                    <img src={preview} alt="Preview" style={{ width: '100%', maxHeight: '230px', objectFit: 'cover', borderRadius: '10px' }} />
                    <button onClick={clearImg} style={{
                      position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.75)', color: 'white',
                      border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', fontSize: '1rem'
                    }}>✕</button>
                  </div>
                )}
                <input type="file" ref={fileInputRef} accept="image/*" onChange={e => handleFile(e.target.files[0])} style={{ display: 'none' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-outline" onClick={() => prevStep(2)}>← Back</button>
                <button className="btn btn-primary" onClick={() => nextStep(2)}>Continue →</button>
              </div>
            </div>
          )}

          {curStep === 3 && (
            <div>
              <div style={{ background: 'rgba(16, 185, 129, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '24px' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--accent2)', fontWeight: '600' }}>🛡️ Trust & Safety Promise</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px' }}>For your safety, physical handovers must occur at verified campus safe zones.</p>
              </div>
              
              <div style={styles.frow}>
                <label style={styles.label}>Campus Safe Pickup Location <span style={{ color: 'var(--red)' }}>*</span></label>
                <select style={styles.input} value={formData.pickupLocation} onChange={e => setFormData({...formData, pickupLocation: e.target.value})}>
                  <option value="Main Library Entrance">Main Library Entrance</option>
                  <option value="Student Center Atrium">Student Center Atrium</option>
                  <option value="Block A Canteen">Block A Canteen</option>
                  <option value="Admin Block Security Desk">Admin Block Security Desk</option>
                  <option value="Hostel Gate">Hostel Gate</option>
                </select>
              </div>
              <div style={styles.frow}>
                <label style={styles.label}>Your Name <span style={{ color: 'var(--red)' }}>*</span></label>
                <input style={styles.input} placeholder="Your name or nickname" value={formData.seller} onChange={e => setFormData({...formData, seller: e.target.value})} />
              </div>
              <div style={styles.frow}>
                <label style={styles.label}>WhatsApp / Phone <span style={{ color: 'var(--red)' }}>*</span></label>
                <input style={styles.input} type="tel" placeholder="10-digit mobile number" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '28px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
                <button className="btn btn-outline" onClick={() => prevStep(3)}>← Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                  {isSubmitting ? 'Securing Listing…' : '🚀 Publish Safely'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
