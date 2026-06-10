// src/components/GirisEkrani.jsx

import React, { useState, useRef, useEffect } from 'react';
import { FiMail, FiLock } from 'react-icons/fi';
import auth, { login, register as registerUser, requestPasswordReset } from '../lib/auth';
import { neonConfigured } from '../lib/neon';

// setIsLoggedIn prop'unu App.jsx'ten alıyoruz
const GirisEkrani = ({ setIsLoggedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Validation & loading states
  const [loginErrors, setLoginErrors] = useState({});
  const [loginLoading, setLoginLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const forgotRef = useRef(null);

  const [showRegister, setShowRegister] = useState(false);
  const [registerData, setRegisterData] = useState({ name: '', email: '', password: '' });
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const registerRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (showForgot) closeForgot();
        if (showRegister) closeRegister();
      }
    };
    if (showForgot || showRegister) {
      document.addEventListener('keydown', onKey);
    }
    return () => document.removeEventListener('keydown', onKey);
  }, [showForgot, showRegister]);

  useEffect(() => {
    if (showForgot && forgotRef.current) {
      const focusable = forgotRef.current.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      focusable && focusable.focus();
    }
  }, [showForgot]);

  useEffect(() => {
    if (showRegister && registerRef.current) {
      const focusable = registerRef.current.querySelector('input, button, [tabindex]:not([tabindex="-1"])');
      focusable && focusable.focus();
    }
  }, [showRegister]);

  const handleModalKeyDown = (e, ref) => {
    if (e.key !== 'Tab' || !ref.current) return;
    const nodes = ref.current.querySelectorAll('a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])');
    const focusables = Array.prototype.slice.call(nodes).filter((el) => !el.hasAttribute('disabled'));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  // Accept common valid email patterns
  const validateEmail = (em) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);

  const useNeon = Boolean(neonConfigured);

  // Auth request handler
  const authRequest = async (action, payload) => {
    if (!useNeon) {
      // fallback mock for development without database
      return new Promise((resolve) => setTimeout(() => {
        if (action === 'forgot') resolve({ message: 'reset_sent' });
        else if (action === 'register') resolve({ user: { name: payload.name } });
        else if (action === 'login') resolve({ token: 'mock-token' });
        else resolve({});
      }, 900));
    }

    if (action === 'login') {
      return await login({ email: payload.email, password: payload.password });
    }

    if (action === 'register') {
      return await registerUser({
        email: payload.email,
        password: payload.password,
        name: payload.name
      });
    }

    if (action === 'forgot') {
      return await requestPasswordReset(payload.email);
    }

    return {};
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!email) errs.email = 'E-posta gerekli';
    else if (!validateEmail(email)) errs.email = 'Geçerli bir e-posta girin';
    if (!password) errs.password = 'Şifre gerekli';
    else if (password.length < 6) errs.password = 'Şifre en az 6 karakter olmalı';

    setLoginErrors(errs);
    if (Object.keys(errs).length) {
      // focus first invalid field
      if (errs.email) document.getElementById('login-email')?.focus();
      else if (errs.password) document.getElementById('login-password')?.focus();
      return;
    }

    setLoginLoading(true);
    try {
      await authRequest('login', { email, password });
      setIsLoggedIn(true);
    } catch (err) {
      alert('Giriş başarısız: ' + (err.message || 'Bir hata oluştu'));
    } finally {
      setLoginLoading(false);
    }
  };

  const openForgot = () => { setForgotError(''); setShowForgot(true); };
  const closeForgot = () => { setForgotEmail(''); setForgotError(''); setShowForgot(false); };
  const submitForgot = async (e) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotEmail) { setForgotError('E-posta girin'); document.getElementById('forgot-email')?.focus(); return; }
    if (!validateEmail(forgotEmail)) { setForgotError('Geçerli bir e-posta girin'); document.getElementById('forgot-email')?.focus(); return; }
    setForgotLoading(true);
    try {
      await authRequest('forgot', { email: forgotEmail });
      alert('Parola sıfırlama e-postası gönderildi.');
      closeForgot();
    } catch (err) {
      setForgotError(err.message || 'Bir hata oluştu');
    } finally { setForgotLoading(false); }
  };

  const openRegister = () => { setRegisterError(''); setShowRegister(true); };
  const closeRegister = () => { setRegisterData({ name: '', email: '', password: '' }); setRegisterError(''); setShowRegister(false); };
  const submitRegister = async (e) => {
    e.preventDefault();
    setRegisterError('');
    if (!registerData.name) { setRegisterError('İsim gerekli'); document.getElementById('reg-name')?.focus(); return; }
    if (!validateEmail(registerData.email)) { setRegisterError('Geçerli e-posta girin'); document.getElementById('reg-email')?.focus(); return; }
    if (!registerData.password || registerData.password.length < 6) { setRegisterError('Şifre en az 6 karakter olmalı'); document.getElementById('reg-pass')?.focus(); return; }

    setRegisterLoading(true);
    try {
      await authRequest('register', registerData);
      alert(`Hesap oluşturuldu. Hoşgeldiniz ${registerData.name}!`);
      closeRegister();
      setIsLoggedIn(true);
    } catch (err) {
      setRegisterError(err.message || 'Bir hata oluştu');
    } finally { setRegisterLoading(false); }
  };

  const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

  return (
    <div className="auth-page-container">

      {/* Kart Stili: Köşeli ve gölgeli kutu */}
      <div className="login-card auth-card" style={{ width: '380px' }}>

        {/* Logo ve Başlık */}
        <h3 className="auth-title">Budgetify</h3>
        <h4 className="small-muted" style={{ marginBottom: '20px' }}>Hoş Geldiniz!</h4>

        <form onSubmit={handleLogin} className="auth-form">
          {/* E-posta Alanı */}
          <div className="input-row" style={{ marginBottom: '14px' }}>
            <span className="input-icon"><FiMail /></span>
            <label htmlFor="login-email" className="sr-only">E-posta</label>
            <input
              id="login-email"
              className="auth-input"
              type="email"
              placeholder="Kullanıcı adı veya e-posta"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={loginErrors.email ? 'login-email-error' : undefined}
              required
            />
          </div>
          {loginErrors.email && <div id="login-email-error" className="field-error" role="alert">{loginErrors.email}</div>}

          {/* Şifre Alanı */}
          <div className="input-row" style={{ marginBottom: '20px' }}>
            <span className="input-icon"><FiLock /></span>
            <label htmlFor="login-password" className="sr-only">Şifre</label>
            <input
              id="login-password"
              className="auth-input"
              type="password"
              placeholder="Şifre"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-describedby={loginErrors.password ? 'login-password-error' : undefined}
              required
            />
          </div>
          {loginErrors.password && <div id="login-password-error" className="field-error" role="alert">{loginErrors.password}</div>}

          {/* Giriş Butonu */}
          <button type="submit" className="green-button full-width" style={{ margin: '6px 0 14px' }} disabled={loginLoading}>
            {loginLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" className="link-button small-muted" onClick={openForgot} style={{ background: 'transparent', border: 'none', padding: 0, textDecoration: 'none', fontSize: '14px', cursor: 'pointer' }}>Şifremi unuttum</button>
            <button type="button" className="secondary-button" style={{ marginLeft: 'auto' }} onClick={openRegister}>Hesap Oluştur</button>
          </div>
        </form>
      </div>

      {/* Modals */}
      {showForgot && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="forgot-title" aria-describedby="forgot-desc">
          <div className="modal" ref={forgotRef} onKeyDown={(e) => handleModalKeyDown(e, forgotRef)}>
            <h4 id="forgot-title">Şifre Sıfırlama</h4>
            <p id="forgot-desc" className="small-muted">E-posta adresinizi girin, size sıfırlama linki göndereceğiz.</p>
            <form onSubmit={submitForgot} style={{ marginTop: 12 }}>
              <label className="sr-only" htmlFor="forgot-email">E-posta</label>
              <input id="forgot-email" aria-describedby={forgotError ? 'forgot-error' : undefined} className="modal-input" type="email" placeholder="E-posta" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} />
              {forgotError && <div id="forgot-error" className="field-error" role="alert" style={{ marginTop: 8 }}>{forgotError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button type="submit" className="green-button" disabled={forgotLoading}>{forgotLoading ? 'Gönderiliyor...' : 'Gönder'}</button>
                <button type="button" className="secondary-button" onClick={closeForgot} disabled={forgotLoading}>Kapat</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showRegister && (
        <div className="modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="register-title" aria-describedby="register-desc">
          <div className="modal" ref={registerRef} onKeyDown={(e) => handleModalKeyDown(e, registerRef)}>
            <h4 id="register-title">Hesap Oluştur</h4>
            <p id="register-desc" className="small-muted">Hesabınızı oluşturmak için bilgileri girin.</p>
            <form onSubmit={submitRegister} style={{ marginTop: 12 }}>
              <label className="sr-only" htmlFor="reg-name">Ad Soyad</label>
              <input id="reg-name" className="modal-input" name="name" placeholder="Ad Soyad" value={registerData.name} onChange={handleRegisterChange} />
              <label className="sr-only" htmlFor="reg-email">E-posta</label>
              <input id="reg-email" className="modal-input" name="email" type="email" placeholder="E-posta" value={registerData.email} onChange={handleRegisterChange} />
              <label className="sr-only" htmlFor="reg-pass">Şifre</label>
              <input id="reg-pass" className="modal-input" name="password" type="password" placeholder="Şifre" value={registerData.password} onChange={handleRegisterChange} />
              {registerError && <div id="register-error" className="field-error" role="alert" style={{ marginTop: 8 }}>{registerError}</div>}
              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="green-button" type="submit" disabled={registerLoading}>{registerLoading ? 'Oluşturuluyor...' : 'Oluştur'}</button>
                <button type="button" className="secondary-button" onClick={closeRegister} disabled={registerLoading}>İptal</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default GirisEkrani;