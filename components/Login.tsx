import React, { useState } from 'react';
import { login, changePassword } from '../services/mockData';

const Login = ({ onLogin }: { onLogin: (token: string, user: any) => void }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mustChange, setMustChange] = useState(false);
  const [newPass, setNewPass] = useState('');
  const [newPassRepeat, setNewPassRepeat] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await login(user, pass);
      if (res.error) throw new Error(res.error);
      if (res.mustChange) {
        setMustChange(true);
        return;
      }
      if (res.token) {
        localStorage.setItem('authToken', res.token);
        onLogin(res.token, res.user);
      } else {
        throw new Error('No token returned');
      }
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  const submitChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    if (newPass.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres');
      setLoading(false);
      return;
    }
    if (newPass !== newPassRepeat) {
      setError('Las contraseñas nuevas no coinciden');
      setLoading(false);
      return;
    }
    try {
      const resp = await changePassword(user, pass, newPass);
      if (resp.error) throw new Error(resp.error);
      // after successful change, attempt login with new password
      const relog = await login(user, newPass);
      if (relog.error) throw new Error(relog.error);
      if (relog.token) {
        localStorage.setItem('authToken', relog.token);
        onLogin(relog.token, relog.user);
      } else {
        throw new Error('No token returned after password change');
      }
    } catch (err: any) {
      setError(String(err.message || err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      {!mustChange ? (
        <form onSubmit={submit} className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
          <h3 className="text-2xl font-bold mb-4">Iniciar Sesión</h3>
          {error && <div className="text-rose-600 mb-2">{error}</div>}
          <label className="block mb-3">
            <div className="text-sm font-bold text-slate-600 mb-1">Usuario</div>
            <input value={user} onChange={(e) => setUser(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          </label>
          <label className="block mb-4">
            <div className="text-sm font-bold text-slate-600 mb-1">Contraseña</div>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          </label>
          <div className="flex justify-end">
            <button disabled={loading} type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg">
              {loading ? 'Validando...' : 'Entrar'}
            </button>
          </div>
        </form>
      ) : (
        <form onSubmit={submitChange} className="w-full max-w-md bg-white p-8 rounded-2xl shadow">
          <h3 className="text-2xl font-bold mb-4">Cambio de contraseña requerido</h3>
          {error && <div className="text-rose-600 mb-2">{error}</div>}
          <p className="text-sm text-slate-500 mb-4">Tu cuenta requiere que cambies la contraseña antes de continuar.</p>
          <label className="block mb-3">
            <div className="text-sm font-bold text-slate-600 mb-1">Clave actual</div>
            <input type="password" value={pass} onChange={(e) => setPass(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          </label>
          <label className="block mb-3">
            <div className="text-sm font-bold text-slate-600 mb-1">Nueva clave</div>
            <input type="password" value={newPass} onChange={(e) => setNewPass(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          </label>
          <label className="block mb-4">
            <div className="text-sm font-bold text-slate-600 mb-1">Repetir nueva clave</div>
            <input type="password" value={newPassRepeat} onChange={(e) => setNewPassRepeat(e.target.value)} className="w-full px-4 py-3 border rounded-lg" />
          </label>
          <div className="flex justify-between items-center">
            <button type="button" onClick={() => setMustChange(false)} className="px-4 py-2 border rounded-lg">Cancelar</button>
            <button disabled={loading} type="submit" className="px-6 py-3 bg-indigo-600 text-white rounded-lg">{loading ? 'Procesando...' : 'Cambiar y Entrar'}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Login;
