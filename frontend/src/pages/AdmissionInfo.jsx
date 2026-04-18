import React, { useState, useEffect } from 'react';
import {
  AcademicCapIcon,
  CurrencyDollarIcon,
  PhoneIcon,
  CalendarIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  BuildingOfficeIcon,
  TrophyIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const SectionHeader = ({ icon: Icon, title, color = 'blue' }) => {
  const colorMap = {
    blue: 'text-blue-500',
    green: 'text-emerald-500',
    yellow: 'text-amber-500',
    purple: 'text-purple-500',
    red: 'text-rose-500',
    indigo: 'text-indigo-500',
  };
  return (
    <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
      <Icon className={`h-8 w-8 ${colorMap[color]}`} />
      {title}
    </h2>
  );
};

const AdmissionInfo = () => {
  const [admissionData, setAdmissionData] = useState(null);
  const [feeData, setFeeData] = useState(null);
  const [contactData, setContactData] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState('COMPUTER');
  const [selectedCategory, setSelectedCategory] = useState('OPEN (NON-EBC)');
  const [includeHostel, setIncludeHostel] = useState(false);
  const [includeTransport, setIncludeTransport] = useState(false);
  const [calculatedFees, setCalculatedFees] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([
      fetchData('/api/admission/info', setAdmissionData),
      fetchData('/api/admission/fees', setFeeData),
      fetchData('/api/admission/contacts', setContactData),
    ]).finally(() => setLoading(false));
  }, []);

  const fetchData = async (url, setter) => {
    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) setter(data.data);
    } catch (e) {
      console.error(`Failed to load ${url}:`, e);
    }
  };

  const calculateFees = async () => {
    try {
      const params = new URLSearchParams({
        branch: selectedBranch,
        year: '1',
        includeHostel: includeHostel.toString(),
        includeTransport: includeTransport.toString(),
        category: selectedCategory,
      });
      const res = await fetch(`/api/admission/fees/calculate?${params}`);
      const data = await res.json();
      if (data.success) {
        setCalculatedFees(data.calculation);
        toast.success('Fee calculation done!');
      }
    } catch (e) {
      toast.error('Could not calculate fees');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-indigo-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading admission information...</p>
        </div>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: '🏫 Overview' },
    { id: 'courses', label: '🎓 Courses' },
    { id: 'fees', label: '💳 Fees' },
    { id: 'eligibility', label: '📋 Eligibility' },
    { id: 'process', label: '📅 Process' },
    { id: 'documents', label: '📄 Documents' },
    { id: 'scholarships', label: '🎁 Scholarships' },
    { id: 'contacts', label: '📞 Contacts' },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Hero */}
      <div className="relative mb-8 bg-gradient-to-r from-indigo-700 via-purple-700 to-blue-700 rounded-2xl p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjIiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')] opacity-40" />
        <div className="relative z-10 text-center">
          <div className="text-4xl mb-3">🏛️</div>
          <h1 className="text-3xl font-black mb-2">SKN Sinhgad College of Engineering</h1>
          <p className="text-indigo-200 font-semibold text-lg">Korti, Pandharpur, Solapur</p>
          <p className="text-sm text-indigo-300 mt-1">AICTE Approved • Affiliated to Solapur University • {admissionData?.academic_year || '2025-26'}</p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            {admissionData?.placement && (
              <>
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                  <p className="font-bold text-xl">{admissionData.placement.highestPackage}</p>
                  <p className="text-indigo-200 text-xs">Highest Package</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                  <p className="font-bold text-xl">{admissionData.placement.averagePackage}</p>
                  <p className="text-indigo-200 text-xs">Avg Package</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2">
                  <p className="font-bold text-xl">{admissionData.placement.placedStudents}</p>
                  <p className="text-indigo-200 text-xs">Students Placed</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-thin">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-indigo-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && admissionData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">🏫 College At A Glance</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Established</span>
                <span className="font-semibold">{admissionData.established_year}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Campus Area</span>
                <span className="font-semibold">{admissionData.campus_area_acres}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Type</span>
                <span className="font-semibold">{admissionData.institute_type}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Programs</span>
                <span className="font-semibold">{admissionData.general_info?.programs_offered || '6 UG + 4 PG'}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Website</span>
                <a href={admissionData.contact?.website} target="_blank" rel="noreferrer" className="font-semibold text-indigo-600 hover:underline">sknscoe.ac.in</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Email</span>
                <span className="font-semibold">{admissionData.contact?.email}</span>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">🏆 Placements 2023-24</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Highest Package</span>
                <span className="font-bold text-emerald-600 text-base">{admissionData.placement?.highestPackage}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Average Package</span>
                <span className="font-bold text-emerald-600">{admissionData.placement?.averagePackage}</span>
              </div>
              <div className="flex justify-between border-b pb-2">
                <span className="text-gray-500">Students Placed</span>
                <span className="font-semibold">{admissionData.placement?.placedStudents}</span>
              </div>
              <div>
                <p className="text-gray-500 mb-2">Top Recruiters</p>
                <div className="flex flex-wrap gap-1.5">
                  {admissionData.placement?.topRecruiters?.map(r => (
                    <span key={r} className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-lg font-medium">{r}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Courses */}
      {activeTab === 'courses' && admissionData && (
        <div className="space-y-8">
          <div>
            <SectionHeader icon={AcademicCapIcon} title="Undergraduate (B.Tech) Programmes" color="blue" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {admissionData.branches?.map((branch) => (
                <div key={branch.code} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow hover:border-indigo-200">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 text-lg">🎓</div>
                  <h3 className="font-bold text-gray-900 mb-3 text-sm leading-snug">{branch.name}</h3>
                  <div className="space-y-1.5 text-xs text-gray-600">
                    <div className="flex justify-between"><span>Duration:</span><span className="font-semibold">{branch.duration}</span></div>
                    <div className="flex justify-between"><span>Intake:</span><span className="font-semibold text-indigo-600">{branch.intake} seats</span></div>
                    <div className="flex justify-between"><span>Entrance:</span><span className="font-semibold">{branch.entranceExam}</span></div>
                    <div className="flex justify-between"><span>Choice Code:</span><span className="font-mono text-xs">{branch.code}</span></div>
                    {branch.tfws_code && <div className="flex justify-between"><span>TFWS Code:</span><span className="font-mono text-xs text-green-600">{branch.tfws_code}</span></div>}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {admissionData.pg_courses?.length > 0 && (
            <div>
              <SectionHeader icon={AcademicCapIcon} title="Postgraduate (M.Tech) Programmes" color="purple" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {admissionData.pg_courses.map((course, idx) => (
                  <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                    <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-lg shrink-0">🔬</div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">{course.course_name}</h4>
                      <p className="text-xs text-gray-500 mt-1">Intake: <strong>{course.intake} seats</strong> • Code: {course.course_code}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Fees */}
      {activeTab === 'fees' && feeData && (
        <div className="space-y-8">
          {/* CAP Fee Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100">
              <SectionHeader icon={CurrencyDollarIcon} title="B.Tech Fee Structure 2025-26 (CAP Seats)" color="yellow" />
              <p className="text-sm text-gray-500 -mt-4">Category-wise annual fees approved by Government of Maharashtra</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {['Category', 'Tuition Fees', 'Development Fees', 'Total Fees/Year'].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wide">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {feeData.cap_fees_ug?.map((row, i) => (
                    <tr key={i} className="hover:bg-blue-50/30 transition-colors">
                      <td className="px-5 py-3 font-semibold text-gray-900">{row.category}</td>
                      <td className="px-5 py-3 text-gray-700">₹{row.tuition_fees?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 text-gray-700">₹{row.development_fees?.toLocaleString('en-IN')}</td>
                      <td className="px-5 py-3 font-bold text-indigo-700">₹{row.total_fees?.toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-amber-50 border-t border-amber-100 text-xs text-amber-800">
              ⚠️ {feeData.note || 'All fees are subject to government norms. Scholarship schemes are eligible for reserved categories.'}
            </div>
          </div>

          {/* Institute Level Fees */}
          {feeData.institute_level_ug && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">🏢 Institute Level Seats (Management Quota)</h3>
              <div className="grid grid-cols-3 gap-4">
                {['tuition_fees', 'development_fees', 'total_fees'].map((key) => (
                  <div key={key} className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-black text-indigo-600">₹{feeData.institute_level_ug[key]?.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-500 mt-1 capitalize">{key.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">+ Caution Money Deposit: ₹2,000 (Refundable)</p>
            </div>
          )}

          {/* Hostel Fees */}
          {feeData.hostelFees && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">🏠 Hostel & Mess Fees</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(feeData.hostelFees).map(([key, val]) => (
                  <div key={key} className="bg-emerald-50 rounded-xl p-4 text-center">
                    <p className="text-xl font-black text-emerald-700">₹{Number(val).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-600 mt-1 capitalize">{key.replace(/_/g, ' ')}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fee Calculator */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">🧮 Fee Calculator</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Select Branch</label>
                  <select value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                    {feeData.feeStructure && Object.entries(feeData.feeStructure).map(([code, info]) => (
                      <option key={code} value={code}>{info.branch}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500">
                    {feeData.cap_fees_ug?.map(row => (
                      <option key={row.category} value={row.category}>{row.category}</option>
                    ))}
                  </select>
                </div>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={includeHostel} onChange={e => setIncludeHostel(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                  Include Hostel + Mess Fees (₹45,708/yr)
                </label>
                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={includeTransport} onChange={e => setIncludeTransport(e.target.checked)} className="w-4 h-4 text-indigo-600 rounded" />
                  Include Transport Fees (₹15,000/yr)
                </label>
                <button onClick={calculateFees}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all shadow-md">
                  Calculate Estimated Fees
                </button>
              </div>
              {calculatedFees && (
                <div className="bg-gray-50 rounded-xl p-5">
                  <h4 className="font-bold text-gray-900 mb-3">Fee Breakdown</h4>
                  <div className="space-y-2 text-sm">
                    {Object.entries(calculatedFees.breakdown).map(([key, val]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-200">
                        <span className="text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                        <span className="font-semibold">₹{Number(val).toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-lg font-black text-indigo-700 pt-2">
                      <span>Total Estimated Fees</span>
                      <span>₹{Number(calculatedFees.totalFees).toLocaleString('en-IN')}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">* Category: {calculatedFees.category}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Eligibility */}
      {activeTab === 'eligibility' && admissionData?.eligibility && (
        <div className="space-y-6">
          {Object.entries(admissionData.eligibility).map(([level, categories]) => (
            <div key={level} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4 capitalize">{level.replace(/_/g, ' ')}</h3>
              {Object.entries(categories).map(([cat, criteria]) => (
                <div key={cat} className="mb-4">
                  <h4 className="text-sm font-semibold text-indigo-700 mb-2 capitalize">{cat.replace(/_/g, ' ')}</h4>
                  <ul className="space-y-2">
                    {Array.isArray(criteria) && criteria.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <CheckCircleIcon className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Process */}
      {activeTab === 'process' && admissionData?.admissionProcess && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={CalendarIcon} title="Admission Process 2025-26" color="green" />
          <div className="space-y-5 relative">
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-indigo-100" />
            {admissionData.admissionProcess.map((step) => (
              <div key={step.step} className="flex items-start gap-4 relative pl-12">
                <div className="absolute left-0 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                  {step.step}
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="font-bold text-gray-900">{step.title}</h3>
                  <p className="text-gray-600 text-sm mt-1">{step.description}</p>
                  <p className="text-sm text-indigo-600 font-medium mt-1">⏰ {step.deadline}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Documents */}
      {activeTab === 'documents' && admissionData?.requiredDocuments && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <SectionHeader icon={DocumentTextIcon} title="Required Documents" color="purple" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {admissionData.requiredDocuments.map((doc, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-indigo-50 transition-colors">
                <CheckCircleIcon className="h-5 w-5 text-emerald-500 shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{doc}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
            ⚠️ <strong>Please bring originals + 2 attested photocopies</strong> of all documents on the day of reporting.
          </div>
        </div>
      )}

      {/* Tab: Scholarships */}
      {activeTab === 'scholarships' && admissionData?.scholarshipSchemes && (
        <div className="space-y-6">
          {admissionData.scholarshipSchemes.map((scheme, idx) => (
            <div key={idx} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-lg">🏅</div>
                <h3 className="font-bold text-gray-900">{scheme.department}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {scheme.schemes?.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-2.5 bg-amber-50 rounded-xl text-sm">
                    <span className="text-amber-600">✦</span>
                    <span className="text-gray-700">{s}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-sm text-emerald-800">
            💡 <strong>TFWS (Tuition Fee Waiver Scheme)</strong>: 100% tuition fee waiver for eligible SC/ST students. Contact Accounts Section at <strong>+91 9423536913</strong> for details.
          </div>
        </div>
      )}

      {/* Tab: Contacts */}
      {activeTab === 'contacts' && contactData && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-bold text-lg text-gray-900 mb-4">🏢 Admission Office</h3>
            <div className="space-y-3 text-sm">
              <p><strong>Phone:</strong> {contactData.admissionOffice?.phone}</p>
              <p><strong>Email:</strong> {contactData.admissionOffice?.email}</p>
              <p><strong>Address:</strong> {contactData.admissionOffice?.address}</p>
              <p><strong>Working Hours:</strong> {contactData.admissionOffice?.workingHours}</p>
              <a href={contactData.website} target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-1 text-indigo-600 hover:underline font-medium">
                <GlobeAltIcon className="h-4 w-4" /> {contactData.website}
              </a>
            </div>
          </div>
          {contactData.principal && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">👨‍💼 Principal</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center text-2xl">👨‍🏫</div>
                <div>
                  <p className="font-bold text-gray-900">{contactData.principal.name}</p>
                  <p className="text-sm text-gray-500">{contactData.principal.title}</p>
                  <p className="text-sm text-indigo-600">{contactData.principal.email}</p>
                </div>
              </div>
            </div>
          )}
          {contactData.branchCoordinators && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-lg text-gray-900 mb-4">📞 Department Contacts</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {Object.entries(contactData.branchCoordinators).map(([dept, info]) => (
                  <div key={dept} className="flex items-center gap-3 p-3 border-l-4 border-indigo-400 bg-gray-50 rounded-r-xl">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">{dept}</p>
                      <p className="text-indigo-600 text-sm">{info.phone}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdmissionInfo;
