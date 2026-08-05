import React, { useState, useEffect, useCallback } from 'react';
import { PlusCircle, FileText, Clock, CheckCircle, Loader2, Printer, GraduationCap, BookOpen, X } from 'lucide-react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const IllRegister = () => {
  const [showForm, setShowForm] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReportForPrint, setSelectedReportForPrint] = useState(null);
  const { currentUser, userName } = useAuth();

  // Form State
  const [symptoms, setSymptoms] = useState([]);
  const [date, setDate] = useState('');
  const [courseDetails, setCourseDetails] = useState('');
  const [classesMissed, setClassesMissed] = useState('');
  const [details, setDetails] = useState('');

  const availableSymptoms = ['Fever', 'Cough', 'Headache', 'Stomach ache', 'Body pain', 'Vomiting'];

  const getCleanStudentName = () => {
    if (userName && !userName.includes('@')) return userName;
    if (currentUser?.displayName && !currentUser.displayName.includes('@')) return currentUser.displayName;
    if (currentUser?.email) {
      const part = currentUser.email.split('@')[0];
      return part.charAt(0).toUpperCase() + part.slice(1);
    }
    return 'Student';
  };

  const fetchReports = useCallback(async () => {
    if (!currentUser) return;
    
    // Load local cache immediately to prevent vanishing on refresh
    const cacheKey = 'arogyam_illness_reports_' + currentUser.uid;
    const cachedData = localStorage.getItem(cacheKey);
    if (cachedData) {
      try {
        setReports(JSON.parse(cachedData));
        setLoading(false);
      } catch (e) {
        console.error("Cache parse error", e);
      }
    } else {
      setLoading(true);
    }

    try {
      const q = query(collection(db, 'illness_reports'), where('studentId', '==', currentUser.uid));
      const snapshot = await getDocs(q);
      let data = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));

      // Fallback: search by studentName / email if studentId query yields 0
      if (data.length === 0 && currentUser.email) {
        try {
          const qFallback = query(collection(db, 'illness_reports'), where('studentName', '==', currentUser.email));
          const snapshotFallback = await getDocs(qFallback);
          snapshotFallback.forEach(doc => {
            if (!data.some(d => d.id === doc.id)) data.push({ id: doc.id, ...doc.data() });
          });
        } catch (err) {
          console.error("Fallback query error", err);
        }
      }

      data.sort((a, b) => new Date(b.createdAt || b.date || 0) - new Date(a.createdAt || a.date || 0));
      setReports(data);
      localStorage.setItem(cacheKey, JSON.stringify(data));
    } catch (error) {
      console.error(error);
      if (!cachedData) toast.error('Failed to load reports from cloud');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleSymptomToggle = (symp) => {
    if (symptoms.includes(symp)) {
      setSymptoms(symptoms.filter(s => s !== symp));
    } else {
      setSymptoms([...symptoms, symp]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (symptoms.length === 0 || !date || !courseDetails || !classesMissed) {
      return toast.error('Please provide symptoms, date, course details, and classes missed');
    }

    const studentName = getCleanStudentName();
    const tempId = 'temp-' + Date.now();
    const newReport = {
      id: tempId,
      studentId: currentUser.uid,
      studentName: studentName,
      symptoms: symptoms.join(', '),
      date,
      courseDetails,
      classesMissed,
      details,
      status: 'Pending',
      doctor: 'Unassigned',
      createdAt: new Date().toISOString()
    };

    // Instant optimistic update + cache
    const cacheKey = 'arogyam_illness_reports_' + currentUser.uid;
    const updatedReports = [newReport, ...reports];
    setReports(updatedReports);
    localStorage.setItem(cacheKey, JSON.stringify(updatedReports));

    setShowForm(false);
    setSymptoms([]);
    setDate('');
    setCourseDetails('');
    setClassesMissed('');
    setDetails('');
    toast.success('Illness report submitted!');

    // Async background sync
    try {
      const docRef = await addDoc(collection(db, 'illness_reports'), {
        studentId: newReport.studentId,
        studentName: newReport.studentName,
        symptoms: newReport.symptoms,
        date: newReport.date,
        courseDetails: newReport.courseDetails,
        classesMissed: newReport.classesMissed,
        details: newReport.details,
        status: newReport.status,
        doctor: newReport.doctor,
        createdAt: newReport.createdAt
      });
      // Replace tempId with actual firestore ID silently
      setReports(prev => {
        const synced = prev.map(r => r.id === tempId ? { ...r, id: docRef.id } : r);
        localStorage.setItem(cacheKey, JSON.stringify(synced));
        return synced;
      });
    } catch (error) {
      console.error(error);
      toast.error('Cloud sync failed. Reverting report.');
      setReports(prev => {
        const reverted = prev.filter(r => r.id !== tempId);
        localStorage.setItem(cacheKey, JSON.stringify(reverted));
        return reverted;
      });
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" /> Approved</span>;
      case 'Pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
    }
  };

  const formatDisplayName = (name) => {
    if (!name || name.includes('@')) {
      return getCleanStudentName();
    }
    return name;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ill Register</h1>
          <p className="text-gray-500 mt-1">Report illness to campus health center and apply for medical leave.</p>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors shadow-sm"
        >
          {showForm ? 'Cancel' : <><PlusCircle className="h-4 w-4 mr-2" /> Report Illness</>}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-blue-50/50 px-6 py-4 border-b border-blue-100">
            <h2 className="text-lg font-semibold text-blue-900">New Illness Report</h2>
          </div>
          <form className="p-6 space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Primary Symptoms</label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  {availableSymptoms.map(symp => (
                    <label key={symp} className="flex items-center space-x-2 text-sm text-gray-600 border rounded-md p-2 hover:bg-gray-50 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={symptoms.includes(symp)}
                        onChange={() => handleSymptomToggle(symp)}
                        className="rounded text-primary focus:ring-primary" 
                      />
                      <span>{symp}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Onset</label>
                  <input type="date" value={date} onChange={e=>setDate(e.target.value)} className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <GraduationCap className="w-4 h-4 mr-1 text-primary" /> Course / Branch Details
                  </label>
                  <input 
                    type="text" 
                    value={courseDetails} 
                    onChange={e=>setCourseDetails(e.target.value)} 
                    placeholder="e.g. B.Tech CSE (5th Semester)" 
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                    <BookOpen className="w-4 h-4 mr-1 text-primary" /> Classes / Subjects Missed
                  </label>
                  <input 
                    type="text" 
                    value={classesMissed} 
                    onChange={e=>setClassesMissed(e.target.value)} 
                    placeholder="e.g. 4 classes (Data Structures, Networks)" 
                    className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2" 
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Additional Details</label>
                  <textarea value={details} onChange={e=>setDetails(e.target.value)} rows={2} placeholder="Please describe how you are feeling..." className="w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm border p-2"></textarea>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <button 
                type="submit" 
                disabled={submitting || symptoms.length === 0 || !date || !courseDetails || !classesMissed}
                className="bg-primary hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium flex items-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Submit Report
              </button>
            </div>
          </form>
        </div>
      )}

      {/* History Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center">
            <FileText className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900">Illness History</h2>
          </div>
          <span className="text-xs text-gray-400 font-medium">Print certificate available upon doctor approval</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Symptoms</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Classes Missed</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center">
                    <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto" />
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-10 text-center text-gray-500">
                    No illness reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4 text-sm font-medium text-gray-900 whitespace-nowrap">{report.date}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{report.courseDetails || 'N/A'}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{report.symptoms}</td>
                    <td className="py-4 px-4 text-sm text-gray-600">{report.classesMissed || 'N/A'}</td>
                    <td className="py-4 px-4 text-sm text-gray-500">{report.doctor}</td>
                    <td className="py-4 px-4 whitespace-nowrap">{getStatusBadge(report.status)}</td>
                    <td className="py-4 px-4 text-right whitespace-nowrap">
                      {report.status === 'Approved' ? (
                        <button
                          onClick={() => setSelectedReportForPrint(report)}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center transition-colors shadow-sm"
                        >
                          <Printer className="w-3.5 h-3.5 mr-1" /> Print Certificate
                        </button>
                      ) : (
                        <span className="text-xs text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md font-medium border border-amber-200/80">
                          Awaiting Doctor Review
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Medical Leave Certificate Modal */}
      {selectedReportForPrint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:p-0 print:static print:bg-white print:z-auto overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-auto max-h-[90vh] flex flex-col relative print:shadow-none print:w-full print:max-w-none print:p-0 print:border-none print:max-h-none overflow-hidden">
            {/* Control Bar (Sticky Top) */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-white sticky top-0 z-10 print:hidden shrink-0">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Medical Leave Approval Certificate</h3>
                <p className="text-xs text-gray-500">Ready for official printing and presentation.</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors shadow"
                >
                  <Printer className="w-4 h-4" /> Print Document
                </button>
                <button
                  onClick={() => setSelectedReportForPrint(null)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Certificate Document Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6 print:p-0 print:overflow-visible">
              {/* Institution Header */}
              <div className="text-center border-b pb-6 border-gray-200">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img src="/logo.jpeg" alt="Arogyam Logo" className="h-12 w-auto object-contain rounded-lg shadow-sm" />
                  <h1 className="text-2xl font-black text-gray-900 uppercase tracking-wide">Arogyam Campus Health Center</h1>
                </div>
                <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Official Medical Absence & Leave Sanction Certificate</p>
                <p className="text-xs text-gray-400 mt-1 font-mono">Ref No: AHC-ML-{selectedReportForPrint.id?.substring(0, 8).toUpperCase()}</p>
              </div>

              {/* Document Body */}
              <div className="space-y-4 text-sm text-gray-800 leading-relaxed">
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium pb-2 border-b border-gray-100">
                  <span>ISSUED TO: Academic Affairs & Department Office</span>
                  <span>DATE: {new Date().toLocaleDateString()}</span>
                </div>

                <p className="font-bold text-gray-900 uppercase text-xs tracking-wider">TO WHOM IT MAY CONCERN,</p>
                
                <p>
                  This is to certify that student <span className="font-bold text-gray-900 underline decoration-primary underline-offset-2">{formatDisplayName(selectedReportForPrint.studentName)}</span> (ID: <span className="font-mono text-gray-900 font-bold">{selectedReportForPrint.studentId?.substring(0, 8).toUpperCase()}</span>) of <span className="font-bold text-gray-900">{selectedReportForPrint.courseDetails || 'Campus Program'}</span> has been officially evaluated by the Campus Health Services.
                </p>

                <div className="bg-gray-50/80 rounded-xl p-4 border border-gray-200 space-y-3 my-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Date of Medical Onset</span>
                      <span className="font-bold text-gray-900">{selectedReportForPrint.date}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Sanction Status</span>
                      <span className="font-bold text-emerald-700 flex items-center mt-0.5"><CheckCircle className="w-4 h-4 mr-1 inline" /> APPROVED LEAVE</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Course / Branch</span>
                      <span className="font-semibold text-gray-900">{selectedReportForPrint.courseDetails || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Classes / Subjects Missed</span>
                      <span className="font-bold text-gray-900">{selectedReportForPrint.classesMissed || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Diagnosed Symptoms</span>
                      <span className="font-semibold text-gray-900">{selectedReportForPrint.symptoms}</span>
                    </div>
                  </div>
                  {selectedReportForPrint.details && (
                    <div className="pt-2 border-t border-gray-200/60">
                      <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">Clinical Notes</span>
                      <span className="text-gray-700 italic">{selectedReportForPrint.details}</span>
                    </div>
                  )}
                </div>

                <p>
                  The student was advised rest and treatment for the illness. It is recommended that academic attendance exemption be granted for the missed classes noted above.
                </p>
              </div>

              {/* Signatures & Seal */}
              <div className="pt-8 flex justify-between items-end border-t border-gray-200 mt-6">
                <div className="text-center">
                  <div className="w-24 h-12 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-[10px] text-gray-400 font-semibold uppercase tracking-tighter">
                    OFFICIAL SEAL
                  </div>
                  <p className="text-[11px] text-gray-500 mt-1 font-medium">Campus Health Center</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-gray-900 text-base">{selectedReportForPrint.doctor || 'Chief Medical Officer'}</p>
                  <p className="text-xs text-gray-500 font-medium">Authorized Medical Officer</p>
                  <p className="text-[10px] text-gray-400 mt-1">Arogyam Healthcare System</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IllRegister;
