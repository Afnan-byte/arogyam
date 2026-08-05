import React, { useState, useEffect } from 'react';
import { Pill, Search, Package, Loader2 } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Medicines = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [prescriptions, setPrescriptions] = useState([]);
  const [deliveryRequests, setDeliveryRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Get Prescriptions (using patientName naive match for now since doctor module didn't save ID)
      const qRx = query(collection(db, 'prescriptions'), where('patientName', '==', currentUser.displayName || currentUser.email || currentUser.name));
      const rxSnap = await getDocs(qRx);
      const rxData = [];
      rxSnap.forEach(doc => rxData.push({ id: doc.id, ...doc.data() }));
      setPrescriptions(rxData);

      // Get Deliveries
      const qDel = query(collection(db, 'delivery_requests'), where('studentId', '==', currentUser.uid));
      const delSnap = await getDocs(qDel);
      const delData = [];
      delSnap.forEach(doc => delData.push({ id: doc.id, ...doc.data() }));
      setDeliveryRequests(delData);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load medicines data');
    } finally {
      setLoading(false);
    }
  };

  const requestDelivery = async (rxId) => {
    try {
      await addDoc(collection(db, 'delivery_requests'), {
        studentId: currentUser.uid,
        prescriptionId: rxId,
        status: 'Requested',
        date: new Date().toISOString()
      });
      toast.success('Delivery requested');
      fetchData();
    } catch (error) {
      toast.error('Failed to request delivery');
    }
  };

  const filteredRx = prescriptions.filter(rx => 
    rx.diagnosis?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Medicines</h1>
          <p className="text-gray-500 mt-1">View prescriptions and request campus delivery.</p>
        </div>
        <div className="relative w-full sm:w-64">
          <input 
            type="text" 
            placeholder="Search prescriptions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary text-sm"
          />
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prescriptions List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">My Prescriptions</h2>
          
          {loading ? (
             <div className="p-10 text-center bg-white rounded-xl border border-gray-100">
               <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
             </div>
          ) : filteredRx.length === 0 ? (
             <div className="p-10 text-center text-gray-500 bg-white rounded-xl border border-gray-100">
               No prescriptions found.
             </div>
          ) : (
            filteredRx.map((rx) => {
              const hasRequested = deliveryRequests.some(d => d.prescriptionId === rx.id);
              
              return (
              <div key={rx.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:border-gray-300 transition-colors">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-blue-100 text-primary`}>
                    <Pill className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Rx For: {rx.diagnosis} <span className="text-sm font-normal text-gray-500 ml-2">| {new Date(rx.date).toLocaleDateString()}</span></h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {rx.medications?.map((med, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {med.name} {med.dosage}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div>
                  {!hasRequested ? (
                    <button onClick={() => requestDelivery(rx.id)} className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-colors">
                      <Package className="h-4 w-4 mr-2" /> Request Delivery
                    </button>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Delivery Requested
                    </span>
                  )}
                </div>
              </div>
            )})
          )}
        </div>

        {/* Delivery Tracking */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Delivery Status</h2>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            {deliveryRequests.length > 0 ? (
              <div className="space-y-6">
                {deliveryRequests.map(req => (
                  <div key={req.id} className="relative pl-6 border-l-2 border-primary pb-2">
                    <div className="absolute w-3 h-3 bg-primary rounded-full -left-[7px] top-1"></div>
                    <h4 className="text-sm font-bold text-gray-900">{req.status}</h4>
                    <p className="text-xs text-gray-400 mt-1">{new Date(req.date).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <Package className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No active deliveries.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Medicines;
