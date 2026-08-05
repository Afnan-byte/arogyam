import React, { useState, useEffect } from 'react';
import { Pill, PlusCircle, Save, FileText, Search, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Prescriptions = () => {
  const [showForm, setShowForm] = useState(false);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { currentUser } = useAuth();

  // Form state
  const [patientName, setPatientName] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [medications, setMedications] = useState([{ name: '', dosage: '', frequency: '' }]);
  const [instructions, setInstructions] = useState('');
  
  useEffect(() => {
    if (currentUser) fetchPrescriptions();
  }, [currentUser]);

  const fetchPrescriptions = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, 'prescriptions'), where('doctorId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      const data = [];
      snapshot.forEach(doc => {
        data.push({ id: doc.id, ...doc.data() });
      });
      data.sort((a, b) => new Date(b.date) - new Date(a.date));
      setPrescriptions(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMedicine = () => {
    setMedications([...medications, { name: '', dosage: '', frequency: '' }]);
  };

  const handleMedicationChange = (index, field, value) => {
    const newMeds = [...medications];
    newMeds[index][field] = value;
    setMedications(newMeds);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName || !diagnosis) return toast.error('Please fill patient name and diagnosis');

    const tempId = 'temp-' + Date.now();
    const newPrescription = {
      id: tempId,
      doctorId: currentUser.uid,
      patientName,
      diagnosis,
      medications,
      instructions,
      date: new Date().toISOString()
    };

    // Instant optimistic update
    setPrescriptions(prev => [newPrescription, ...prev]);
    setShowForm(false);
    setPatientName('');
    setDiagnosis('');
    setMedications([{ name: '', dosage: '', frequency: '' }]);
    setInstructions('');
    toast.success('Prescription issued successfully!');

    // Async background sync
    try {
      const docRef = await addDoc(collection(db, 'prescriptions'), {
        doctorId: newPrescription.doctorId,
        patientName: newPrescription.patientName,
        diagnosis: newPrescription.diagnosis,
        medications: newPrescription.medications,
        instructions: newPrescription.instructions,
        date: newPrescription.date
      });
      setPrescriptions(prev => prev.map(p => p.id === tempId ? { ...p, id: docRef.id } : p));
    } catch (error) {
      console.error(error);
      toast.error('Failed to sync prescription to cloud');
      setPrescriptions(prev => prev.filter(p => p.id !== tempId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prescriptions & Tests</h1>
          <p className="text-gray-500 mt-1">Issue prescriptions and request blood tests for patients.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors"
        >
          {showForm ? 'Cancel' : <><PlusCircle className="h-4 w-4 mr-2" /> New Prescription</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-green-50/50 px-6 py-4 border-b border-green-100 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-green-900 flex items-center">
              <Pill className="w-5 h-5 mr-2 text-secondary" /> Write Prescription
            </h2>
          </div>
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <Search className="w-4 h-4 mr-1 text-gray-400" /> Patient Name
                </label>
                <input type="text" value={patientName} onChange={e=>setPatientName(e.target.value)} placeholder="e.g. John Doe" className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm border p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
                <input type="text" value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} placeholder="e.g. Viral Fever" className="w-full rounded-md border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary sm:text-sm border p-2" />
              </div>
            </div>

            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium text-gray-900 text-sm">Medications</h3>
                <button type="button" onClick={handleAddMedicine} className="text-secondary text-sm font-medium hover:text-green-700">+ Add Medicine</button>
              </div>
              
              {medications.map((med, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                  <div className="md:col-span-2">
                    <input type="text" value={med.name} onChange={e=>handleMedicationChange(index, 'name', e.target.value)} placeholder="Medicine Name" className="w-full rounded border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary text-sm border p-2" />
                  </div>
                  <div>
                    <input type="text" value={med.dosage} onChange={e=>handleMedicationChange(index, 'dosage', e.target.value)} placeholder="Dosage (e.g. 500mg)" className="w-full rounded border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary text-sm border p-2" />
                  </div>
                  <div>
                    <input type="text" value={med.frequency} onChange={e=>handleMedicationChange(index, 'frequency', e.target.value)} placeholder="Frequency (e.g. 1-0-1)" className="w-full rounded border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary text-sm border p-2" />
                  </div>
                </div>
              ))}
              <input type="text" value={instructions} onChange={e=>setInstructions(e.target.value)} placeholder="General Instructions (e.g. After food)" className="w-full rounded border-gray-300 shadow-sm focus:border-secondary focus:ring-secondary text-sm border p-2 mt-2" />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={submitting || !patientName || !diagnosis}
                className="bg-secondary hover:bg-green-600 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Issue Prescription
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Recent Prescriptions</h2>
        </div>
        
        {loading ? (
          <div className="p-10 text-center">
            <Loader2 className="w-8 h-8 text-secondary animate-spin mx-auto" />
            <p className="text-gray-500 mt-2">Loading prescriptions...</p>
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <Pill className="h-10 w-10 mx-auto text-gray-300 mb-2" />
            <p>No recent prescriptions issued.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {prescriptions.map(pres => (
              <div key={pres.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-gray-900">{pres.patientName}</h3>
                    <p className="text-sm text-gray-500">Diagnosis: {pres.diagnosis}</p>
                    <p className="text-xs text-gray-400 mt-1">{new Date(pres.date).toLocaleString()}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-700 uppercase mb-2">Medications</h4>
                  <ul className="space-y-1">
                    {pres.medications.map((m, i) => (
                      <li key={i} className="text-sm text-gray-600 flex items-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary mr-2"></span>
                        {m.name} - {m.dosage} ({m.frequency})
                      </li>
                    ))}
                  </ul>
                  {pres.instructions && (
                    <p className="text-sm text-gray-500 mt-2"><span className="font-semibold">Note:</span> {pres.instructions}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Prescriptions;
