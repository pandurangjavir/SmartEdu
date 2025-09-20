const axios = require('axios');
const { fetchMarksData, fetchAttendanceData, fetchFeesData } = require('./studentServiceController');

function includesAny(text, keywords) {
  const lower = (text || '').toLowerCase();
  return keywords.some(k => lower.includes(k));
}

function extractSubjectFromMessage(message) {
  const lower = message.toLowerCase();
  const subjects = ['subject1', 'subject2', 'subject3', 'subject4', 'subject5'];
  const subjectNames = ['math', 'physics', 'chemistry', 'english', 'computer', 'data structure', 'algorithm', 'database', 'network', 'software'];
  
  // Check for subject numbers
  for (let i = 1; i <= 5; i++) {
    if (lower.includes(`subject${i}`) || lower.includes(`subject ${i}`)) {
      return `subject${i}`;
    }
  }
  
  // Check for subject names (basic matching)
  for (const subject of subjectNames) {
    if (lower.includes(subject)) {
      // Return a generic subject identifier for name-based matching
      return 'subject_name';
    }
  }
  
  return null;
}

function extractSubjectNameToken(message) {
	const lower = (message || '').toLowerCase();
	const subjectTokens = ['math', 'physics', 'chemistry', 'english', 'computer', 'data', 'structure', 'algorithm', 'database', 'network', 'software'];
	for (const token of subjectTokens) {
		if (lower.includes(token)) return token;
	}
	return null;
}

function getSubjectShortLabel(name) {
  if (!name) return 'Subject';
  const trimmed = String(name).trim();
  // Use acronym of first letters if more than 2 words
  const words = trimmed.split(/\s+/);
  if (words.length >= 2) {
    const acronym = words.map(w => w[0]).join('').toUpperCase();
    if (acronym.length >= 2 && acronym.length <= 6) return acronym;
  }
  // Fallback to truncated name
  return trimmed.length > 12 ? trimmed.slice(0, 12) + '…' : trimmed;
}

function extractSemesterNumber(semesterValue) {
  if (!semesterValue) return null;
  const str = String(semesterValue).toLowerCase();
  const m = str.match(/(sem|semester)\s*(\d+)/);
  if (m && m[2]) return parseInt(m[2], 10);
  const n = str.match(/\b(\d{1,2})\b/);
  if (n) return parseInt(n[1], 10);
  return null;
}

function getActiveSemestersForDate(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth(); // 0-based
  const day = date.getDate();
  // Build boundary dates using local time
  const febStart = new Date(year, 1, 1); // Feb 1
  const junEnd = new Date(year, 5, 30, 23, 59, 59, 999); // Jun 30
  const julStart = new Date(year, 6, 1); // Jul 1
  const janEndNext = new Date(year + 1, 0, 30, 23, 59, 59, 999); // Jan 30 next year
  const janEndThis = new Date(year, 0, 30, 23, 59, 59, 999); // Jan 30 this year

  const isBetween = (d, start, end) => d.getTime() >= start.getTime() && d.getTime() <= end.getTime();

  if (isBetween(date, febStart, junEnd)) {
    // Feb 1 – Jun 30: even semesters are active
    return { set: [4, 6, 8], label: 'even' };
  }
  // If date is Jan, it's still even set per rule (1 July to 30 Jan)
  if (month === 0 && date.getTime() <= janEndThis.getTime()) {
    return { set: [4, 6, 8], label: 'even' };
  }
  if (isBetween(date, julStart, janEndNext)) {
    // Jul 1 – Jan 30: odd semesters are active
    return { set: [3, 5, 7], label: 'odd' };
  }
  // Fallback: choose odd set
  return { set: [3, 5, 7], label: 'odd' };
}

function detectSemesterFromMessage(message) {
  const lower = (message || '').toLowerCase();
  // Keywords for latest/new and old
  if (/\b(latest|new|current|recent)\s*(sem|semester)?\b/.test(lower)) {
    return { type: 'LATEST' };
  }
  if (/\b(old|previous|older|last)\s*(sem|semester)?\b/.test(lower)) {
    return { type: 'OLD' };
  }
  // sem7, sem-7, sem 7, semester 7
  const m = lower.match(/\b(sem|semester)[\s-]*(\d{1,2})\b/);
  if (m && m[2]) return { type: 'NUM', value: parseInt(m[2], 10) };
  // ordinal like 3rd
  const ord = lower.match(/\b(1st|2nd|3rd|4th|5th|6th|7th|8th)\b/);
  if (ord) {
    const map = { '1st':1,'2nd':2,'3rd':3,'4th':4,'5th':5,'6th':6,'7th':7,'8th':8 };
    return { type: 'NUM', value: map[ord[1]] || null };
  }
  // number words (seven, three, five, etc.)
  const wordMap = { one:1, two:2, three:3, four:4, five:5, six:6, seven:7, eight:8 };
  for (const [w, v] of Object.entries(wordMap)) {
    if (new RegExp(`\\b${w}\\b`).test(lower)) return { type: 'NUM', value: v };
  }
  // plain numbers as fallback
  const n = lower.match(/\b(\d{1,2})\b/);
  if (n) return { type: 'NUM', value: parseInt(n[1], 10) };
  return null;
}

function getLatestSemesterNumber(records) {
  const sems = (records || []).map(r => extractSemesterNumber(r.semester)).filter(n => typeof n === 'number');
  return sems.length ? Math.max(...sems) : null;
}

function getPreviousSemesterNumber(records) {
  const sems = (records || []).map(r => extractSemesterNumber(r.semester)).filter(n => typeof n === 'number');
  if (sems.length < 2) return null;
  const unique = Array.from(new Set(sems)).sort((a,b) => b - a);
  return unique[1] ?? null;
}

function filterRecordsBySubject(records, subjectKey, message) {
  if (!subjectKey) return records;
  
  if (subjectKey === 'subject_name') {
    // For subject names, we'll need to check the actual subject names in records
    const lower = message.toLowerCase();
    return records.filter(record => {
      const subjects = [record.subject1, record.subject2, record.subject3, record.subject4, record.subject5];
      return subjects.some(subject => subject && subject.toLowerCase().includes(lower.split(' ').find(word => 
        ['math', 'physics', 'chemistry', 'english', 'computer', 'data', 'structure', 'algorithm', 'database', 'network', 'software'].includes(word)
      )));
    });
  }
  
  // For specific subject numbers, filter records that have data for that subject
  return records.filter(record => {
    const subjectName = record[subjectKey];
    const subjectMarks = record[`${subjectKey}_marks`];
    return subjectName && subjectMarks !== null && subjectMarks !== undefined;
  });
}

function formatSubjectSpecificMarks(records, subjectKey) {
  if (!Array.isArray(records) || records.length === 0) {
    return `No marks found for the specified subject.`;
  }
  
  let response = `Subject-specific marks:\n\n`;
  records.forEach((record, index) => {
    response += `${index + 1}. ${record.exam_type || 'Exam'} (${record.semester || 'N/A'} - ${record.academic_year || 'N/A'})\n`;
    
    if (subjectKey === 'subject_name') {
      // Show all subjects for name-based search
      for (let i = 1; i <= 5; i++) {
        const subjectName = record[`subject${i}`];
        const subjectMarks = record[`subject${i}_marks`];
        const subjectTotal = record[`subject${i}_total`];
        if (subjectName && subjectMarks !== null && subjectMarks !== undefined) {
          response += `   Subject ${i}: ${subjectName} - ${subjectMarks}/${subjectTotal}\n`;
        }
      }
    } else {
      // Show specific subject
      const subjectName = record[subjectKey];
      const subjectMarks = record[`${subjectKey}_marks`];
      const subjectTotal = record[`${subjectKey}_total`];
      response += `   ${subjectName || 'N/A'} - ${subjectMarks || 'N/A'}/${subjectTotal || 'N/A'}\n`;
    }
    response += `   Total: ${record.total_marks || 'N/A'}/500 (${record.total_percentage?.toFixed ? record.total_percentage.toFixed(1) : record.total_percentage}%)\n\n`;
  });
  return response;
}

function summarizeRecordsForStudent(records, kind) {
  if (!Array.isArray(records) || records.length === 0) {
    return `No ${kind} records found.`;
  }
  
  if (kind === 'marks') {
    let response = `Your marks records:\n\n`;
    records.forEach((record, index) => {
      response += `${index + 1}. ${record.exam_type || 'Exam'} (${record.semester || 'N/A'} - ${record.academic_year || 'N/A'})\n`;
      response += `   Subject 1: ${record.subject1 || 'N/A'} - ${record.subject1_marks || 'N/A'}/${record.subject1_total || 'N/A'}\n`;
      response += `   Subject 2: ${record.subject2 || 'N/A'} - ${record.subject2_marks || 'N/A'}/${record.subject2_total || 'N/A'}\n`;
      response += `   Subject 3: ${record.subject3 || 'N/A'} - ${record.subject3_marks || 'N/A'}/${record.subject3_total || 'N/A'}\n`;
      response += `   Subject 4: ${record.subject4 || 'N/A'} - ${record.subject4_marks || 'N/A'}/${record.subject4_total || 'N/A'}\n`;
      response += `   Subject 5: ${record.subject5 || 'N/A'} - ${record.subject5_marks || 'N/A'}/${record.subject5_total || 'N/A'}\n`;
      response += `   Total: ${record.total_marks || 'N/A'}/500 (${record.total_percentage?.toFixed ? record.total_percentage.toFixed(1) : record.total_percentage}%)\n\n`;
    });
    return response;
  }
  
  if (kind === 'attendance') {
    let response = `Your attendance records:\n\n`;
    records.forEach((record, index) => {
      response += `${index + 1}. ${record.semester || 'N/A'} - ${record.academic_year || 'N/A'}\n`;
      response += `   Theory: ${record.subject1_theory || 'N/A'} (${record.subject1_theory_present || 'N/A'}/${record.subject1_theory_total || 'N/A'})\n`;
      response += `   Practical: ${record.subject1_practical || 'N/A'} (${record.subject1_practical_present || 'N/A'}/${record.subject1_practical_total || 'N/A'})\n`;
      response += `   Total: ${record.total_present || 'N/A'}/${record.total_classes || 'N/A'} (${record.total_percentage?.toFixed ? record.total_percentage.toFixed(1) : record.total_percentage}%)\n\n`;
    });
    return response;
  }
  
  if (kind === 'fees') {
    let response = `Your fees records:\n\n`;
    records.forEach((record, index) => {
      response += `${index + 1}. ${record.semester || 'N/A'} - ${record.academic_year || 'N/A'}\n`;
      response += `   Total Fees: ₹${record.total_fees || 'N/A'}\n`;
      response += `   Paid: ₹${record.paid_fees || 'N/A'}\n`;
      response += `   Remaining: ₹${record.remaining_fees || 'N/A'}\n`;
      response += `   Due Date: ${record.due_date || 'N/A'}\n\n`;
    });
    return response;
  }
  
  return `Here is your ${kind} data.`;
}

function summarizeRecordsForStaff(records, kind) {
  if (!Array.isArray(records) || records.length === 0) {
    return `No ${kind} records found.`;
  }
  // Provide a compact count summary for staff
  const count = records.length;
  return `Found ${count} ${kind} records across classes. Use the dashboard for detailed view.`;
}

function summarizeRecordsForStaffDetailed(records, kind) {
  if (!Array.isArray(records) || records.length === 0) {
    return `No ${kind} records found.`;
  }
  
  if (kind === 'marks') {
    let response = `All marks records (${records.length} total):\n\n`;
    records.forEach((record, index) => {
      response += `${index + 1}. ${record.student_name || 'Student'} (Roll: ${record.student_roll_no || 'N/A'}) - ${record.year || 'N/A'}\n`;
      response += `   ${record.exam_type || 'Exam'} (${record.semester || 'N/A'} - ${record.academic_year || 'N/A'})\n`;
      response += `   Subject 1: ${record.subject1 || 'N/A'} - ${record.subject1_marks || 'N/A'}/${record.subject1_total || 'N/A'}\n`;
      response += `   Subject 2: ${record.subject2 || 'N/A'} - ${record.subject2_marks || 'N/A'}/${record.subject2_total || 'N/A'}\n`;
      response += `   Subject 3: ${record.subject3 || 'N/A'} - ${record.subject3_marks || 'N/A'}/${record.subject3_total || 'N/A'}\n`;
      response += `   Subject 4: ${record.subject4 || 'N/A'} - ${record.subject4_marks || 'N/A'}/${record.subject4_total || 'N/A'}\n`;
      response += `   Subject 5: ${record.subject5 || 'N/A'} - ${record.subject5_marks || 'N/A'}/${record.subject5_total || 'N/A'}\n`;
      response += `   Total: ${record.total_marks || 'N/A'}/500 (${record.total_percentage?.toFixed ? record.total_percentage.toFixed(1) : record.total_percentage}%)\n\n`;
    });
    return response;
  }
  
  if (kind === 'attendance') {
    let response = `All attendance records (${records.length} total):\n\n`;
    records.forEach((record, index) => {
      response += `${index + 1}. ${record.student_name || 'Student'} (Roll: ${record.student_roll_no || 'N/A'}) - ${record.year || 'N/A'}\n`;
      response += `   ${record.semester || 'N/A'} - ${record.academic_year || 'N/A'}\n`;
      response += `   Theory: ${record.subject1_theory || 'N/A'} (${record.subject1_theory_present || 'N/A'}/${record.subject1_theory_total || 'N/A'})\n`;
      response += `   Practical: ${record.subject1_practical || 'N/A'} (${record.subject1_practical_present || 'N/A'}/${record.subject1_practical_total || 'N/A'})\n`;
      response += `   Total: ${record.total_present || 'N/A'}/${record.total_classes || 'N/A'} (${record.total_percentage?.toFixed ? record.total_percentage.toFixed(1) : record.total_percentage}%)\n\n`;
    });
    return response;
  }
  
  if (kind === 'fees') {
    let response = `All fees records (${records.length} total):\n\n`;
    records.forEach((record, index) => {
      response += `${index + 1}. ${record.student_name || 'Student'} (Roll: ${record.student_roll_no || 'N/A'}) - ${record.year || 'N/A'}\n`;
      response += `   ${record.semester || 'N/A'} - ${record.academic_year || 'N/A'}\n`;
      response += `   Total Fees: ₹${record.total_fees || 'N/A'}\n`;
      response += `   Paid: ₹${record.paid_fees || 'N/A'}\n`;
      response += `   Remaining: ₹${record.remaining_fees || 'N/A'}\n`;
      response += `   Due Date: ${record.due_date || 'N/A'}\n\n`;
    });
    return response;
  }
  
  return `Here are all ${kind} records.`;
}

function buildMarksTable(records, role, options = {}) {
	if (!Array.isArray(records) || records.length === 0) return null;
	// Determine a base record to derive subject names
	const baseRecord = options.baseRecord || records[0];
	const subjectColumns = [];
	for (let i = 1; i <= 5; i++) {
		const name = baseRecord[`subject${i}`];
		if (name) {
			subjectColumns.push({ key: `subject${i}_marks`, label: getSubjectShortLabel(name) });
		}
	}
	const leadingColsStudent = [
		{ key: 'student_roll_no', label: 'Roll No' },
		{ key: 'student_name', label: 'Name' }
	];
	const leadingColsStaff = [
		{ key: 'student_roll_no', label: 'Roll No' },
		{ key: 'student_name', label: 'Name' },
		{ key: 'year', label: 'Year' },
		...(options.includeSemester ? [{ key: 'semester', label: 'Semester' }] : [])
	];
	const trailingCols = [
		{ key: 'total_marks', label: 'Total' },
		{ key: 'total_percentage', label: 'Percentage' }
	];

	const columns = (role === 'student' ? leadingColsStudent : leadingColsStaff)
		.concat(subjectColumns)
		.concat(trailingCols);

	// Build rows; for student we may only want one latest record
	let source = Array.isArray(records) ? records : [];
	if (role === 'student' && options.oneRowOnly) {
		source = source.slice(0, 1);
	}
	const rows = source.map((record) => ({
		student_name: record.student_name || 'Student',
		student_roll_no: record.student_roll_no || record.roll_no || record.student_id || 'N/A',
		year: record.year || 'N/A',
		semester: record.semester || 'N/A',
		subject1_marks: record.subject1_marks ?? '-',
		subject2_marks: record.subject2_marks ?? '-',
		subject3_marks: record.subject3_marks ?? '-',
		subject4_marks: record.subject4_marks ?? '-',
		subject5_marks: record.subject5_marks ?? '-',
		total_marks: record.total_marks ?? '-',
		total_percentage: typeof record.total_percentage === 'number' ? Number(record.total_percentage.toFixed(1)) : (record.total_percentage ?? '-')
	}));

	if (rows.length === 0) return null;
	return { title: 'Marks', columns, rows };
}

function detectYearFromMessage(message) {
	const lower = (message || '').toLowerCase();
	if (/(\b|\s)(sy|second\s*year|2nd\s*year)(\b|\s)/.test(lower)) return 'SY';
	if (/(\b|\s)(ty|third\s*year|3rd\s*year)(\b|\s)/.test(lower)) return 'TY';
	if (/(\b|\s)(be|final\s*year|4th\s*year|fourth\s*year)(\b|\s)/.test(lower)) return 'BE';
	return null;
}

function filterMarksByYear(records, year) {
	if (!year) return records;
	return (records || []).filter(r => (r.year || '').toUpperCase() === year.toUpperCase());
}

function buildAttendanceTable(records, role) {
	if (!Array.isArray(records) || records.length === 0) return null;
	// Derive subject columns (theory/practical) dynamically based on available fields
	const deriveSubjectColumns = (rec) => {
		const cols = [];
		for (let i = 1; i <= 5; i++) {
			const tPresent = rec?.[`subject${i}_theory_present`];
			const tTotal = rec?.[`subject${i}_theory_total`];
			const pPresent = rec?.[`subject${i}_practical_present`];
			const pTotal = rec?.[`subject${i}_practical_total`];
			// Try to reuse marks subject short labels when available on same record
			const subjName = rec?.[`subject${i}`];
			const shortLabel = getSubjectShortLabel(subjName || `Subject ${i}`);
			if (tPresent !== undefined || tTotal !== undefined) cols.push({ key: `subject${i}_theory`, label: `${shortLabel} Th` });
			if (pPresent !== undefined || pTotal !== undefined) cols.push({ key: `subject${i}_practical`, label: `${shortLabel} Pr` });
		}
		return cols;
	};
	const sample = records[0] || {};
	const subjectCols = deriveSubjectColumns(sample);
	const columnsForStudent = [
		{ key: 'student_roll_no', label: 'Roll No' },
		{ key: 'student_name', label: 'Name' },
		...subjectCols,
		{ key: 'total', label: 'Total' },
		{ key: 'percentage', label: 'Percentage' }
	];
	const columnsForStaff = [
		{ key: 'student_roll_no', label: 'Roll No' },
		{ key: 'student_name', label: 'Name' },
		{ key: 'year', label: 'Year' },
		...subjectCols,
		{ key: 'total', label: 'Total' },
		{ key: 'percentage', label: 'Percentage' }
	];
	const columns = role === 'student' ? columnsForStudent : columnsForStaff;
	const rows = records.map(r => {
		const subjectValues = {};
		for (let i = 1; i <= 5; i++) {
			subjectValues[`subject${i}_theory`] = `${r[`subject${i}_theory_present`] ?? '-'} / ${r[`subject${i}_theory_total`] ?? '-'}`;
			subjectValues[`subject${i}_practical`] = `${r[`subject${i}_practical_present`] ?? '-'} / ${r[`subject${i}_practical_total`] ?? '-'}`;
		}
		const base = {
			student_roll_no: r.student_roll_no || r.roll_no || r.student_id || 'N/A',
			student_name: r.student_name || 'Student',
			...subjectValues,
			total: `${r.total_present ?? '-'} / ${r.total_classes ?? '-'}`,
			percentage: typeof r.total_percentage === 'number' ? Number(r.total_percentage.toFixed(1)) : r.total_percentage
		};
		if (role !== 'student') {
			return {
				student_roll_no: r.student_roll_no || r.student_id || 'N/A',
				student_name: r.student_name || 'Student',
				year: r.year || 'N/A',
				...base
			};
		}
		return base;
	});
	if (rows.length === 0) return null;
	return { title: 'Attendance', columns, rows };
}

function filterAttendanceByYear(records, year) {
	if (!year) return records;
	return (records || []).filter(r => (r.year || '').toUpperCase() === year.toUpperCase());
}

function buildFeesTable(records, role) {
	if (!Array.isArray(records) || records.length === 0) return null;
	const columnsForStudent = [
		{ key: 'student_roll_no', label: 'Roll No' },
		{ key: 'student_name', label: 'Name' },
		{ key: 'total_fees', label: 'Total Fees' },
		{ key: 'paid_fees', label: 'Paid' },
		{ key: 'remaining_fees', label: 'Remaining' },
		{ key: 'due_date', label: 'Due Date' }
	];
	const columnsForStaff = [
		{ key: 'student_roll_no', label: 'Roll No' },
		{ key: 'student_name', label: 'Name' },
		{ key: 'year', label: 'Year' },
		{ key: 'total_fees', label: 'Total Fees' },
		{ key: 'paid_fees', label: 'Paid' },
		{ key: 'remaining_fees', label: 'Remaining' },
		{ key: 'due_date', label: 'Due Date' }
	];
	const columns = role === 'student' ? columnsForStudent : columnsForStaff;
	const rows = records.map(r => {
		const base = {
			student_roll_no: r.student_roll_no || r.roll_no || r.student_id || 'N/A',
			student_name: r.student_name || 'Student',
			total_fees: r.total_fees ?? '-',
			paid_fees: r.paid_fees ?? '-',
			remaining_fees: r.remaining_fees ?? '-',
			due_date: r.due_date || 'N/A'
		};
		if (role !== 'student') {
			return {
				student_roll_no: r.student_roll_no || r.student_id || 'N/A',
				student_name: r.student_name || 'Student',
				year: r.year || 'N/A',
				...base
			};
		}
		return base;
	});
	if (rows.length === 0) return null;
	return { title: 'Fees', columns, rows };
}

function filterFeesByYear(records, year) {
	if (!year) return records;
	return (records || []).filter(r => (r.year || '').toUpperCase() === year.toUpperCase());
}

async function sendMessage(req, res) {
	try {
		const { message } = req.body;
		const { id, role, table } = req.user; // From JWT middleware
		
		if (!message) {
			return res.status(400).json({ msg: 'Message is required' });
		}

		// Intercept requests for marks/attendance/fees and answer with role-aware visibility
		if (includesAny(message, ['mark', 'result', 'score', 'record', 'all record', 'all records'])) {
			const data = await fetchMarksData(req.user);
			
			// Check if user is asking for specific subject
			const subjectKey = extractSubjectFromMessage(message);
			const requestedSemester = detectSemesterFromMessage(message);
			
			if (subjectKey && role === 'student') {
				// Filter records by subject and format specifically
				const filteredData = filterRecordsBySubject(data, subjectKey, message);
				const responseText = formatSubjectSpecificMarks(filteredData, subjectKey);
				const subjectNameToken = subjectKey === 'subject_name' ? extractSubjectNameToken(message) : null;
				const table = buildMarksTable(filteredData, role, { subjectKey, subjectNameToken });
				return res.json({ response: responseText, table, success: true });
			} else {
				// Show records
				if (role === 'student') {
					let filtered = data;
					if (requestedSemester) {
						filtered = (data || []).filter(r => extractSemesterNumber(r.semester) === requestedSemester);
					}
					// If no semester requested, default to latest semester only for students
					if (!requestedSemester && Array.isArray(filtered) && filtered.length > 0) {
						const semNumbers = filtered.map(r => extractSemesterNumber(r.semester)).filter(Boolean);
						const latestSem = semNumbers.length ? Math.max(...semNumbers) : null;
						if (latestSem) filtered = filtered.filter(r => extractSemesterNumber(r.semester) === latestSem);
					}
					if (requestedSemester && (!Array.isArray(filtered) || filtered.length === 0)) {
						let label = '';
						if (requestedSemester.type === 'NUM') label = `semester ${requestedSemester.value}`;
						if (requestedSemester.type === 'LATEST') label = 'latest semester';
						if (requestedSemester.type === 'OLD') label = 'previous semester';
						return res.json({ response: `Requested ${label} data not found yet.`, success: true });
					}
					// For student, show only one semester row at a time
					const table = buildMarksTable(filtered, role, { baseRecord: filtered[0], oneRowOnly: true });
					return res.json({ response: ``, table, success: true });
				} else {
					// For staff, optionally filter by requested year and subject
					const requestedYear = detectYearFromMessage(message);
					const subjectNameToken = extractSubjectNameToken(message);
					const subjectKeyStaff = extractSubjectFromMessage(message);
					let filtered = requestedYear ? filterMarksByYear(data, requestedYear) : data;
					if (subjectKeyStaff) {
						filtered = filterRecordsBySubject(filtered, subjectKeyStaff, message);
					}
					if (requestedSemester) {
						if (requestedSemester.type === 'NUM') {
							filtered = (filtered || []).filter(r => extractSemesterNumber(r.semester) === requestedSemester.value);
						} else if (requestedSemester.type === 'LATEST') {
							// Latest means current active set by college calendar
							const active = getActiveSemestersForDate(new Date()).set;
							filtered = (filtered || []).filter(r => active.includes(extractSemesterNumber(r.semester)));
						} else if (requestedSemester.type === 'OLD') {
							// Old means alternate set
							const active = getActiveSemestersForDate(new Date());
							const targetSet = active.label === 'odd' ? [4,6,8] : [3,5,7];
							filtered = (filtered || []).filter(r => targetSet.includes(extractSemesterNumber(r.semester)));
						}
					} else {
						// Default: use college calendar active set
						const activeSet = getActiveSemestersForDate(new Date()).set;
						filtered = (filtered || []).filter(r => activeSet.includes(extractSemesterNumber(r.semester)));
					}
					// Group into separate tables by (semester, year) for staff views
					const groupBySemYear = recs => (recs || []).reduce((acc, r) => {
						const sem = r.semester || 'Semester';
						const yr = (r.year || 'Year');
						const key = `${sem} - ${yr}`;
						(acc[key] = acc[key] || []).push(r);
						return acc;
					}, {});
					const grouped = groupBySemYear(filtered);
					const tables = Object.entries(grouped).map(([label, rows]) => {
						const t = buildMarksTable(rows, role, { subjectKey: subjectKeyStaff, subjectNameToken, includeSemester: false });
						return t && t.columns ? { ...t, title: `Marks - ${label}` } : null;
					}).filter(Boolean);
					const table = undefined;
					let header;
					if (requestedYear) {
						header = `Showing ${requestedYear} marks (${filtered.length} records).`;
					} else if (requestedSemester?.type === 'OLD') {
						header = `Previous semesters (alternate set) marks (${filtered.length} records).`;
					} else {
						header = `Current semester marks (${filtered.length} records).`;
					}
					header += ' Grouped by semester and year.';
					if (subjectKeyStaff) header += ' (filtered by subject)';
					if (requestedSemester?.type === 'NUM') header += ` (semester ${requestedSemester.value})`;
					if (requestedSemester?.type === 'LATEST') header += ' (latest semester)';
					if (requestedSemester?.type === 'OLD') header += ' (previous semester)';
					return res.json({ response: header, table, tables, success: true });
				}
			}
		}
		if (includesAny(message, ['attendance', 'attendence', 'present', 'absent'])) {
			const data = await fetchAttendanceData(req.user);
			const requestedSemester = detectSemesterFromMessage(message);
			if (role === 'student') {
				const responseText = summarizeRecordsForStudent(data, 'attendance');
				let filtered = data;
				if (requestedSemester?.type === 'NUM') {
					filtered = (filtered || []).filter(r => extractSemesterNumber(r.semester) === requestedSemester.value);
				} else if (!requestedSemester || requestedSemester.type === 'LATEST') {
					const sems = (filtered || []).map(r => extractSemesterNumber(r.semester)).filter(Boolean);
					const latest = sems.length ? Math.max(...sems) : null;
					if (latest) filtered = filtered.filter(r => extractSemesterNumber(r.semester) === latest);
				}
				if (requestedSemester?.type === 'NUM' && (!Array.isArray(filtered) || filtered.length === 0)) {
					return res.json({ response: `Requested semester ${requestedSemester.value} data not found yet.`, success: true });
				}
				const table = buildAttendanceTable(filtered, role);
				return res.json({ response: responseText, table, success: true });
			} else {
				const requestedYear = detectYearFromMessage(message);
				const filtered = requestedYear ? filterAttendanceByYear(data, requestedYear) : data;
				let further = filtered;
				if (requestedSemester?.type === 'NUM') {
					further = (further || []).filter(r => extractSemesterNumber(r.semester) === requestedSemester.value);
				} else if (requestedSemester?.type === 'LATEST') {
					const activeSet = getActiveSemestersForDate(new Date()).set;
					further = (further || []).filter(r => activeSet.includes(extractSemesterNumber(r.semester)));
				} else if (requestedSemester?.type === 'OLD') {
					const active = getActiveSemestersForDate(new Date());
					const targetSet = active.label === 'odd' ? [4,6,8] : [3,5,7];
					further = (further || []).filter(r => targetSet.includes(extractSemesterNumber(r.semester)));
				} else {
					const activeSet = getActiveSemestersForDate(new Date()).set;
					further = (further || []).filter(r => activeSet.includes(extractSemesterNumber(r.semester)));
				}
				// Group attendance by semester and year for staff
				const groupBySemYear = recs => (recs || []).reduce((acc, r) => {
					const sem = r.semester || 'Semester';
					const yr = (r.year || 'Year');
					const key = `${sem} - ${yr}`;
					(acc[key] = acc[key] || []).push(r);
					return acc;
				}, {});
				const grouped = groupBySemYear(further);
				const tables = Object.entries(grouped).map(([label, rows]) => {
					const t = buildAttendanceTable(rows, role);
					return t && t.columns ? { ...t, title: `Attendance - ${label}` } : null;
				}).filter(Boolean);
				const table = undefined;
				let header = requestedYear ? `Showing ${requestedYear} attendance (${further.length} records).` : (requestedSemester?.type === 'OLD' ? `Previous semesters (alternate set) attendance (${further.length} records).` : `Current semester attendance (${further.length} records).`);
				header += ' Grouped by semester and year.';
				if (requestedSemester?.type === 'NUM') header += ` (semester ${requestedSemester.value})`;
				if (requestedSemester?.type === 'LATEST') header += ' (latest semester)';
				if (requestedSemester?.type === 'OLD') header += ' (previous semester)';
				return res.json({ response: header, table, tables, success: true });
			}
		}
		if (includesAny(message, ['fee', 'payment', 'due'])) {
			const data = await fetchFeesData(req.user);
			const requestedSemester = detectSemesterFromMessage(message);
			if (role === 'student') {
				const responseText = summarizeRecordsForStudent(data, 'fees');
				let filtered = data;
				if (requestedSemester?.type === 'NUM') {
					filtered = (filtered || []).filter(r => extractSemesterNumber(r.semester) === requestedSemester.value);
				} else if (!requestedSemester || requestedSemester.type === 'LATEST') {
					const sems = (filtered || []).map(r => extractSemesterNumber(r.semester)).filter(Boolean);
					const latest = sems.length ? Math.max(...sems) : null;
					if (latest) filtered = filtered.filter(r => extractSemesterNumber(r.semester) === latest);
				}
				if (requestedSemester?.type === 'NUM' && (!Array.isArray(filtered) || filtered.length === 0)) {
					return res.json({ response: `Requested semester ${requestedSemester.value} data not found yet.`, success: true });
				}
				const table = buildFeesTable(filtered, role);
				return res.json({ response: responseText, table, success: true });
			} else {
				const requestedYear = detectYearFromMessage(message);
				const filtered = requestedYear ? filterFeesByYear(data, requestedYear) : data;
				let further = filtered;
				if (requestedSemester?.type === 'NUM') {
					further = (further || []).filter(r => extractSemesterNumber(r.semester) === requestedSemester.value);
				} else if (requestedSemester?.type === 'LATEST') {
					const activeSet = getActiveSemestersForDate(new Date()).set;
					further = (further || []).filter(r => activeSet.includes(extractSemesterNumber(r.semester)));
				} else if (requestedSemester?.type === 'OLD') {
					const active = getActiveSemestersForDate(new Date());
					const targetSet = active.label === 'odd' ? [4,6,8] : [3,5,7];
					further = (further || []).filter(r => targetSet.includes(extractSemesterNumber(r.semester)));
				} else {
					const activeSet = getActiveSemestersForDate(new Date()).set;
					further = (further || []).filter(r => activeSet.includes(extractSemesterNumber(r.semester)));
				}
				// Group fees by semester and year for staff
				const groupBySemYear = recs => (recs || []).reduce((acc, r) => {
					const sem = r.semester || 'Semester';
					const yr = (r.year || 'Year');
					const key = `${sem} - ${yr}`;
					(acc[key] = acc[key] || []).push(r);
					return acc;
				}, {});
				const grouped = groupBySemYear(further);
				const tables = Object.entries(grouped).map(([label, rows]) => {
					const t = buildFeesTable(rows, role);
					return t && t.columns ? { ...t, title: `Fees - ${label}` } : null;
				}).filter(Boolean);
				const table = undefined;
				let header = requestedYear ? `Showing ${requestedYear} fees (${further.length} records).` : (requestedSemester?.type === 'OLD' ? `Previous semesters (alternate set) fees (${further.length} records).` : `Current semester fees (${further.length} records).`);
				header += ' Grouped by semester and year.';
				if (requestedSemester?.type === 'NUM') header += ` (semester ${requestedSemester.value})`;
				return res.json({ response: header, table, tables, success: true });
			}
		}


		// Otherwise, forward to Rasa with rich user context (auto slot-filling)
        const rasaResponse = await axios.post('http://127.0.0.1:5005/webhooks/rest/webhook', {
			sender: `user_${id}`,
			message: message,
			metadata: {
				user_id: id,
				role,
				branch: req.user.branch,
				year: req.user.year,
				roll_no: req.user.roll_no,
				username: req.user.username,
                table,
                token: (req.headers && (req.headers.authorization || req.headers.Authorization)) || null
			}
		});

		const botResponse = rasaResponse.data[0]?.text || 'Sorry, I didn\'t understand that.';
		return res.json({ response: botResponse, success: true });

	} catch (error) {
		console.error('Chatbot error:', error);
		// Graceful fallback if Rasa is down so UI doesn't break
		if (error?.code === 'ECONNREFUSED') {
			return res.json({
				response: 'Chat service is temporarily unavailable. Please try again in a moment.',
				success: true
			});
		}
		return res.status(500).json({ 
			msg: 'Chatbot service unavailable',
			success: false 
		});
	}
}

module.exports = { sendMessage };
