import React, { useState, useEffect } from 'react';
import { Save, User, Droplet, AlertCircle, Activity, Pill, Phone, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const HealthProfile = () => {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies] = useState('');
  const [history, setHistory] = useState('');
  const [medications, setMedications] = useState('');
  const [contactName, setContactName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    if (currentUser) {
      setFullName(currentUser.displayName || '');
      fetchProfile();
    }
  }, [currentUser]);

  const fetchProfile = async () => {
    try {
      const docRef = doc(db, 'health_profiles', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        setFullName(data.fullName || currentUser.displayName || '');
        setDob(data.dob || '');
        setGender(data.gender || 'Male');
        setBloodGroup(data.bloodGroup || 'O+');
        setAllergies(data.allergies || '');
        setHistory(data.history || '');
        setMedications(data.medications || '');
        setContactName(data.contactName || '');
        setRelationship(data.relationship || '');
        setPhone(data.phone || '');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load health profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await setDoc(doc(db, 'health_profiles', currentUser.uid), {
        fullName,
        dob,
        gender,
        bloodGroup,
        allergies,
        history,
        medications,
        contactName,
        relationship,
        phone,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      toast.success('Health profile updated successfully');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Profile</h1>
          <p className="text-gray-500 mt-1">Manage your personal and medical information.</p>
        </div>
        <button 
          onClick={handleSubmit}
          disabled={saving}
          className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
          Save Changes
        </button>
      </div>

      <form className="space-y-6" onSubmit={handleSubmit}>
        {/* Personal Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center">
            <User className="h-5 w-5 text-primary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input type="text" value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID</label>
              <input type="text" value={currentUser?.uid?.substring(0, 8).toUpperCase() || 'N/A'} disabled className="w-full rounded-md border-gray-200 bg-gray-50 shadow-sm sm:text-sm border p-2 text-gray-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
              <input type="date" value={dob} onChange={e=>setDob(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select value={gender} onChange={e=>setGender(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2">
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Medical Info */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center">
            <Activity className="h-5 w-5 text-secondary mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Medical Details</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Droplet className="h-4 w-4 text-red-500 mr-1" /> Blood Group
              </label>
              <select value={bloodGroup} onChange={e=>setBloodGroup(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2">
                <option>A+</option><option>A-</option>
                <option>B+</option><option>B-</option>
                <option>O+</option><option>O-</option>
                <option>AB+</option><option>AB-</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <AlertCircle className="h-4 w-4 text-accent mr-1" /> Allergies
              </label>
              <input type="text" placeholder="e.g. Peanuts, Penicillin" value={allergies} onChange={e=>setAllergies(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Medical History / Chronic Conditions</label>
              <textarea rows={3} placeholder="Briefly describe any past surgeries or chronic conditions..." value={history} onChange={e=>setHistory(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"></textarea>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <Pill className="h-4 w-4 text-blue-500 mr-1" /> Current Medications
              </label>
              <textarea rows={2} placeholder="List any medications you are currently taking..." value={medications} onChange={e=>setMedications(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"></textarea>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center">
            <Phone className="h-5 w-5 text-red-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Emergency Contact</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
              <input type="text" value={contactName} onChange={e=>setContactName(e.target.value)} placeholder="e.g. Jane Doe" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <input type="text" value={relationship} onChange={e=>setRelationship(e.target.value)} placeholder="e.g. Mother" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input type="tel" value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+1 234 567 8900" className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default HealthProfile;

